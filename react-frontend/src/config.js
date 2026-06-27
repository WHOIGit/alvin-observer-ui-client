// Get the environmental variables from the window object
// Local file: /public/configEnv.js
const envSettings = window;
// One entry per backend API version. Each entry is { server, path }.
export const WS_ENDPOINTS = envSettings.WS_ENDPOINTS;
export const WS_SERVER_NAMESPACE_PORT = "port";
export const WS_SERVER_NAMESPACE_STARBOARD = "stbd";
export const WS_SERVER_NAMESPACE_PILOT = "pilot";
// sealog url for iframe
export const SEALOG_URL = envSettings.SEALOG_URL;

// alvin-vitals system-health feed.
// REST base for the GET /health fallback (Caddy proxies to vitals:4050).
export const VITALS_REST_URL = envSettings.VITALS_URL;
// useSocket pool key + namespace/event for the vitals socket push.
export const VITALS_WS_APIVERSION = "vitals";
export const VITALS_HEALTH_NAMESPACE = "/health";
export const HEALTH_SNAPSHOT_EVENT = "HealthSnapshot";
// Dev-only: seed the static fixture so the view renders without vitals running.
export const MOCK_HEALTH = Boolean(envSettings.MOCK_HEALTH);

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
  protocol: envSettings.VIDEO_STREAM_PROTOCOL,
  urlTemplate: envSettings.VIDEO_STREAM_URL_TEMPLATE,
  portObserverVideo: envSettings.PORT_OBSERVER_VIDEO,
  stbdObserverVideo: envSettings.STBD_OBSERVER_VIDEO,
  portRecordVideo: envSettings.PORT_RECORDER_VIDEO,
  stbdRecordVideo: envSettings.STBD_RECORDER_VIDEO,
  pilotVideo: envSettings.PILOT_VIDEO,
};

// Suboptica encoder keys, used as the {name} in v1.5 /encoder/{name} REST
// paths. Distinct from the video stream names above (MediaMTX paths) and fixed
// by the Suboptica topology, so they live here rather than in configEnv.
export const ENCODER_KEYS = {
  portObserver: "port_mon_enc",
  stbdObserver: "stbd_mon_enc",
  pilot: "pilot_mon_enc",
  portRecorder: "port_rec_enc",
  stbdRecorder: "stbd_rec_enc",
};
