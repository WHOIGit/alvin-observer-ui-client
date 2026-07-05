/**
 * Wire-format types for the legacy Imaging Control Server protocol (v1/v1.5).
 *
 * These mirror the backend's Pydantic formalization in
 * suboptica/src/suboptica/api/v1/icstypes.py, which is the authoritative
 * contract. A future protocol revision should keep the shapes exposed by the
 * ImagingClient API stable while replacing these wire types underneath.
 *
 * Many fields are strings, including those conveying boolean or numeric
 * values. Some use custom null sentinels like 'NULL_PORT_ISO'; those are
 * passed through untouched — normalization is deferred to the next protocol
 * revision so today's consumers see exactly what the wire carries.
 */

export type WsEndpoint = { server: string; path: string };

/** One entry per backend API version ("1", "1.5"). */
export type WsEndpoints = Record<string, WsEndpoint>;

/** Station identity as it appears in wire payloads. */
export type User = "pilot" | "port" | "stbd";

export type ExposureMode = "AUTO" | "MAN" | "SP" | "IP";
export type FocusMode = "AF" | "MF";
/** Focus drive: far/near, one-stop/continuous, or stop. */
export type FocusControl = "FC" | "FS" | "NC" | "NS" | "ST";
/**
 * Zoom drive in the format "TC[:speed]": telephoto/wide, one-stop/continuous,
 * or stop. Speed is only valid for the continuous modes.
 */
export type ZoomControl = string;
export type WhiteBalanceMode =
  | "AUTO"
  | "INDOOR"
  | "OUTDOOR"
  | "MANUAL"
  | "ONE_PUSH_WB"
  | "ONE_PUSH_TRIGGER";

/**
 * Camera settings fields in heartbeats are either a real value or a null
 * sentinel such as 'NULL_PORT_ISO', 'null', or a driver error string.
 */
export type SettingOrSentinel = string;

export interface CamHeartbeat {
  eventId: string;
  timestamp: string;
  /** SOVP / SOVS / SOPL, scoped to the namespace it arrives on. */
  command: string;
  /** The station's currently selected camera ID, e.g. "port_brow_4k". */
  camera: string;
  iso: SettingOrSentinel;
  shutter: SettingOrSentinel;
  iris: SettingOrSentinel;
  exposure: SettingOrSentinel;
  /** Only present in the pilot's heartbeat. */
  white_balance?: SettingOrSentinel;
  /** Only present in the pilot's heartbeat. */
  capture_interval?: string;
  focus_mode: SettingOrSentinel;
  action?: "???";
  /** Whether the selected camera supports pan/tilt. */
  pantilt: "y" | "n";
  /** Whether this station may control the selected camera. */
  camctrl: "y" | "n";
  owner: User | "none";
  dive: string;
  cruise: string;
  version: string;
}

export interface RecorderHeartbeatObserver {
  eventId: string;
  timestamp: string;
  command: "SRVP" | "SRVS";
  /** The recorder's current source, by camera display name. */
  camera: string;
  recording: "true" | "false";
  filename: string | "none";
}

export interface RecorderHeartbeatPilot {
  eventId: string;
  timestamp: string;
  command: "SRPL";
  port_camera: string;
  stbd_camera: string;
  port_recording: "true" | "false";
  stbd_recording: "true" | "false";
  filename: "none";
  processing_complete: "true" | "false";
}

export type RecorderHeartbeat = RecorderHeartbeatObserver | RecorderHeartbeatPilot;

export interface NavHeartbeat {
  eventId: string;
  timestamp: string;
  hdg: number;
  dep: number;
  alt: number;
  x: number;
  y: number;
  lat: number;
  lon: number;
}

export interface SensorHeartbeat {
  eventId: string;
  timestamp: string;
  command: "SSD";
  t1: number;
  t2: number;
  t3: number;
}

/** v1.5 alert broadcast on the /system namespace. */
export interface SystemMessage {
  correlation_id?: string | null;
  timestamp?: string;
  message: string;
  level: "INFO" | "WARN" | "ERROR" | "CRITICAL" | string;
  source?: string | null;
  sticky?: boolean;
  ttl_seconds?: number | null;
}

export interface CameraArrayEntry {
  camera: string;
  cam_name: string;
  owner: User | "none";
}

/** Router input/output port with its human-readable label. */
export interface RouterPortEntry {
  label: string;
  /** "input1".."input16" or "output1".."output16". */
  value: string;
}

export interface CameraSettingsCurrent {
  iso?: string | null;
  shu?: string | null;
  irs?: string | null;
  focus_mode?: string | null;
  exposure?: string | null;
  white_balance?: string | null;
}

/**
 * Server-initiated `newCameraCommand` carrying the selected camera's
 * available setting options and/or its current values.
 */
export interface CameraSettingsPayload {
  ISO?: string[];
  SHU?: string[];
  IRS?: string[];
  current_settings?: CameraSettingsCurrent;
}

export type ReceiptStatus = "OK" | "BUSY" | "ERR";

/** Server acknowledgment of a client command, correlated by eventId. */
export interface CommandReceipt {
  eventId: string;
  receipt: {
    command: string;
    status: ReceiptStatus | string;
  };
  [key: string]: unknown;
}

export interface CameraCommandAction {
  name: string;
  value?: unknown;
  /** Only PANTILT actions carry a timestamp inside the action. */
  timestamp?: string;
}

/** Client → server command payload on the `newCameraCommand` event. */
export interface CameraCommandPayload {
  eventId: string;
  timestamp: string;
  /** The station's active camera at the time of the command, if any. */
  camera: string | null;
  /** COVP / COVS / COPL; absent when the station side is unknown. */
  command?: string;
  action: CameraCommandAction;
  /** Pilot delegating the command to an observer station's resources. */
  observerSideOverride?: "port" | "stbd";
  /** Previously recorded camera, sent with record-source commands. */
  oldCamera?: string | null;
  [key: string]: unknown;
}

/** Extra top-level fields to merge into a command payload. */
export interface CameraCommandBody {
  action: CameraCommandAction;
  observerSideOverride?: "port" | "stbd";
  oldCamera?: string | null;
  [key: string]: unknown;
}

export type ConnectionStatus = "connected" | "disconnected" | "error";

export interface ConnectionStatusEvent {
  status: ConnectionStatus;
}

export type Unsubscribe = () => void;

export interface SentCommand {
  /** The exact payload emitted on the wire. */
  payload: CameraCommandPayload;
  /**
   * Resolves with the server's receipt for this command's eventId. Never
   * rejects; commands that are never acknowledged simply never resolve.
   */
  ack: Promise<CommandReceipt>;
}
