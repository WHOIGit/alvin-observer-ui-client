// Web socket server root URL
window.WS_SERVER =
  typeof window !== "undefined" && `https://${window.location.hostname}`;

// Web socket server path, ex: "/websocket-server-path/"
window.WS_PATH = "/websocket-server/";

// sealog url for iframe
window.SEALOG_URL =
  typeof window !== "undefined" && `https://${window.location.hostname}/sealog`;

// Video stream server configs
window.VIDEO_STREAM_SERVER =
  typeof window !== "undefined" && `https://${window.location.hostname}/video`;

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

window.ROUTER_INPUTS = [
  { label: "INPUT 1", value: "INPUT 1" },
  { label: "INPUT 2", value: "INPUT 2" },
  { label: "INPUT 3", value: "INPUT 3" },
  { label: "INPUT 4", value: "INPUT 4" },
  { label: "INPUT 5", value: "INPUT 5" },
  { label: "INPUT 6", value: "INPUT 6" },
  { label: "INPUT 7", value: "INPUT 7" },
  { label: "INPUT 8", value: "INPUT 8" },
  { label: "INPUT 9", value: "INPUT 9" },
  { label: "INPUT 10", value: "INPUT 10" },
  { label: "INPUT 11", value: "INPUT 11" },
  { label: "INPUT 12", value: "INPUT 12" },
  { label: "INPUT 13", value: "INPUT 13" },
  { label: "INPUT 14", value: "INPUT 14" },
  { label: "INPUT 15", value: "INPUT 15" },
  { label: "INPUT 16", value: "INPUT 16" },
];

window.ROUTER_OUTPUTS = [
  { label: "OUTPUT 1", value: "OUTPUT 1" },
  { label: "OUTPUT 2", value: "OUTPUT 2" },
  { label: "OUTPUT 3", value: "OUTPUT 3" },
  { label: "OUTPUT 4", value: "OUTPUT 4" },
  { label: "OUTPUT 5", value: "OUTPUT 5" },
  { label: "OUTPUT 6", value: "OUTPUT 6" },
  { label: "OUTPUT 7", value: "OUTPUT 7" },
  { label: "OUTPUT 8", value: "OUTPUT 8" },
  { label: "OUTPUT 9", value: "OUTPUT 9" },
  { label: "OUTPUT 10", value: "OUTPUT 10" },
  { label: "OUTPUT 11", value: "OUTPUT 11" },
  { label: "OUTPUT 12", value: "OUTPUT 12" },
  { label: "OUTPUT 13", value: "OUTPUT 13" },
  { label: "OUTPUT 14", value: "OUTPUT 14" },
  { label: "OUTPUT 15", value: "OUTPUT 15" },
  { label: "OUTPUT 16", value: "OUTPUT 16" },
];
