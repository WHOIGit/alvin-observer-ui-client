// Get the environmental variables from the window object
// Local file: /public/configEnv.js
const envSettings = window;
// Web socket server
export const WS_SERVER = envSettings.WS_SERVER;
export const WS_PATH = envSettings.WS_PATH;
export const WS_SERVER_NAMESPACE_PORT = "port";
export const WS_SERVER_NAMESPACE_STARBOARD = "stbd";
export const WS_SERVER_NAMESPACE_PILOT = "pilot";
// sealog url for iframe
export const SEALOG_URL = envSettings.SEALOG_URL;
// Web socket event names
export const NEW_CAMERA_COMMAND_EVENT = "newCameraCommand";
export const NAV_HEARTBEAT = "NavHeartbeat";
export const CAM_HEARTBEAT = "CamHeartbeat";
export const SENSOR_HEARTBEAT = "SensorHeartbeat";
export const RECORDER_HEARTBEAT = "RecorderHeartbeat";

// Camera definitions
//export const CAMERAS = envSettings.CAMERAS;

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
  recordSourceCommand: "REC",
  recordStopCommand: "ST",
  routerIOCommand: "RTR",
  whiteBalanceCommand: "WB",
  whiteBalanceOptions: [
    "AUTO",
    "INDOOR",
    "OUTDOOR",
    "ONE_PUSH_WB",
  ],
  whiteBalanceOnePushCommandValue: "ONE_PUSH_TRIGGER",
  captureIntervalCommand: "SIC",
  captureIntervalOptions: [
    "0",
    "20",
    "30",
    "40",
    "50",
    "60",
  ],
};

export const VIDEO_STREAM_CONFIG = {
  server: envSettings.VIDEO_STREAM_SERVER,
  portObserverVideo: envSettings.PORT_OBSERVER_VIDEO,
  portObserverSmallVideo: envSettings.PORT_OBSERVER_SMALL_VIDEO,
  stbdObserverVideo: envSettings.STBD_OBSERVER_VIDEO,
  stbdObserverSmallVideo: envSettings.STBD_OBSERVER_SMALL_VIDEO,
  portRecordVideo: envSettings.PORT_RECORDER_VIDEO,
  stbdRecordVideo: envSettings.STBD_RECORDER_VIDEO,
  pilotVideo: envSettings.PILOT_VIDEO,
  pilotSmallVideo: envSettings.PILOT_SMALL_VIDEO,
};

// Router controls inputs/outputs
export const ROUTER_INPUTS = envSettings.ROUTER_INPUTS;
export const ROUTER_OUTPUTS = envSettings.ROUTER_OUTPUTS;
