// Web socket server root URL
window.WS_SERVER =
  typeof window !== "undefined" && `https://${window.location.hostname}`;

// Web socket server path, ex: "/websocket-server-path/"
window.WS_PATH = "/imaging-control/";

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

/*
