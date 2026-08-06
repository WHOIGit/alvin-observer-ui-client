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
// Web socket event names
export const NEW_CAMERA_COMMAND_EVENT = "newCameraCommand";

// Camera definitions
//export const CAMERAS = envSettings.CAMERAS;


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
