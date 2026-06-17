import { expect, test } from "vitest";
import { evaluateStaleStreams } from "./streams";

const streams = [
  { key: "nav", staleMs: 15000 },
  { key: "camera", staleMs: 15000 },
  { key: "sensor", staleMs: 30000 },
];

test("flags only streams that have exceeded their stale window", () => {
  const now = 100000;
  const lastSeen = {
    nav: now - 16000, // stale (> 15s)
    camera: now - 5000, // fresh
    // sensor: never seen
  };

  const stale = evaluateStaleStreams(lastSeen, now, streams);

  expect(Object.keys(stale)).toEqual(["nav"]);
});

test("never-seen streams are not considered stale", () => {
  const stale = evaluateStaleStreams({}, 100000, streams);
  expect(stale).toEqual({});
});

test("respects per-stream thresholds", () => {
  const now = 100000;
  // 20s without an update: past nav's 15s window, within sensor's 30s window.
  const lastSeen = { nav: now - 20000, sensor: now - 20000 };

  const stale = evaluateStaleStreams(lastSeen, now, streams);

  expect(Object.keys(stale)).toEqual(["nav"]);
});
