import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import WebRtcPlayer, { STALL_LIMIT } from "./webrtcplayer";

// Drives checkMediaProgress directly; a real RTCPeerConnection would only
// test the browser.
function playerWithFrozenStats() {
  const player = Object.create(WebRtcPlayer.prototype);
  player.closed = false;
  player.lastSample = null;
  player.stalledChecks = 0;
  player.stream = "port_mon";
  player.webrtc = {
    connectionState: "connected",
    getStats: async () => [
      { type: "inbound-rtp", kind: "video", framesDecoded: 10, bytesReceived: 99 },
    ],
  };
  player.scheduleReconnect = vi.fn();
  player.stopStatsMonitor = vi.fn();
  return player;
}

function setVisibility(state) {
  Object.defineProperty(document, "visibilityState", {
    value: state,
    configurable: true,
  });
}

describe("media-progress watchdog", () => {
  beforeEach(() => setVisibility("visible"));
  afterEach(() => setVisibility("visible"));

  it("reconnects when frames stop advancing while visible", async () => {
    const player = playerWithFrozenStats();

    for (let i = 0; i <= STALL_LIMIT; i += 1) {
      await player.checkMediaProgress();
    }

    expect(player.scheduleReconnect).toHaveBeenCalled();
  });

  it("does not reconnect while the tab is hidden", async () => {
    // iOS stops decoding on lock/background; the counters freeze regardless.
    const player = playerWithFrozenStats();
    setVisibility("hidden");

    for (let i = 0; i < STALL_LIMIT * 4; i += 1) {
      await player.checkMediaProgress();
    }

    expect(player.scheduleReconnect).not.toHaveBeenCalled();
    expect(player.stalledChecks).toBe(0);
  });

  it("needs a fresh baseline after a resume before it can stall", async () => {
    const player = playerWithFrozenStats();
    await player.checkMediaProgress();

    setVisibility("hidden");
    await player.checkMediaProgress();
    expect(player.lastSample).toBeNull();

    setVisibility("visible");
    await player.checkMediaProgress();
    expect(player.stalledChecks).toBe(0);
    expect(player.scheduleReconnect).not.toHaveBeenCalled();
  });
});
