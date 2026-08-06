/**
 * High-level client for the Alvin Imaging System.
 *
 * The API is topology-shaped, mirroring the backend's internal domain model:
 * a client has stations (port / starboard / pilot); a station has cameras, a
 * recorder, and a router. Consumers ask for a station, then either issue
 * semantic commands ("set this camera's ISO") or subscribe to typed event
 * channels (heartbeats, receipts, connection status). Nothing here knows
 * about React or Redux, and nothing outside this library knows the wire
 * protocol is Socket.IO.
 */

import { v4 as uuidv4 } from "uuid";
import type { Socket } from "socket.io-client";
import { createConnectionPool } from "./connection-pool";
import type { ConnectionPool } from "./connection-pool";
import {
  ACTIONS,
  EVENTS,
  NAMESPACE_ROOT,
  NAMESPACE_SYSTEM,
  RECORD_STOP,
  WHITE_BALANCE_ONE_PUSH_TRIGGER,
  buildCameraCommand,
  getStationInfo,
} from "./protocol";
import { COMMAND_KINDS, CommandFailedError } from "./commands";
import type { CommandKind } from "./commands";
import type { StationId, StationIdInput } from "./protocol";
import type { FocusControl, ZoomControl } from "./domain";
import type {
  CommandResult,
  ConnectionStatusEvent,
  SentCommand,
  Unsubscribe,
  WsEndpoints,
} from "./types";
import type {
  CameraArrayEntry,
  CameraCommandBody,
  CameraSettingsPayload,
  CommandReceipt,
  NavHeartbeat,
  RouterPortEntry,
  SensorHeartbeat,
  SystemMessage,
} from "./wire";
import {
  normalizeCamHeartbeat,
  normalizeCameraSettings,
  normalizeRecorderHeartbeat,
} from "./telemetry";
import type {
  CamHeartbeat,
  CameraSettings,
  RecorderHeartbeat,
} from "./telemetry";

const V1 = "1";
const V1_5 = "1.5";

/** Upper bound on unacknowledged commands tracked per station. */
const MAX_PENDING_ACKS = 256;

/**
 * Command kinds safe to drop first when the pending-ack table overflows:
 * high-rate fire-and-forget drives whose individual receipts nobody waits
 * on. Evicting these first means a pan/tilt burst can never orphan a
 * still-pending meaningful receipt (camera select, record).
 */
const EVICTABLE_COMMAND_KINDS: ReadonlySet<CommandKind> = new Set([
  COMMAND_KINDS.PAN_TILT,
  COMMAND_KINDS.FOCUS,
  COMMAND_KINDS.ZOOM,
]);

/**
 * How long a connection opened just to carry a command (no acquire held)
 * lingers before it is released. Long enough for the emit to flush after
 * connect; short enough that an unadopted connection doesn't leak.
 */
const SEND_CONNECTION_LINGER_MS = 30_000;

/** Context shared by station-level commands. */
export interface CommandContext {
  /** The station's active camera; becomes the payload's `camera` field. */
  activeCamera?: string | null;
}

export interface RecordOptions extends CommandContext {
  /**
   * Override for the previously recorded camera's ID, which the legacy
   * protocol requires on non-delegated record-source commands. When
   * omitted, the library resolves it from the recorder's own telemetry.
   */
  previousCamera?: string | null;
  /**
   * Pilot only: delegate the recording to an observer station. The library
   * doesn't police the target; the backend honors only observer stations.
   */
  as?: StationId;
}

export interface CameraHandle {
  readonly id: string | null;
  setIso(value: string): SentCommand;
  setShutter(value: string): SentCommand;
  setIris(value: string): SentCommand;
  setExposureMode(value: string): SentCommand;
  setFocusMode(value: string): SentCommand;
  setWhiteBalance(value: string): SentCommand;
  /** Fire an armed one-push white balance (see WHITE_BALANCE_MODES.ONE_PUSH). */
  triggerOnePushWhiteBalance(): SentCommand;
  /** Drive focus with a FOCUS_CONTROLS value; STOP ends a continuous move. */
  focus(control: FocusControl | string): SentCommand;
  /**
   * Drive zoom with a ZOOM_CONTROLS value; STOP ends a continuous move.
   * Speed applies only to the continuous controls.
   */
  zoom(control: ZoomControl | string, speed?: number): SentCommand;
  /** Joystick pan/tilt; `value` is the nipplejs-shaped move descriptor. */
  panTilt(value: unknown): SentCommand;
  /**
   * Trigger a single still capture now. `transferImage` requests the image
   * be transferred off the vehicle.
   */
  captureStill(options?: { transferImage?: boolean }): SentCommand;
  /**
   * Set the recurring still-capture interval, in seconds as a string
   * (e.g. "20"); "0" stops the recurring capture.
   */
  setCaptureInterval(seconds: string): SentCommand;
}

export interface Station {
  readonly id: StationId;
  /**
   * Pin this station's connection open. Every subscription pins it too;
   * hold an acquire() for the lifetime of a UI that issues commands so the
   * good-bye/disconnect only happens when the station is truly idle.
   */
  acquire(): Unsubscribe;
  camera(id: string | null): CameraHandle;

  // Commands
  selectCamera(cameraId: string, context?: CommandContext): SentCommand;
  record(cameraId: string, options?: RecordOptions): SentCommand;
  stopRecording(options?: Omit<RecordOptions, "previousCamera">): SentCommand;
  takeRoute(input: string, output: string, context?: CommandContext): SentCommand;
  /** Escape hatch for actions without a dedicated method. */
  send(body: CameraCommandBody, context?: CommandContext): SentCommand;

  // Incoming channels; each returns an unsubscribe function.
  onCamHeartbeat(cb: (msg: CamHeartbeat) => void): Unsubscribe;
  onRecorderHeartbeat(cb: (msg: RecorderHeartbeat) => void): Unsubscribe;
  /**
   * Fires when the station's recorder starts a new clip, with the recorded
   * camera's display name as the recorder reports it. Detection rides the
   * recorder heartbeat (a new filename while recording); the first
   * heartbeat after subscribing only establishes the baseline, so a
   * recording already in progress does not fire. The pilot's own recorder
   * heartbeat carries no per-clip filename, so this never fires for it.
   */
  onRecordingStarted(cb: (camera: string) => void): Unsubscribe;
  onConnectionStatus(cb: (event: ConnectionStatusEvent) => void): Unsubscribe;
  onCameraList(cb: (cameras: CameraArrayEntry[]) => void): Unsubscribe;
  onRouterInputs(cb: (inputs: RouterPortEntry[]) => void): Unsubscribe;
  onRouterOutputs(cb: (outputs: RouterPortEntry[]) => void): Unsubscribe;
  onCameraSettings(cb: (msg: CameraSettings) => void): Unsubscribe;
  /**
   * Fires once per settled command — the same outcome that resolves or
   * rejects the command's promise. This is the single feed for shared-state
   * mirrors (promises are for call-site-local flow). Subscribing does not
   * pin the station's connection; delivery rides the command send path.
   * Commands evicted past the pending cap (256 outstanding) never produce
   * a result.
   *
   * `shouldDeliver`, if given, filters at the source: results for which it
   * returns false are dropped before `cb` runs. A subscriber that only
   * mirrors a few command kinds can skip the high-frequency ones (pan/tilt
   * at 10 Hz, focus, zoom) entirely rather than being invoked and no-op'ing.
   */
  onCommandResult(
    cb: (result: CommandResult) => void,
    shouldDeliver?: (result: CommandResult) => boolean
  ): Unsubscribe;
}

export interface ImagingClientOptions {
  /** Endpoint table; defaults to reading window.WS_ENDPOINTS lazily. */
  endpoints?: WsEndpoints | (() => WsEndpoints);
  /** Injectable for deterministic tests. */
  uuid?: () => string;
  now?: () => Date;
}

export interface ImagingClient {
  station(stationId: StationIdInput): Station;

  // Vehicle-wide channels
  onNavHeartbeat(cb: (msg: NavHeartbeat) => void): Unsubscribe;
  onSensorHeartbeat(cb: (msg: SensorHeartbeat) => void): Unsubscribe;
  /** v1.5 system alerts (buffered alerts replay on connect server-side). */
  onSystemMessage(cb: (msg: SystemMessage) => void): Unsubscribe;

  // v1.5 REST
  restartEncoder(name: string): Promise<void>;
  rebootEncoder(name: string): Promise<void>;
  /**
   * Fire-and-forget restart of the imaging server host (the page's own
   * host). Opaque no-cors request; resolves without a readable response.
   */
  restartServer(): Promise<void>;

  /**
   * Hard teardown of every connection this client owns, without the
   * per-namespace good-bye. Intended for tests and full shutdowns; the
   * shared client normally lives for the page's lifetime.
   */
  close(): void;
}

function defaultEndpoints(): WsEndpoints {
  return (globalThis as { WS_ENDPOINTS?: WsEndpoints }).WS_ENDPOINTS as WsEndpoints;
}

/**
 * The incoming `newCameraCommand` event multiplexes several server message
 * shapes; anything that is not a recognized broadcast is treated as a
 * command receipt, matching the historical dispatch order.
 */
function isBroadcastShape(msg: object): boolean {
  return (
    "current_settings" in msg ||
    "camera_array" in msg ||
    "router_output_array" in msg ||
    "router_input_array" in msg
  );
}

/** The wire's observerSideOverride field speaks namespace names. */
function delegationTarget(station: StationId): "port" | "stbd" {
  return getStationInfo(station).namespace as "port" | "stbd";
}

export function createImagingClient(options: ImagingClientOptions = {}): ImagingClient {
  const getEndpoints =
    typeof options.endpoints === "function"
      ? options.endpoints
      : options.endpoints !== undefined
        ? () => options.endpoints as WsEndpoints
        : defaultEndpoints;
  const uuid = options.uuid ?? uuidv4;
  const now = options.now ?? (() => new Date());

  const pool: ConnectionPool = createConnectionPool(getEndpoints);

  // Sockets that have emitted at least one lifecycle event. Used by
  // onConnectionStatus to replay a disconnected state to late subscribers:
  // a fresh socket's first event is always imminent, so it gets no replay,
  // but a pooled socket mid-outage must not look like "no news yet".
  const everActiveSockets = new WeakSet<Socket>();

  function subscribe(
    namespace: string,
    apiVersion: string,
    event: string,
    handler: (...args: any[]) => void
  ): Unsubscribe {
    const { socket, release } = pool.acquire(namespace, apiVersion);
    socket.on(event, handler);
    return () => {
      try {
        socket.off(event, handler);
      } catch (_) {
        /* socket may already be gone */
      }
      release();
    };
  }

  function createStation(id: StationId): Station {
    const info = getStationInfo(id);
    const namespacePath = info.namespacePath;

    interface CommandResultSubscriber {
      cb: (result: CommandResult) => void;
      shouldDeliver?: (result: CommandResult) => boolean;
    }
    const commandResultCallbacks = new Set<CommandResultSubscriber>();

    interface PendingCommand {
      kind: CommandKind | null;
      payload: SentCommand["payload"];
      resolve: (result: CommandResult) => void;
      reject: (error: Error) => void;
    }
    const pendingAcks = new Map<string, PendingCommand>();

    // The socket most recently used for sending. After the station's last
    // reference is released and its connection torn down, stray sends (e.g.
    // a debounced stop firing after a UI unmounts) go to this dead socket,
    // where socket.io buffers them forever — the same silent swallow the
    // legacy hook had — instead of resurrecting the connection.
    let lastSendSocket: Socket | null = null;

    // Station-level telemetry the command builders draw on: the camera
    // list (to resolve the recorder's display names to camera IDs) and the
    // recorder's current source.
    let latestCameraList: CameraArrayEntry[] = [];
    let latestRecorderSource: string | null = null;

    // These listeners ride on whatever socket currently backs this
    // namespace, without holding a reference of their own. Sockets are
    // recreated when the pool entry cycles, so track attachment per socket
    // instance.
    const stationListenersAttached = new WeakSet<Socket>();
    function ensureStationListeners(socket: Socket) {
      if (stationListenersAttached.has(socket)) return;
      stationListenersAttached.add(socket);
      socket.on(EVENTS.recorderHeartbeat, (msg) => {
        const heartbeat = normalizeRecorderHeartbeat(msg);
        // Only the observer-shaped heartbeat names the recorder's source.
        if ("isRecording" in heartbeat) {
          latestRecorderSource = heartbeat.camera ?? null;
        }
      });
      socket.on(EVENTS.newCameraCommand, (msg: unknown) => {
        if (!msg || typeof msg !== "object") return;
        if (isBroadcastShape(msg)) {
          if ("camera_array" in msg) {
            latestCameraList = (msg as { camera_array: CameraArrayEntry[] })
              .camera_array;
          }
          return;
        }
        const receipt = msg as CommandReceipt;
        if (typeof receipt.eventId !== "string") return;
        const pending = pendingAcks.get(receipt.eventId);
        if (!pending) return;
        pendingAcks.delete(receipt.eventId);

        const result: CommandResult = {
          kind: pending.kind,
          value: pending.payload.action?.value,
          isOk: receipt.receipt?.status === "OK",
          eventId: receipt.eventId,
          payload: pending.payload,
          receipt,
        };
        if (result.isOk) {
          pending.resolve(result);
        } else {
          pending.reject(new CommandFailedError(result));
        }
        for (const { cb, shouldDeliver } of commandResultCallbacks) {
          try {
            if (shouldDeliver && !shouldDeliver(result)) continue;
            cb(result);
          } catch (err) {
            // One subscriber's failure must not starve the others or
            // propagate into the socket's event dispatch.
            console.error("onCommandResult subscriber threw", err);
          }
        }
      });
    }

    function sendCommand(
      kind: CommandKind | null,
      body: CameraCommandBody,
      context: CommandContext = {}
    ): SentCommand {
      const payload = buildCameraCommand({
        station: id,
        activeCamera: context.activeCamera,
        body,
        uuid,
        now,
      });

      let resolve!: (result: CommandResult) => void;
      let reject!: (error: Error) => void;
      const promise = new Promise<CommandResult>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      // Commands are routinely fired and forgotten; pre-observe rejections
      // so an ERR receipt for an unawaited command never surfaces as an
      // unhandled rejection, while awaiting callers still get throws.
      promise.catch(() => {});

      if (pendingAcks.size >= MAX_PENDING_ACKS) {
        // Drop the oldest high-rate command first, falling back to the
        // oldest entry; the evicted promise simply never settles, which
        // callers are told to expect.
        let evicted: string | undefined;
        for (const [eventId, pending] of pendingAcks) {
          if (pending.kind !== null && EVICTABLE_COMMAND_KINDS.has(pending.kind)) {
            evicted = eventId;
            break;
          }
        }
        evicted ??= pendingAcks.keys().next().value;
        if (evicted !== undefined) pendingAcks.delete(evicted);
      }
      pendingAcks.set(payload.eventId, { kind, payload, resolve, reject });

      let socket = pool.peek(namespacePath, V1) ?? lastSendSocket;
      if (!socket) {
        // First send with no live connection: open one under a short-lived
        // reference of its own, so a connection nothing adopts is released
        // (good-bye + disconnect) instead of leaking for the page lifetime.
        const bootstrap = pool.acquire(namespacePath, V1);
        socket = bootstrap.socket;
        setTimeout(bootstrap.release, SEND_CONNECTION_LINGER_MS);
      }
      lastSendSocket = socket;
      ensureStationListeners(socket);
      socket.emit(EVENTS.newCameraCommand, payload);

      return Object.assign(promise, {
        payload,
        eventId: payload.eventId,
      }) as SentCommand;
    }

    // Station-scoped subscribe: same contract as subscribe(), plus it keeps
    // the station's internal telemetry listeners attached to the socket.
    function subscribeStation(
      event: string,
      handler: (...args: any[]) => void
    ): Unsubscribe {
      const { socket, release } = pool.acquire(namespacePath, V1);
      ensureStationListeners(socket);
      socket.on(event, handler);
      return () => {
        try {
          socket.off(event, handler);
        } catch (_) {
          /* socket may already be gone */
        }
        release();
      };
    }

    function onCommandMessage(
      match: (msg: object) => boolean,
      deliver: (msg: any) => void
    ): Unsubscribe {
      return subscribeStation(EVENTS.newCameraCommand, (msg: unknown) => {
        if (msg && typeof msg === "object" && match(msg)) deliver(msg);
      });
    }

    function camera(id: string | null): CameraHandle {
      const context: CommandContext = { activeCamera: id };
      const setting = (kind: CommandKind, name: string) => (value: string) =>
        sendCommand(kind, { action: { name, value } }, context);

      return {
        id,
        setIso: setting(COMMAND_KINDS.SET_ISO, ACTIONS.iso),
        setShutter: setting(COMMAND_KINDS.SET_SHUTTER, ACTIONS.shutter),
        setIris: setting(COMMAND_KINDS.SET_IRIS, ACTIONS.iris),
        setExposureMode: setting(
          COMMAND_KINDS.SET_EXPOSURE_MODE,
          ACTIONS.exposureMode
        ),
        setFocusMode: setting(COMMAND_KINDS.SET_FOCUS_MODE, ACTIONS.focusMode),
        setWhiteBalance: setting(
          COMMAND_KINDS.SET_WHITE_BALANCE,
          ACTIONS.whiteBalance
        ),
        triggerOnePushWhiteBalance: () =>
          sendCommand(
            COMMAND_KINDS.TRIGGER_ONE_PUSH_WHITE_BALANCE,
            {
              action: {
                name: ACTIONS.whiteBalance,
                value: WHITE_BALANCE_ONE_PUSH_TRIGGER,
              },
            },
            context
          ),
        focus: (control) =>
          sendCommand(
            COMMAND_KINDS.FOCUS,
            { action: { name: ACTIONS.focusControl, value: control } },
            context
          ),
        zoom: (control, speed) =>
          sendCommand(
            COMMAND_KINDS.ZOOM,
            {
              action: {
                name: ACTIONS.zoomControl,
                value: speed != null ? `${control}:${speed}` : control,
              },
            },
            context
          ),
        panTilt: (value) =>
          sendCommand(
            COMMAND_KINDS.PAN_TILT,
            {
              action: {
                name: ACTIONS.panTilt,
                value,
                // Historical debugging aid: pan/tilt actions carry their own
                // wall-clock timestamp inside the action.
                timestamp: now().toISOString(),
              },
            },
            context
          ),
        captureStill: (options) =>
          sendCommand(
            COMMAND_KINDS.CAPTURE_STILL,
            {
              action: {
                name: ACTIONS.stillImageCapture,
                value: {
                  interval: 0,
                  imgTransferChecked: options?.transferImage ?? false,
                },
              },
            },
            context
          ),
        setCaptureInterval: (seconds) =>
          sendCommand(
            COMMAND_KINDS.SET_CAPTURE_INTERVAL,
            { action: { name: ACTIONS.stillImageCapture, value: seconds } },
            context
          ),
      };
    }

    return {
      id,

      acquire() {
        const { socket, release } = pool.acquire(namespacePath, V1);
        ensureStationListeners(socket);
        return release;
      },

      camera,

      send(body, context) {
        return sendCommand(null, body, context);
      },

      selectCamera(cameraId, context) {
        return sendCommand(
          COMMAND_KINDS.SELECT_CAMERA,
          { action: { name: ACTIONS.videoSource, value: cameraId } },
          context
        );
      },

      record(cameraId, options = {}) {
        const body: CameraCommandBody = {
          action: { name: ACTIONS.recordSource, value: cameraId },
        };
        if (options.previousCamera !== undefined) {
          body.oldCamera = options.previousCamera;
        } else if (options.as === undefined) {
          // The legacy protocol validates that a non-delegated record names
          // the previously recorded camera (the server never uses the
          // value). The recorder heartbeat reports it by display name;
          // resolve it against the camera list, falling back to the camera
          // being recorded when the name is unknown (e.g. before the list
          // arrives after a reconnect).
          const previous = latestCameraList.find(
            (entry) => entry.cam_name === latestRecorderSource
          );
          body.oldCamera = previous?.camera ?? cameraId;
        }
        if (options.as !== undefined) {
          body.observerSideOverride = delegationTarget(options.as);
        }
        return sendCommand(COMMAND_KINDS.RECORD, body, {
          activeCamera: options.activeCamera,
        });
      },

      stopRecording(options = {}) {
        const body: CameraCommandBody = {
          action: { name: ACTIONS.recordSource, value: RECORD_STOP },
        };
        if (options.as !== undefined) {
          body.observerSideOverride = delegationTarget(options.as);
        }
        return sendCommand(COMMAND_KINDS.STOP_RECORDING, body, {
          activeCamera: options.activeCamera,
        });
      },

      takeRoute(input, output, context) {
        return sendCommand(
          COMMAND_KINDS.TAKE_ROUTE,
          { action: { name: ACTIONS.router, value: { input, output } } },
          context
        );
      },

      onCamHeartbeat(cb) {
        return subscribeStation(EVENTS.camHeartbeat, (msg) =>
          cb(normalizeCamHeartbeat(msg))
        );
      },

      onRecorderHeartbeat(cb) {
        return subscribeStation(EVENTS.recorderHeartbeat, (msg) =>
          cb(normalizeRecorderHeartbeat(msg))
        );
      },

      onRecordingStarted(cb) {
        // New-clip detection as the legacy UI did it: a heartbeat reports a
        // filename different from the last one seen, while recording.
        let lastFilename: string | undefined;
        return subscribeStation(EVENTS.recorderHeartbeat, (msg) => {
          const heartbeat = normalizeRecorderHeartbeat(msg);
          // The pilot-shaped heartbeat carries no per-clip filename.
          if (!("isRecording" in heartbeat)) return;
          const previous = lastFilename;
          lastFilename = heartbeat.filename;
          if (!heartbeat.isRecording || heartbeat.filename === "none") return;
          if (previous === undefined || previous === heartbeat.filename) return;
          cb(heartbeat.camera);
        });
      },

      onConnectionStatus(cb) {
        const { socket, release } = pool.acquire(namespacePath, V1);
        ensureStationListeners(socket);
        const onConnect = () => {
          everActiveSockets.add(socket);
          cb({ status: "connected" });
        };
        const onDisconnect = () => {
          everActiveSockets.add(socket);
          cb({ status: "disconnected" });
        };
        const onError = () => {
          everActiveSockets.add(socket);
          cb({ status: "error" });
        };
        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("connect_error", onError);

        // The pooled socket may predate this subscriber (another consumer
        // established it first); replay the current state so subscribers
        // don't have to poll. A socket with a lifecycle history that isn't
        // connected now is mid-outage — replay that too, so a subscriber
        // attaching during the outage doesn't wait for the next retry.
        if (socket.connected) {
          cb({ status: "connected" });
        } else if (everActiveSockets.has(socket)) {
          cb({ status: "disconnected" });
        }

        return () => {
          try {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("connect_error", onError);
          } catch (_) {
            /* socket may already be gone */
          }
          release();
        };
      },

      onCameraList(cb) {
        return onCommandMessage(
          (msg) => "camera_array" in msg,
          (msg) => cb(msg.camera_array)
        );
      },

      onRouterInputs(cb) {
        return onCommandMessage(
          (msg) => "router_input_array" in msg,
          (msg) => cb(msg.router_input_array)
        );
      },

      onRouterOutputs(cb) {
        return onCommandMessage(
          (msg) => "router_output_array" in msg,
          (msg) => cb(msg.router_output_array)
        );
      },

      onCameraSettings(cb) {
        return onCommandMessage(
          (msg) => "current_settings" in msg,
          (msg) => cb(normalizeCameraSettings(msg))
        );
      },

      onCommandResult(cb, shouldDeliver) {
        const subscriber = { cb, shouldDeliver };
        commandResultCallbacks.add(subscriber);
        return () => {
          commandResultCallbacks.delete(subscriber);
        };
      },
    };
  }

  const stations = new Map<StationId, Station>();

  async function encoderAction(name: string, action: string): Promise<void> {
    const endpoint = getEndpoints()?.[V1_5];
    if (!endpoint) {
      throw new Error(`No WS_ENDPOINTS entry for API version ${V1_5}`);
    }
    const base = `${endpoint.server}${endpoint.path}`.replace(/\/+$/, "");
    const response = await fetch(
      `${base}/encoder/${encodeURIComponent(name)}/${action}`,
      { method: "POST" }
    );
    if (!response.ok) {
      throw new Error(
        `Encoder ${action} failed for ${name}: HTTP ${response.status}`
      );
    }
  }

  const client: ImagingClient = {
    station(stationId) {
      const id = getStationInfo(stationId).stationId;
      let station = stations.get(id);
      if (!station) {
        station = createStation(id);
        stations.set(id, station);
      }
      return station;
    },

    onNavHeartbeat(cb) {
      return subscribe(NAMESPACE_ROOT, V1, EVENTS.navHeartbeat, cb);
    },

    onSensorHeartbeat(cb) {
      return subscribe(NAMESPACE_ROOT, V1, EVENTS.sensorHeartbeat, cb);
    },

    onSystemMessage(cb) {
      return subscribe(NAMESPACE_SYSTEM, V1_5, EVENTS.systemMessage, cb);
    },

    restartEncoder(name) {
      return encoderAction(name, "restart_encoder");
    },

    rebootEncoder(name) {
      return encoderAction(name, "reboot");
    },

    async restartServer() {
      await fetch(`https://${globalThis.location.hostname}/restart`, {
        method: "GET",
        mode: "no-cors",
      });
    },

    close() {
      pool.closeAll();
    },
  };

  return client;
}

let sharedClient: ImagingClient | null = null;

/**
 * The application-wide client instance. Reads window.WS_ENDPOINTS lazily on
 * first use, so it is safe to import at module scope.
 */
export function getSharedImagingClient(): ImagingClient {
  if (!sharedClient) {
    sharedClient = createImagingClient();
  }
  return sharedClient;
}

