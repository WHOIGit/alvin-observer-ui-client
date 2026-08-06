/**
 * Telemetry payloads as delivered by the client's channels: the wire
 * messages with their boolean-ish string fields ("y"/"n", "true"/"false")
 * normalized to real booleans, and the camera-settings fields normalized
 * from their null sentinels ('NULL_PORT_ISO', 'null') and driver-fault
 * strings to `string | null` plus a hasFault predicate. These are the
 * public shapes consumers program against; the raw encodings stay in
 * wire.ts.
 */

import type {
  CamHeartbeat as WireCamHeartbeat,
  CameraSettingsPayload as WireCameraSettingsPayload,
  RecorderHeartbeat as WireRecorderHeartbeat,
  RecorderHeartbeatObserver as WireRecorderHeartbeatObserver,
  RecorderHeartbeatPilot as WireRecorderHeartbeatPilot,
} from "./wire";

export interface CamHeartbeat
  extends Omit<
    WireCamHeartbeat,
    | "pantilt"
    | "camctrl"
    | "iso"
    | "shutter"
    | "iris"
    | "exposure"
    | "focus_mode"
    | "white_balance"
    | "capture_interval"
  > {
  /** Whether the selected camera has a pan/tilt mount (wire: pantilt). */
  hasPanTilt: boolean;
  /** Whether this station may control the selected camera (wire: camctrl). */
  isControllable: boolean;
  /** Camera settings; null when the camera doesn't report the setting. */
  iso: string | null;
  shutter: string | null;
  iris: string | null;
  exposure: string | null;
  focus_mode: string | null;
  /** Only present in the pilot's heartbeat. */
  white_balance?: string | null;
  /** Only present in the pilot's heartbeat. */
  capture_interval?: string | null;
  /** Which settings fields carried a driver-fault value. */
  faults: {
    iso: boolean;
    shutter: boolean;
    iris: boolean;
    exposure: boolean;
    focus_mode: boolean;
    /** Only present in the pilot's heartbeat. */
    white_balance?: boolean;
    /** Only present in the pilot's heartbeat. */
    capture_interval?: boolean;
  };
  /** Whether any settings field carried a driver-fault value. */
  hasFault: boolean;
}

/** Normalized shape of the onCameraSettings channel's payload. */
export interface CameraSettings {
  /** Available setting options for the selected camera. */
  ISO?: string[];
  SHU?: string[];
  IRS?: string[];
  current_settings?: {
    iso: string | null;
    shu: string | null;
    irs: string | null;
    focus_mode: string | null;
    exposure: string | null;
    white_balance: string | null;
  };
  /** Whether any current-settings field carried a driver-fault value. */
  hasFault: boolean;
}

export interface RecorderHeartbeatObserver
  extends Omit<WireRecorderHeartbeatObserver, "recording"> {
  isRecording: boolean;
}

export interface RecorderHeartbeatPilot
  extends Omit<
    WireRecorderHeartbeatPilot,
    "port_recording" | "stbd_recording" | "processing_complete"
  > {
  isPortRecording: boolean;
  isStbdRecording: boolean;
  isProcessingComplete: boolean;
}

export type RecorderHeartbeat = RecorderHeartbeatObserver | RecorderHeartbeatPilot;

/** The wire says "y"/"n"; anything that isn't a "y" is treated as no. */
function yesNo(value: unknown): boolean {
  return typeof value === "string" && value.trim().toLowerCase() === "y";
}

/** The wire says "true"/"false" as strings. */
function boolString(value: unknown): boolean {
  return value === "true";
}

/** Values a driver reports when the camera link itself is broken. */
const FAULT_VALUES = new Set(["Driver Recv Socket timed out!", "ERR"]);

/** A driver-fault marker, as opposed to a merely absent setting. */
function isFault(value: string | null | undefined): boolean {
  return typeof value === "string" && FAULT_VALUES.has(value);
}

/**
 * Returns the real setting value, or null for the wire's null sentinels
 * ('NULL_{STATION}_{FIELD}', 'null') and driver-fault strings (the fault
 * itself is reported separately via hasFault).
 */
function normalizeSetting(value: string | null | undefined): string | null {
  if (value == null) return null;
  if (value === "null" || value.startsWith("NULL_")) return null;
  if (isFault(value)) return null;
  return value;
}

export function normalizeCamHeartbeat(message: WireCamHeartbeat): CamHeartbeat {
  const {
    pantilt,
    camctrl,
    iso,
    shutter,
    iris,
    exposure,
    focus_mode,
    white_balance,
    capture_interval,
    ...rest
  } = message;

  const faults: CamHeartbeat["faults"] = {
    iso: isFault(iso),
    shutter: isFault(shutter),
    iris: isFault(iris),
    exposure: isFault(exposure),
    focus_mode: isFault(focus_mode),
  };
  if (white_balance !== undefined) {
    faults.white_balance = isFault(white_balance);
  }
  if (capture_interval !== undefined) {
    faults.capture_interval = isFault(capture_interval);
  }

  const heartbeat: CamHeartbeat = {
    ...rest,
    hasPanTilt: yesNo(pantilt),
    isControllable: yesNo(camctrl),
    iso: normalizeSetting(iso),
    shutter: normalizeSetting(shutter),
    iris: normalizeSetting(iris),
    exposure: normalizeSetting(exposure),
    focus_mode: normalizeSetting(focus_mode),
    faults,
    hasFault: Object.values(faults).some(Boolean),
  };
  // The pilot-only fields stay absent for observer heartbeats.
  if (white_balance !== undefined) {
    heartbeat.white_balance = normalizeSetting(white_balance);
  }
  if (capture_interval !== undefined) {
    heartbeat.capture_interval = normalizeSetting(capture_interval);
  }
  return heartbeat;
}

export function normalizeCameraSettings(
  message: WireCameraSettingsPayload
): CameraSettings {
  const { current_settings, ...rest } = message;

  const settings: CameraSettings = {
    ...rest,
    hasFault: current_settings
      ? Object.values(current_settings).some(isFault)
      : false,
  };
  if (current_settings) {
    settings.current_settings = {
      iso: normalizeSetting(current_settings.iso),
      shu: normalizeSetting(current_settings.shu),
      irs: normalizeSetting(current_settings.irs),
      focus_mode: normalizeSetting(current_settings.focus_mode),
      exposure: normalizeSetting(current_settings.exposure),
      white_balance: normalizeSetting(current_settings.white_balance),
    };
  }
  return settings;
}

export function normalizeRecorderHeartbeat(
  message: WireRecorderHeartbeat
): RecorderHeartbeat {
  if ("port_recording" in message || "stbd_recording" in message) {
    const { port_recording, stbd_recording, processing_complete, ...rest } =
      message as WireRecorderHeartbeatPilot;
    return {
      ...rest,
      isPortRecording: boolString(port_recording),
      isStbdRecording: boolString(stbd_recording),
      isProcessingComplete: boolString(processing_complete),
    };
  }
  const { recording, ...rest } = message as WireRecorderHeartbeatObserver;
  return {
    ...rest,
    isRecording: boolString(recording),
  };
}
