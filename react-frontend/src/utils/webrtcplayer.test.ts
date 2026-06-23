import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import WebRtcPlayer, {
  PLAYER_STATUS,
  STALL_LIMIT,
} from "./webrtcplayer";

// jsdom has no WebRTC stack, so stand in just enough of it to exercise the
// reconnection / stall state machine without touching the network.
class FakeRTCPeerConnection {
  static instances: FakeRTCPeerConnection[] = [];
  connectionState = "new";
  iceConnectionState = "new";
  iceGatheringState = "complete";
  onconnectionstatechange: (() => void) | null = null;
  oniceconnectionstatechange: (() => void) | null = null;
  onnegotiationneeded: (() => void) | null = null;
  ontrack: ((e: any) => void) | null = null;
  onremovetrack: ((e: any) => void) | null = null;
  closed = false;
  // configurable inbound-rtp stats for the media watchdog
  stats: { framesDecoded?: number; bytesReceived?: number } | null = null;

  constructor() {
    FakeRTCPeerConnection.instances.push(this);
  }

  addTransceiver() {}
  addEventListener() {}
  removeEventListener() {}
  close() {
    this.closed = true;
  }

  getStats() {
    const map = new Map<string, any>();
    if (this.stats) {
      map.set("inbound-video", {
        type: "inbound-rtp",
        kind: "video",
        ...this.stats,
      });
    }
    return Promise.resolve(map);
  }

  // test helper
  setConnectionState(state: string) {
    this.connectionState = state;
    this.onconnectionstatechange?.();
  }
}

class FakeMediaStream {
  tracks: any[] = [];
  getTracks() {
    return this.tracks;
  }
  addTrack(t: any) {
    this.tracks.push(t);
  }
  removeTrack(t: any) {
    this.tracks = this.tracks.filter((x) => x !== t);
  }
}

function fakeVideoElement() {
  return {
    id: "v",
    srcObject: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    play: vi.fn().mockResolvedValue(undefined),
  };
}

let videoEl: ReturnType<typeof fakeVideoElement>;

beforeEach(() => {
  vi.useFakeTimers();
  FakeRTCPeerConnection.instances = [];
  videoEl = fakeVideoElement();
  vi.stubGlobal("RTCPeerConnection", FakeRTCPeerConnection as any);
  vi.stubGlobal("MediaStream", FakeMediaStream as any);
  vi.stubGlobal("document", {
    getElementById: () => videoEl,
  } as any);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("WebRtcPlayer reconnection", () => {
  test("starts in connecting state and reports connected", () => {
    const statuses: string[] = [];
    const player = new WebRtcPlayer("v", "stream", "0", {
      onStatusChange: (s) => statuses.push(s),
    });

    expect(player.status).toBe(PLAYER_STATUS.CONNECTING);

    FakeRTCPeerConnection.instances[0].setConnectionState("connected");
    expect(player.status).toBe(PLAYER_STATUS.CONNECTED);
  });

  test("reconnects with a fresh peer connection when the link fails", () => {
    const player = new WebRtcPlayer("v", "stream", "0");
    expect(FakeRTCPeerConnection.instances).toHaveLength(1);

    FakeRTCPeerConnection.instances[0].setConnectionState("failed");
    expect(player.status).toBe(PLAYER_STATUS.RECONNECTING);

    // Backoff timer elapses -> old PC torn down, new one created.
    vi.advanceTimersByTime(1000);
    expect(FakeRTCPeerConnection.instances).toHaveLength(2);
    expect(FakeRTCPeerConnection.instances[0].closed).toBe(true);
  });

  test("does not stack multiple reconnect timers for one outage", () => {
    const player = new WebRtcPlayer("v", "stream", "0");
    const first = FakeRTCPeerConnection.instances[0];

    first.setConnectionState("failed");
    first.setConnectionState("disconnected");
    first.iceConnectionState = "failed";
    first.oniceconnectionstatechange?.();

    vi.advanceTimersByTime(1000);
    // Exactly one new connection, not three.
    expect(FakeRTCPeerConnection.instances).toHaveLength(2);
  });

  test("reconnects when media stalls despite a connected transport", async () => {
    const player = new WebRtcPlayer("v", "stream", "0");
    const pc = FakeRTCPeerConnection.instances[0];
    pc.setConnectionState("connected");

    // Frames advancing: stays healthy.
    pc.stats = { framesDecoded: 10, bytesReceived: 1000 };
    await vi.advanceTimersByTimeAsync(2000); // baseline sample
    pc.stats = { framesDecoded: 25, bytesReceived: 2000 };
    await vi.advanceTimersByTimeAsync(2000); // progressed
    expect(player.status).toBe(PLAYER_STATUS.CONNECTED);

    // Freeze: identical counters every poll -> stall after STALL_LIMIT polls.
    for (let i = 0; i < STALL_LIMIT; i++) {
      await vi.advanceTimersByTimeAsync(2000);
    }
    expect(player.status).toBe(PLAYER_STATUS.RECONNECTING);

    await vi.advanceTimersByTimeAsync(1000); // backoff -> fresh PC
    expect(FakeRTCPeerConnection.instances).toHaveLength(2);
  });

  test("a stream that receives bytes but no frames is not treated as stalled", async () => {
    const player = new WebRtcPlayer("v", "stream", "0");
    const pc = FakeRTCPeerConnection.instances[0];
    pc.setConnectionState("connected");

    // framesDecoded never moves (no sink decoding), but bytes keep arriving.
    let bytes = 1000;
    pc.stats = { framesDecoded: 0, bytesReceived: bytes };
    for (let i = 0; i < STALL_LIMIT + 3; i++) {
      bytes += 500;
      pc.stats = { framesDecoded: 0, bytesReceived: bytes };
      await vi.advanceTimersByTimeAsync(2000);
    }

    expect(player.status).toBe(PLAYER_STATUS.CONNECTED);
    expect(FakeRTCPeerConnection.instances).toHaveLength(1);
  });

  test("close() stops further reconnection", () => {
    const player = new WebRtcPlayer("v", "stream", "0");
    const first = FakeRTCPeerConnection.instances[0];

    first.setConnectionState("failed");
    player.close();

    vi.advanceTimersByTime(10000);
    expect(FakeRTCPeerConnection.instances).toHaveLength(1);
    expect(player.status).toBe(PLAYER_STATUS.CLOSED);
  });
});
