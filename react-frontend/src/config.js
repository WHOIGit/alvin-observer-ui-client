export const WS_BASE = "http://localhost:9041/";
// Web socket event names
export const NEW_CAMERA_COMMAND_EVENT = "newCameraCommand";

export const COMMAND_STRINGS = {
  cameraChangeCommand: "CAM",
  exposureModeCommand: "EXP",
  exposureModeOptions: ["AUTO", "MAN", "SP", "IP"],
  shutterModeCommand: "SHU",
  shutterModeOptions: ["AUTO", "VAL1", "VAL2"],
  irisModeCommand: "IRS",
  irisModeOptions: ["AUTO", "VAL1", "VAL2"],
  isoModeCommand: "ISO",
  isoModeOptions: ["AUTO", "VAL1", "VAL2"],
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
