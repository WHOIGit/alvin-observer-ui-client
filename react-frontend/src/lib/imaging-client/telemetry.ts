/**
 * Telemetry payloads as delivered by the client's channels: the wire
 * messages with their boolean-ish string fields ("y"/"n", "true"/"false")
 * normalized to real booleans. These are the public shapes consumers
 * program against; the raw encodings stay in wire.ts.
 *
 * Null sentinels (e.g. 'NULL_PORT_ISO') in the camera-settings fields are
 * NOT yet normalized — that is a separate, later step.
 */

import type {
  CamHeartbeat as WireCamHeartbeat,
  RecorderHeartbeat as WireRecorderHeartbeat,
  RecorderHeartbeatObserver as WireRecorderHeartbeatObserver,
  RecorderHeartbeatPilot as WireRecorderHeartbeatPilot,
} from "./wire";

export interface CamHeartbeat
  extends Omit<WireCamHeartbeat, "pantilt" | "camctrl"> {
  /** Whether the selected camera has a pan/tilt mount (wire: pantilt). */
  hasPanTilt: boolean;
  /** Whether this station may control the selected camera (wire: camctrl). */
  isControllable: boolean;
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

export function normalizeCamHeartbeat(message: WireCamHeartbeat): CamHeartbeat {
  const { pantilt, camctrl, ...rest } = message;
  return {
    ...rest,
    hasPanTilt: yesNo(pantilt),
    isControllable: yesNo(camctrl),
  };
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
