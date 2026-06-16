// Default local env variables
// Use in place of the REACT_APP style env variables.

window.PILOT_MODE = false;

// Web socket endpoints by backend API version.
window.WS_ENDPOINTS = {
  "1":   { server: "https://128.128.184.62", path: "/imaging-control/" },
  "1.5": { server: "https://128.128.184.62", path: "/api/v1.5/" },
};

// sealog url for iframe
window.SEALOG_URL = "https://sealog.whoi.edu/sealog-alvin/";

// Video stream server configs
window.VIDEO_STREAM_SERVER = "https://128.128.184.62/video";
window.VIDEO_STREAM_PROTOCOL = "whep";
window.VIDEO_STREAM_URL_TEMPLATE = "/stream/{stream}/channel/{channel}/webrtc/whep";
window.PORT_OBSERVER_VIDEO = "port_obs";
window.PORT_OBSERVER_SMALL_VIDEO = "port_obs_small";
window.PORT_RECORDER_VIDEO = "port_rec";
window.STBD_OBSERVER_VIDEO = "stbd_obs";
window.STBD_OBSERVER_SMALL_VIDEO = "stbd_obs_small";
window.STBD_RECORDER_VIDEO = "stbd_rec";
window.PILOT_VIDEO = "pilot";
window.PILOT_SMALL_VIDEO = "pilot_small";

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
