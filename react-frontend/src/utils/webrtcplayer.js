// Possible values passed to the optional `onStatusChange` callback.
export const PLAYER_STATUS = {
  CONNECTING: "connecting",
  CONNECTED: "connected",
  RECONNECTING: "reconnecting",
  CLOSED: "closed",
};

const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 10000;

// Media-progress watchdog. The peer connection can stay "connected" at the
// ICE/transport level while zero frames actually decode (a frozen picture),
// which the connection-state handlers never see. Poll getStats() and force a
// reconnect when neither decoded frames nor received bytes advance. (Received
// bytes are checked too so a warm-but-unrendered stream — RTP still arriving,
// no <video> sink decoding it — isn't mistaken for a stall.)
export const STATS_POLL_MS = 2000;
export const STALL_LIMIT = 3; // consecutive idle polls (~6s) before reconnecting

export default class WebRtcPlayer {
  static server = "http://127.0.0.1:8083";
  static protocol = "whep";
  static urlTemplate = "/stream/{stream}/channel/{channel}/webrtc/whep";

  server = null;
  protocol = null;
  urlTemplate = null;
  stream = null;
  channel = null;

  webrtc = null;
  mediastream = null;
  video = null;

  // Reconnection / status state. The peer connection has no retry of its own,
  // so an ICE drop (common on a flaky shipboard/sub link) would otherwise
  // freeze the video forever. We watch the connection and re-offer with backoff.
  status = "idle";
  onStatusChange = null;
  closed = false;
  reconnectTimer = null;
  reconnectAttempts = 0;

  // Media-progress watchdog state.
  statsTimer = null;
  lastSample = null;
  stalledChecks = 0;

  constructor(id, stream, channel, { onStatusChange = null } = {}) {
    this.server = WebRtcPlayer.server;
    this.protocol = WebRtcPlayer.protocol;
    this.urlTemplate = WebRtcPlayer.urlTemplate;
    // The connection can be owned without a <video> element (the React
    // components attach this.mediastream to their own elements).
    this.video = id ? document.getElementById(id) : null;
    this.stream = stream;
    this.channel = channel;
    this.onStatusChange = onStatusChange;

    // One stable MediaStream for the player's lifetime: reconnects swap the
    // peer connection and its tracks, but consumers that attached this stream
    // keep rendering without re-wiring.
    this.mediastream = new MediaStream();

    if (this.video) {
      this.video.srcObject = this.mediastream;
      this.video.addEventListener("loadeddata", this.handleLoadedData);
      this.video.addEventListener("error", this.handleVideoError);
    }

    this.play();
  }

  setStatus(status) {
    if (this.status === status) return;
    this.status = status;
    if (this.onStatusChange) {
      try {
        this.onStatusChange(status);
      } catch (_) {}
    }
  }

  handleLoadedData = () => {
    this.video?.play?.().catch(() => {});
  };

  handleVideoError = () => {
    console.error("webRTC - video error", this.stream);
    this.scheduleReconnect();
  };

  handleConnectionStateChange = () => {
    if (!this.webrtc) return;
    const state = this.webrtc.connectionState;
    if (state === "connected") {
      this.reconnectAttempts = 0;
      this.setStatus(PLAYER_STATUS.CONNECTED);
    } else if (
      state === "failed" ||
      state === "disconnected" ||
      state === "closed"
    ) {
      this.scheduleReconnect();
    }
  };

  handleIceConnectionStateChange = () => {
    if (!this.webrtc) return;
    const state = this.webrtc.iceConnectionState;
    if (state === "failed" || state === "disconnected") {
      this.scheduleReconnect();
    }
  };

  // --- media-progress watchdog -------------------------------------------

  startStatsMonitor() {
    this.stopStatsMonitor();
    this.lastSample = null;
    this.stalledChecks = 0;
    if (typeof setInterval !== "function") return;
    this.statsTimer = setInterval(() => {
      void this.checkMediaProgress();
    }, STATS_POLL_MS);
  }

  stopStatsMonitor() {
    if (this.statsTimer) {
      clearInterval(this.statsTimer);
      this.statsTimer = null;
    }
  }

  async checkMediaProgress() {
    if (this.closed || !this.webrtc) return;
    // Only meaningful once the transport claims to be up.
    if (this.webrtc.connectionState !== "connected") return;
    if (typeof this.webrtc.getStats !== "function") return;

    let frames = null;
    let bytes = null;
    try {
      const report = await this.webrtc.getStats();
      report.forEach((stat) => {
        if (
          stat.type === "inbound-rtp" &&
          (stat.kind === "video" || stat.mediaType === "video")
        ) {
          if (typeof stat.framesDecoded === "number") frames = stat.framesDecoded;
          if (typeof stat.bytesReceived === "number") bytes = stat.bytesReceived;
        }
      });
    } catch (_) {
      return;
    }

    if (frames === null && bytes === null) return;
    const sample = { frames: frames ?? 0, bytes: bytes ?? 0 };

    // First sample just establishes a baseline.
    if (this.lastSample === null) {
      this.lastSample = sample;
      this.stalledChecks = 0;
      return;
    }

    const progressed =
      sample.frames > this.lastSample.frames ||
      sample.bytes > this.lastSample.bytes;
    this.lastSample = sample;

    if (progressed) {
      this.stalledChecks = 0;
      return;
    }

    this.stalledChecks += 1;
    if (this.stalledChecks >= STALL_LIMIT) {
      console.warn(
        `webRTC - media stalled for ${this.stream} (connected but no frames), reconnecting`
      );
      this.stopStatsMonitor();
      this.scheduleReconnect();
    }
  }

  // -----------------------------------------------------------------------

  scheduleReconnect() {
    if (this.closed) return;
    if (this.reconnectTimer) return;

    this.stopStatsMonitor();
    this.setStatus(PLAYER_STATUS.RECONNECTING);
    const delay = Math.min(
      RECONNECT_BASE_MS * 2 ** this.reconnectAttempts,
      RECONNECT_MAX_MS
    );
    this.reconnectAttempts += 1;
    console.warn(
      `webRTC - scheduling reconnect for ${this.stream} in ${delay}ms (attempt ${this.reconnectAttempts})`
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.closed) return;
      this.teardownPeer();
      this.play();
    }, delay);
  }

  // Close the current peer connection and release its tracks, keeping the
  // shared MediaStream object intact (used between reconnect attempts).
  teardownPeer() {
    this.stopStatsMonitor();
    if (this.mediastream) {
      this.mediastream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (_) {}
        this.mediastream.removeTrack(track);
      });
    }
    if (!this.webrtc) return;
    try {
      this.webrtc.ontrack = null;
      this.webrtc.onremovetrack = null;
      this.webrtc.onnegotiationneeded = null;
      this.webrtc.onconnectionstatechange = null;
      this.webrtc.oniceconnectionstatechange = null;
      this.webrtc.close();
    } catch (error) {
      console.error("webRTC - teardown error", this.stream, error);
    }
    this.webrtc = null;
  }

  getStreamUrl() {
    const template = this.urlTemplate
      .replaceAll("{stream}", this.stream ?? "")
      .replaceAll("{channel}", this.channel ?? "");
    return `${this.server}${template}`;
  }

  async play() {
    if (this.closed) return;

    // Always start from a clean peer connection so reconnect attempts don't
    // stack RTCPeerConnections or leave stale tracks attached.
    this.teardownPeer();
    this.setStatus(
      this.reconnectAttempts > 0
        ? PLAYER_STATUS.RECONNECTING
        : PLAYER_STATUS.CONNECTING
    );

    if (!this.mediastream) this.mediastream = new MediaStream();
    if (this.video) this.video.srcObject = this.mediastream;

    this.webrtc = new RTCPeerConnection({
      iceServers: [],
      sdpSemantics: "unified-plan",
    });

    this.webrtc.onnegotiationneeded = this.handleNegotiationNeeded.bind(this);
    this.webrtc.ontrack = this.handleTrack.bind(this);
    this.webrtc.onremovetrack = this.removeTrack.bind(this);
    this.webrtc.onconnectionstatechange = this.handleConnectionStateChange;
    this.webrtc.oniceconnectionstatechange = this.handleIceConnectionStateChange;

    this.webrtc.addTransceiver("video", {
      direction: "recvonly",
    });

    this.startStatsMonitor();
  }

  async waitForIceGatheringComplete() {
    if (this.webrtc.iceGatheringState === "complete") {
      return;
    }

    await new Promise((resolve) => {
      const checkState = () => {
        if (this.webrtc.iceGatheringState === "complete") {
          this.webrtc.removeEventListener(
            "icegatheringstatechange",
            checkState
          );
          resolve();
        }
      };

      this.webrtc.addEventListener("icegatheringstatechange", checkState);
    });
  }

  async handleNegotiationNeeded() {
    try {
      const offer = await this.webrtc.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: true,
      });
      await this.webrtc.setLocalDescription(offer);
      await this.waitForIceGatheringComplete();

      const response = await this.sendOffer();
      await this.webrtc.setRemoteDescription(
        new RTCSessionDescription({
          type: "answer",
          sdp: response,
        })
      );
    } catch (error) {
      // A failed signalling exchange (e.g. the stream server is down) never
      // produces an ICE state change, so reconnect must be driven from here.
      console.error(`webRTC - negotiation failed for ${this.stream}: ${error}`);
      this.scheduleReconnect();
    }
  }

  async sendOffer() {
    switch (this.protocol) {
      case "whep":
        return this.sendWhepOffer();
      case "rtsptoweb":
        return this.sendRtspToWebOffer();
      default:
        throw new Error(`Unsupported video stream protocol: ${this.protocol}`);
    }
  }

  async sendWhepOffer() {
    const response = await fetch(this.getStreamUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/sdp",
      },
      body: this.webrtc.localDescription.sdp,
    });
    const body = await response.text();

    if (!response.ok) {
      throw new Error(`WHEP request failed: ${response.status} ${body}`);
    }

    return body;
  }

  async sendRtspToWebOffer() {
    const formData = new FormData();
    formData.append("data", btoa(this.webrtc.localDescription.sdp));

    const response = await fetch(this.getStreamUrl(), {
      method: "POST",
      body: formData,
    });
    const body = await response.text();

    if (!response.ok) {
      throw new Error(`RTSPtoWeb request failed: ${response.status} ${body}`);
    }

    return atob(body);
  }

  handleTrack(event) {
    if (this.mediastream) this.mediastream.addTrack(event.track);
  }

  removeTrack(event) {
    if (this.mediastream) this.mediastream.removeTrack(event.track);
  }

  close() {
    this.closed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.teardownPeer();
    if (this.video) {
      this.video.removeEventListener("loadeddata", this.handleLoadedData);
      this.video.removeEventListener("error", this.handleVideoError);
      this.video.srcObject = null;
    }
    this.mediastream = null;
    this.setStatus(PLAYER_STATUS.CLOSED);
  }

  static setServer(serv) {
    this.server = serv;
  }

  static setProtocol(protocol) {
    this.protocol = (protocol || "whep").toLowerCase();
  }

  static setUrlTemplate(urlTemplate) {
    this.urlTemplate =
      urlTemplate || "/stream/{stream}/channel/{channel}/webrtc/whep";
  }
}
