// Web socket server
window.WS_SERVER = "http://128.128.184.62:4040";

// sealog url for iframe
window.SEALOG_URL = "https://sealog.whoi.edu/sealog-alvin/";

// Video stream server configs
window.VIDEO_STREAM_SERVER = "https://128.128.184.62/video";
window.PORT_OBSERVER_VIDEO = "demo1";
window.STBD_OBSERVER_VIDEO = "demo2";
window.PORT_RECORDER_VIDEO = "demo1";
window.STBD_RECORDER_VIDEO = "demo2";
window.PILOT_VIDEO = "demo1";

window.CAMERAS = [
  { cam_name: "port_brow_4k", owner: "port" },
  { cam_name: "port_patz", owner: "port" },
  { cam_name: "stbd_brow_4k", owner: "stbd" },
  { cam_name: "stbd_patz", owner: "stbd" },
  { cam_name: "aft_cam", owner: "none" },
  { cam_name: "down_cam", owner: "none" },
  { cam_name: "brow_wide", owner: "pilot" },
  { cam_name: "sci_cam", owner: "port" }
];
