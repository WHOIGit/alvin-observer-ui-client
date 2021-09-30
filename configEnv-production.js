// Web socket server root URL
//window.WS_SERVER = "http://128.128.184.62:4040";
window.WS_SERVER = "https://199.92.162.205";
//window.WS_SERVER = "https://128.128.184.62";

// Web socket server path, ex: "/websocket-server-path/"
window.WS_PATH = "/websocket-server/";

// sealog url for iframe
window.SEALOG_URL = "https://sealog.whoi.edu/sealog-alvin/";

// Video stream server configs
//window.VIDEO_STREAM_SERVER = "https://128.128.184.62/video";
window.VIDEO_STREAM_SERVER = "https://199.92.162.205/video";
window.PORT_OBSERVER_VIDEO = "demo1";
window.STBD_OBSERVER_VIDEO = "demo2";
window.PORT_RECORDER_VIDEO = "demo2";
window.STBD_RECORDER_VIDEO = "demo1";
window.PILOT_VIDEO = "demo1";

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
