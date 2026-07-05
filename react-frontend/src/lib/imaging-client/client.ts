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
  buildCameraCommand,
  getObserverInfo,
} from "./protocol";
import type { ObserverSide, ObserverSideInput } from "./protocol";
import type {
  CamHeartbeat,
  CameraArrayEntry,
  CameraCommandBody,
  CameraSettingsPayload,
  CommandReceipt,
  ConnectionStatusEvent,
  FocusControl,
  NavHeartbeat,
  RecorderHeartbeat,
  RouterPortEntry,
  SensorHeartbeat,
  SentCommand,
  SystemMessage,
  Unsubscribe,
  WsEndpoints,
  ZoomControl,
} from "./types";

const V1 = "1";
const V1_5 = "1.5";

/** Upper bound on unacknowledged commands tracked per station. */
const MAX_PENDING_ACKS = 256;

/** Context shared by station-level commands. */
export interface CommandContext {
  /** The station's active camera; becomes the payload's `camera` field. */
  activeCamera?: string | null;
}

export interface RecordOptions {
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
  /** Drive focus: near/far, one-stop/continuous, or "ST" to stop. */
  focus(control: FocusControl | string): SentCommand;
  /** Drive zoom: "TC[:speed]", "TS", "WC[:speed]", "WS", or "ST". */
  zoom(control: ZoomControl): SentCommand;
  /** Joystick pan/tilt; `value` is the nipplejs-shaped move descriptor. */
  panTilt(value: unknown): SentCommand;
  /**
   * Trigger a still capture. Observers send
   * `{interval, imgTransferChecked}`; the pilot sends a numeric string.
   */
  captureStill(value: unknown): SentCommand;
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
  stopRecording(options?: Pick<RecordOptions, "as">): SentCommand;
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
  onCameraSettings(cb: (msg: CameraSettingsPayload) => void): Unsubscribe;
  onCommandReceipt(cb: (msg: CommandReceipt) => void): Unsubscribe;
  /**
   * Fires synchronously with a copy of every outgoing command payload,
   * BEFORE it is emitted on the wire. State mirrors (e.g. Redux) rely on
   * this ordering so a fast acknowledgment can never race the local record
   * of the command.
   */
  onCommandSent(cb: (payload: SentCommand["payload"]) => void): Unsubscribe;
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

function copyPayload(payload: SentCommand["payload"]): SentCommand["payload"] {
  // Consumers may mutate what they receive (a known quirk of the Redux
  // store's setLastCommand); hand each of them their own shallow copy so the
  // wire payload stays pristine.
  return {
    ...payload,
    action: payload.action ? { ...payload.action } : payload.action,
  };
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

    const commandSentCallbacks = new Set<(payload: SentCommand["payload"]) => void>();
    const pendingAcks = new Map<string, (receipt: CommandReceipt) => void>();

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
        const eventId = (msg as CommandReceipt).eventId;
        if (typeof eventId !== "string") return;
        const resolve = pendingAcks.get(eventId);
        if (resolve) {
          pendingAcks.delete(eventId);
          resolve(msg as CommandReceipt);
        }
      });
    }

    function registerAck(eventId: string): Promise<CommandReceipt> {
      return new Promise<CommandReceipt>((resolve) => {
        if (pendingAcks.size >= MAX_PENDING_ACKS) {
          // Drop the oldest unacknowledged command; its ack simply never
          // resolves, which callers are told to expect.
          const oldest = pendingAcks.keys().next().value;
          if (oldest !== undefined) pendingAcks.delete(oldest);
        }
        pendingAcks.set(eventId, resolve);
      });
    }

    function send(body: CameraCommandBody, context: CommandContext = {}): SentCommand {
      const payload = buildCameraCommand({
        side,
        activeCamera: context.activeCamera,
        body,
        uuid,
        now,
      });

      // Local mirrors first, then the wire: an acknowledgment must never
      // arrive before the command has been recorded locally.
      for (const cb of commandSentCallbacks) {
        cb(copyPayload(payload));
      }

      const socket = pool.get(namespacePath, V1);
      ensureAckListener(socket);
      const ack = registerAck(payload.eventId);
      socket.emit(EVENTS.newCameraCommand, payload);

      return { payload, ack };
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
      const setting = (name: string) => (value: string) =>
        send({ action: { name, value } }, context);

      return {
        id,
        setIso: setting(ACTIONS.iso),
        setShutter: setting(ACTIONS.shutter),
        setIris: setting(ACTIONS.iris),
        setExposureMode: setting(ACTIONS.exposureMode),
        setFocusMode: setting(ACTIONS.focusMode),
        setWhiteBalance: setting(ACTIONS.whiteBalance),
        focus: (control) =>
          send({ action: { name: ACTIONS.focusControl, value: control } }, context),
        zoom: (control) =>
          send({ action: { name: ACTIONS.zoomControl, value: control } }, context),
        panTilt: (value) =>
          send(
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
        captureStill: (value) =>
          send({ action: { name: ACTIONS.stillImageCapture, value } }, context),
      };
    }

    return {
      side,

      acquire() {
        const { release } = pool.acquire(namespacePath, V1);
        return release;
      },

      camera,
      send,

      selectCamera(cameraId, context) {
        return send({ action: { name: ACTIONS.videoSource, value: cameraId } }, context);
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
        return send(body);
      },

      stopRecording(options = {}) {
        const body: CameraCommandBody = {
          action: { name: ACTIONS.recordSource, value: RECORD_STOP },
        };
        if (options.as !== undefined) {
          body.observerSideOverride = options.as;
        }
        return send(body);
      },

      takeRoute(input, output, context) {
        return send({ action: { name: ACTIONS.router, value: { input, output } } }, context);
      },

      onCamHeartbeat(cb) {
        return subscribe(namespacePath, V1, EVENTS.camHeartbeat, cb);
      },

      onRecorderHeartbeat(cb) {
        return subscribe(namespacePath, V1, EVENTS.recorderHeartbeat, cb);
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
        return onCommandMessage((msg) => "current_settings" in msg, cb);
      },

      onCommandReceipt(cb) {
        return onCommandMessage((msg) => !isBroadcastShape(msg), cb);
      },

      onCommandSent(cb) {
        commandSentCallbacks.add(cb);
        return () => {
          commandSentCallbacks.delete(cb);
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

    close() {
      pool.closeAll();
    },
  };

  clientPools.set(client, pool);
  return client;
}

const clientPools = new WeakMap<ImagingClient, ConnectionPool>();

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

/**
 * @deprecated Transition-only escape hatch for hooks/useSocket.js so the
 * legacy hook and the client share one connection pool (one socket per
 * namespace) while consumers migrate. Removed along with that shim.
 */
export function unstable_getSharedConnectionPool(): ConnectionPool {
  const pool = clientPools.get(getSharedImagingClient());
  if (!pool) throw new Error("shared client has no pool");
  return pool;
}
