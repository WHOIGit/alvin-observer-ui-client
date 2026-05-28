// Production runtime config for the Pilot UI.

window.PILOT_MODE = true;

// Web socket endpoints by backend API version.
window.WS_ENDPOINTS = {
  "1": {
    server: typeof window !== "undefined" && `https://${window.location.hostname}`,
    path: "/imaging-control/",
  },
  "1.5": {
    server: typeof window !== "undefined" && `https://${window.location.hostname}`,
    path: "/api/v1.5/",
  },
};

// Legacy websocket settings kept for older builds.
window.WS_SERVER =
  typeof window !== "undefined" && `https://${window.location.hostname}`;
window.WS_PATH = "/imaging-control/";

// sealog url for iframe
window.SEALOG_URL =
  typeof window !== "undefined" && `https://${window.location.hostname}/sealog`;

// Video stream server configs
window.VIDEO_STREAM_SERVER =
  typeof window !== "undefined" && `https://${window.location.hostname}/video`;
window.VIDEO_STREAM_PROTOCOL = "rtsptoweb";
window.VIDEO_STREAM_URL_TEMPLATE = "/stream/{stream}/channel/{channel}/webrtc";

window.PORT_OBSERVER_VIDEO = "port_obs";
window.PORT_OBSERVER_SMALL_VIDEO = "port_obs_small";
window.PORT_RECORDER_VIDEO = "port_rec";
window.STBD_OBSERVER_VIDEO = "stbd_obs";
window.STBD_OBSERVER_SMALL_VIDEO = "stbd_obs_small";
window.STBD_RECORDER_VIDEO = "stbd_rec";
window.PILOT_VIDEO = "pilot";
window.PILOT_SMALL_VIDEO = "pilot_small";

window.ROUTER_OUTPUTS = [
  { label: "port_raw_rec", value: "output1" },
  { label: "port_prox_rec", value: "output2" },
  { label: "port_obs_mon", value: "output3" },
  { label: "browcam_fg", value: "output4" },
  { label: "OUTPUT 5", value: "output5" },
  { label: "OUTPUT 6", value: "output6" },
  { label: "pilot_mon", value: "output7" },
  { label: "OUTPUT 8", value: "output8" },
  { label: "OUTPUT 9", value: "output9" },
  { label: "OUTPUT 10", value: "output10" },
  { label: "stbd_raw_rec", value: "output11" },
  { label: "stbd_prox_rec", value: "output12" },
  { label: "stbd_obs_mon", value: "output13" },
  { label: "OUTPUT 14", value: "output14" },
  { label: "browcam_video", value: "output15" },
  { label: "scicam_video", value: "output16" },
];
