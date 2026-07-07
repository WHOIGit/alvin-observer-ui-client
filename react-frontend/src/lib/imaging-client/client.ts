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
  getObserverInfo,
} from "./protocol";
import { COMMAND_KINDS, CommandFailedError } from "./commands";
import type { CommandKind } from "./commands";
import type { ObserverSide, ObserverSideInput } from "./protocol";
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

/** Context shared by station-level commands. */
export interface CommandContext {
  /** The station's active camera; becomes the payload's `camera` field. */
  activeCamera?: string | null;
}

export interface RecordOptions extends CommandContext {
  /**
   * The camera that was previously being recorded (from the recorder
   * heartbeat); the legacy protocol requires it on record-source commands.
   */
  previousCamera?: string | null;
  /** Pilot only: delegate the recording to an observer station. */
  as?: "port" | "stbd";
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
  readonly side: ObserverSide;
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
   */
  onCommandResult(cb: (result: CommandResult) => void): Unsubscribe;
}

export interface ImagingClientOptions {
  /** Endpoint table; defaults to reading window.WS_ENDPOINTS lazily. */
  endpoints?: WsEndpoints | (() => WsEndpoints);
  /** Injectable for deterministic tests. */
  uuid?: () => string;
  now?: () => Date;
}

export interface ImagingClient {
  station(side: ObserverSideInput): Station;

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

  function createStation(side: ObserverSide): Station {
    const info = getObserverInfo(side);
    const namespacePath = info.namespacePath;

    const commandResultCallbacks = new Set<(result: CommandResult) => void>();

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

    // The receipt-correlation listener rides on whatever socket currently
    // backs this namespace, without holding a reference of its own. Sockets
    // are recreated when the pool entry cycles, so track attachment per
    // socket instance.
    const ackListenerAttached = new WeakSet<Socket>();
    function ensureAckListener(socket: Socket) {
      if (ackListenerAttached.has(socket)) return;
      ackListenerAttached.add(socket);
      socket.on(EVENTS.newCameraCommand, (msg: unknown) => {
        if (!msg || typeof msg !== "object" || isBroadcastShape(msg)) return;
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
        for (const cb of commandResultCallbacks) {
          cb(result);
        }
      });
    }

    function sendCommand(
      kind: CommandKind | null,
      body: CameraCommandBody,
      context: CommandContext = {}
    ): SentCommand {
      const payload = buildCameraCommand({
        side,
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
        // Drop the oldest unacknowledged command; its promise simply never
        // settles, which callers are told to expect.
        const oldest = pendingAcks.keys().next().value;
        if (oldest !== undefined) pendingAcks.delete(oldest);
      }
      pendingAcks.set(payload.eventId, { kind, payload, resolve, reject });

      const socket =
        pool.peek(namespacePath, V1) ??
        lastSendSocket ??
        pool.get(namespacePath, V1);
      lastSendSocket = socket;
      ensureAckListener(socket);
      socket.emit(EVENTS.newCameraCommand, payload);

      return Object.assign(promise, {
        payload,
        eventId: payload.eventId,
      }) as SentCommand;
    }

    function onCommandMessage(
      match: (msg: object) => boolean,
      deliver: (msg: any) => void
    ): Unsubscribe {
      return subscribe(namespacePath, V1, EVENTS.newCameraCommand, (msg: unknown) => {
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
      side,

      acquire() {
        const { release } = pool.acquire(namespacePath, V1);
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
        }
        if (options.as !== undefined) {
          body.observerSideOverride = options.as;
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
          body.observerSideOverride = options.as;
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
        return subscribe(namespacePath, V1, EVENTS.camHeartbeat, (msg) =>
          cb(normalizeCamHeartbeat(msg))
        );
      },

      onRecorderHeartbeat(cb) {
        return subscribe(namespacePath, V1, EVENTS.recorderHeartbeat, (msg) =>
          cb(normalizeRecorderHeartbeat(msg))
        );
      },

      onConnectionStatus(cb) {
        const { socket, release } = pool.acquire(namespacePath, V1);
        const onConnect = () => cb({ status: "connected" });
        const onDisconnect = () => cb({ status: "disconnected" });
        const onError = () => cb({ status: "error" });
        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("connect_error", onError);

        // The pooled socket may already be connected (e.g. another consumer
        // established it first); replay the current state so subscribers
        // don't have to poll.
        if (socket.connected) cb({ status: "connected" });

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

      onCommandResult(cb) {
        commandResultCallbacks.add(cb);
        return () => {
          commandResultCallbacks.delete(cb);
        };
      },
    };
  }

  const stations = new Map<ObserverSide, Station>();

  async function encoderAction(name: string, action: string): Promise<void> {
    const endpoint = getEndpoints()?.[V1_5];
    if (!endpoint) {
      throw new Error(`No WS_ENDPOINTS entry for API version ${V1_5}`);
    }
    const base = `${endpoint.server}${endpoint.path}`.replace(/\/+$/, "");
    await fetch(`${base}/encoder/${encodeURIComponent(name)}/${action}`, {
      method: "POST",
    });
  }

  const client: ImagingClient = {
    station(sideInput) {
      const side = getObserverInfo(sideInput).observerSide;
      let station = stations.get(side);
      if (!station) {
        station = createStation(side);
        stations.set(side, station);
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

