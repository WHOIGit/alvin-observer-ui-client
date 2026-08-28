// Default local env variables
// Use in place of the REACT_APP style env variables.

window.PILOT_MODE = false;
window.MOCK_ALERTS = false;
window.MOCK_HEALTH = false;

// Web socket endpoints by backend API version.
window.WS_ENDPOINTS = {
  "1":   { server: "https://128.128.184.62", path: "/imaging-control/" },
  "1.5": { server: "https://128.128.184.62", path: "/api/v1.5/" },
  vitals: { server: "https://128.128.184.62", path: "/vitals/" },
};

// REST base for the vitals GET /health fallback.
window.VITALS_URL = "https://128.128.184.62/vitals";

// sealog url for iframe
window.SEALOG_URL = "https://sealog.whoi.edu/sealog-alvin/";

// Video stream server configs
window.VIDEO_STREAM_SERVER = "https://128.128.184.62/video";
window.VIDEO_STREAM_PROTOCOL = "whep";
window.VIDEO_STREAM_URL_TEMPLATE = "/stream/{stream}/channel/{channel}/webrtc/whep";
window.PORT_OBSERVER_VIDEO = "port_mon";
window.PORT_RECORDER_VIDEO = "port_rec";
window.STBD_OBSERVER_VIDEO = "stbd_mon";
window.STBD_RECORDER_VIDEO = "stbd_rec";
window.PILOT_VIDEO = "pilot_mon";
