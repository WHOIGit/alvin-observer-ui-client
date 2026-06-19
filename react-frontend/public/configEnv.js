// Default local env variables
// Use in place of the REACT_APP style env variables.

window.PILOT_MODE = true;
window.MOCK_ALERTS = false;
window.MOCK_HEALTH = false;

// Web socket endpoints by backend API version.
window.WS_ENDPOINTS = {
  "1": { server: "http://127.0.0.1:4040", path: "/api/v1/" },
  "1.5": { server: "http://127.0.0.1:4040", path: "/api/v1.5/" },
  "vitals": { server: "http://127.0.0.1:4050", path: "/" },
};

window.VITALS_URL = "http://127.0.0.1:4050";

// sealog url for iframe
window.SEALOG_URL = "https://sealog.whoi.edu/sealog-alvin/";

// Video stream server configs
window.VIDEO_STREAM_SERVER = "http://127.0.0.1:8889/h264";
window.VIDEO_STREAM_PROTOCOL = "whep";
window.VIDEO_STREAM_URL_TEMPLATE = "/stream/{stream}/channel/{channel}/webrtc/whep";
window.PORT_OBSERVER_VIDEO = "port_mon";
window.PORT_RECORDER_VIDEO = "port_rec";
window.STBD_OBSERVER_VIDEO = "stbd_mon";
window.STBD_RECORDER_VIDEO = "stbd_rec";
window.PILOT_VIDEO = "pilot_mon";

window.CAMERAS = [
  { camera: "camera1", cam_name: "port_brow_4k", owner: "port" },
  { camera: "camera2", cam_name: "port_patz", owner: "port" },
  { camera: "camera3", cam_name: "stbd_brow_4k", owner: "stbd" },
  { camera: "camera4", cam_name: "stbd_patz", owner: "stbd" },
  { camera: "camera5", cam_name: "aft_cam", owner: "none" },
  { camera: "camera6", cam_name: "down_cam", owner: "none" },
  { camera: "camera7", cam_name: "brow_wide", owner: "pilot" },
  { camera: "camera8", cam_name: "sci_cam", owner: "port" },
];
