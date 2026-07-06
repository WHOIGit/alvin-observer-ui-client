/**
 * Semantic command kinds. Every Station/CameraHandle method tags the
 * commands it sends with its own name, so a CommandResult's `kind` answers
 * "which method fired this" without reference to wire action codes.
 * Commands issued through the generic Station.send() escape hatch carry
 * kind null.
 */

import type { CommandResult } from "./types";

export const COMMAND_KINDS = {
  SELECT_CAMERA: "selectCamera",
  SET_ISO: "setIso",
  SET_SHUTTER: "setShutter",
  SET_IRIS: "setIris",
  SET_EXPOSURE_MODE: "setExposureMode",
  SET_FOCUS_MODE: "setFocusMode",
  SET_WHITE_BALANCE: "setWhiteBalance",
  TRIGGER_ONE_PUSH_WHITE_BALANCE: "triggerOnePushWhiteBalance",
  FOCUS: "focus",
  ZOOM: "zoom",
  PAN_TILT: "panTilt",
  CAPTURE_STILL: "captureStill",
  RECORD: "record",
  STOP_RECORDING: "stopRecording",
  TAKE_ROUTE: "takeRoute",
} as const;

export type CommandKind = (typeof COMMAND_KINDS)[keyof typeof COMMAND_KINDS];

/** Rejection value of a command whose receipt came back non-OK. */
export class CommandFailedError extends Error {
  readonly result: CommandResult;

  constructor(result: CommandResult) {
    const what = result.kind ?? result.payload.action?.name ?? "command";
    super(`Camera command ${what} failed: ${result.receipt.receipt?.status}`);
    this.name = "CommandFailedError";
    this.result = result;
  }
}
