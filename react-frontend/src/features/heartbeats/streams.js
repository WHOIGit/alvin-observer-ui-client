import {
  CAM_HEARTBEAT,
  NAV_HEARTBEAT,
  RECORDER_HEARTBEAT,
  SENSOR_HEARTBEAT,
} from "../../config";

// Heartbeat streams the client watches for liveness. Each entry ties a stream
// to the control highlight that should light up when it goes quiet (`source`,
// matched against AlertHighlight / SOURCE_META) and how long without an update
// counts as stale. `namespace: "side"` means the stream rides the active
// observer-side namespace; "/" is the shared default namespace.
export const HEARTBEAT_STREAMS = [
  {
    key: "nav",
    event: NAV_HEARTBEAT,
    namespace: "/",
    source: "telemetry",
    label: "Navigation",
    level: "WARN",
    staleMs: 15000,
  },
  {
    key: "sensor",
    event: SENSOR_HEARTBEAT,
    namespace: "/",
    source: "sensor",
    label: "Sensor",
    level: "WARN",
    staleMs: 30000,
  },
  {
    key: "camera",
    event: CAM_HEARTBEAT,
    namespace: "side",
    source: "camera",
    label: "Camera",
    level: "ERROR",
    staleMs: 15000,
  },
  {
    key: "recorder",
    event: RECORDER_HEARTBEAT,
    namespace: "side",
    source: "recorder",
    label: "Recorder",
    level: "ERROR",
    staleMs: 20000,
  },
];

// Given the last-seen timestamp per stream key, returns the streams currently
// stale at `now`. A stream that has never been seen is skipped: we can't claim
// it is stale before its first heartbeat, which avoids false alarms at startup
// and for streams the current UI mode never subscribes to.
export function evaluateStaleStreams(lastSeen, now, streams = HEARTBEAT_STREAMS) {
  const stale = {};
  streams.forEach((stream) => {
    const seenAt = lastSeen[stream.key];
    if (!seenAt) return;
    if (now - seenAt > stream.staleMs) {
      stale[stream.key] = stream;
    }
  });
  return stale;
}
