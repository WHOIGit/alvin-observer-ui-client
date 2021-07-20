export const WS_BASE = "http://localhost:9041/";
// Web socket event names
export const NEW_CAMERA_COMMAND_EVENT = "newCameraCommand";

export const COMMAND_STRINGS = {
  exposureModeCommand: "EXP",
  exposureModeOptions: ["AUTO", "MAN", "SP", "IP"],
  focusModeCommand: "FCM",
  focusAF: "AF",
  focusMF: "MF",
  focusControlCommand: "FCS",
  focusNearOneStop: "NS",
  focusFarOneStop: "FS",
  focusNearContinuos: "NC",
  focusFarContinuos: "FC",
  focusStop: "ST",
  focusZoomNearOneStop: "TS",
  focusZoomFarOneStop: "WS",
  focusZoomNearContinuos: "TC",
  focusZoomFarContinuos: "WC",
  panTiltCommand: "PANTILT",
  stillImageCaptureCommand: "SIC",
  quickClickCommand: "QCV",
  recordSourceCommand: "REC"
};
