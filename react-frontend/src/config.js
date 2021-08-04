// Web socket server
export const WS_SERVER = "http://128.128.184.62:4040";
// Web socket event names
export const NEW_CAMERA_COMMAND_EVENT = "newCameraCommand";
export const NAV_HEARTBEAT = "NavHeartbeat";

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
  zoomControlCommand: "ZCS",
  zoomNearOneStop: "TS",
  zoomFarOneStop: "WS",
  zoomNearContinuos: "TC",
  zoomFarContinuos: "WC",
  panTiltCommand: "PANTILT",
  stillImageCaptureCommand: "SIC",
  quickClickCommand: "QCV",
  recordSourceCommand: "REC"
};

export const VIDEO_STREAM_CONFIG = {
  server: "128.128.181.215:8083",
  portObserverVideo: "teradek",
  stbdObserverVideo: "stbdObserverVideo",
  portRecordVideo: "portRecordVideo",
  stbdRecordVideo: "stbdRecordVideo",
  pilotVideo: "pilotVideo"
};
