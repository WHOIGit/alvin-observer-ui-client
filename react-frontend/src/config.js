// Web socket server
export const WS_SERVER = "http://128.128.184.62:4040";
export const WS_SERVER_NAMESPACE_PORT = "/port";
export const WS_SERVER_NAMESPACE_STARBOARD = "/stbd";
export const WS_SERVER_NAMESPACE_PILOT = "/pilot";
// sealog url for iframe
export const SEALOG_URL = "https://harmonyhill.whoi.edu/sealog-alvin/";
// Web socket event names
export const NEW_CAMERA_COMMAND_EVENT = "newCameraCommand";
export const NAV_HEARTBEAT = "NavHeartbeat";
export const CAM_HEARTBEAT = "CamHeartbeat";
export const SENSOR_HEARTBEAT = "SensorHeartbeat";
export const RECORDER_HEARTBEAT = "RecorderHeartbeat";

// Camera definitions
export const CAMERAS = [
  { camera: "camera1", displayName: "Camera 1", owner: "P" },
  { camera: "camera2", displayName: "Camera 2", owner: "P" },
  { camera: "camera3", displayName: "Camera 3", owner: "S" },
  { camera: "camera4", displayName: "Camera 4", owner: "S" }
];

// Camera command constants
export const COMMAND_PREFIX = "COV"; // Client Observer. Combines with ObserverSide P/S
export const COMMAND_STRINGS = {
  cameraChangeCommand: "CAM",
  exposureModeCommand: "EXP",
  exposureModeOptions: ["AUTO", "MAN", "SP", "IP"],
  shutterModeCommand: "SHU",
  irisModeCommand: "IRS",
  isoModeCommand: "ISO",
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
  server: "https://128.128.184.62/video",
  portObserverVideo: "demo1",
  stbdObserverVideo: "demo1",
  portRecordVideo: "demo1",
  stbdRecordVideo: "demo1",
  pilotVideo: "demo1"
};
