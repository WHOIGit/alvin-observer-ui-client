export default class WebRtcPlayer {
  static server = "http://127.0.0.1:8083";

  server = null;
  stream = null;
  channel = null;

  webrtc = null;
  mediastream = null;
  video = null;

  constructor(id, stream, channel) {
    this.server = WebRtcPlayer.server;
    this.video = document.getElementById(id);
    this.stream = stream;
    this.channel = channel;

    this.video.addEventListener("loadeddata", () => {
      this.video.play();
    });

    this.video.addEventListener("error", () => {
      console.error("video error");
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        console.log("Document became visible, restarting WebRTC stream.");
        this.play();
      }
    });

    this.play();
    this.close();
  }

  getStreamUrl() {
    // RTSPtoWeb only, not RTSPtoWebRTC
    return `${this.server}/stream/${this.stream}/channel/${this.channel}/webrtc`;
  }

  async play() {
    console.log("webrtc play");
    this.mediastream = new MediaStream();
    this.video.srcObject = this.mediastream;

    this.webrtc = new RTCPeerConnection({
      iceServers: [
        {
          urls: ["stun:stun.l.google.com:19302"],
        },
      ],
      sdpSemantics: "unified-plan",
    });

    this.webrtc.onnegotiationneeded = this.handleNegotiationNeeded.bind(this);
    this.webrtc.onsignalingstatechange =
      this.handleSignalingStateChange.bind(this);
    this.webrtc.ontrack = this.handleTrack.bind(this);

    this.webrtc.addTransceiver("video", {
      direction: "sendrecv",
    });
  }

  async handleNegotiationNeeded() {
    console.log("handleNegotiationNeeded");
    let offer = await this.webrtc.createOffer({
      offerToReceiveAudio: false,
      offerToReceiveVideo: true,
    });
    await this.webrtc.setLocalDescription(offer);
  }

  async handleSignalingStateChange() {
    console.log(`handleSignalingStateChange ${this.webrtc.signalingState}`);
    switch (this.webrtc.signalingState) {
      case "have-local-offer":
        let formData = new FormData();
        formData.append("data", btoa(this.webrtc.localDescription.sdp));
        const response = await fetch(this.getStreamUrl(), {
          method: "POST",
          body: formData,
        });

        this.webrtc.setRemoteDescription(
          new RTCSessionDescription({
            type: "answer",
            sdp: atob(await response.text()),
          })
        );

        break;

      case "stable":
        /*
         * There is no ongoing exchange of offer and answer underway.
         * This may mean that the RTCPeerConnection object is new, in which case both the localDescription and remoteDescription are null;
         * it may also mean that negotiation is complete and a connection has been established.
         */
        break;

      case "closed":
        /*
         * The RTCPeerConnection has been closed.
         */
        console.log(
          `The RTCPeerConnection has been closed: ${this.webrtc.signalingState}`
        );
        break;

      default:
        console.log(
          `unhandled signalingState is ${this.webrtc.signalingState}`
        );
        break;
    }
  }

  handleTrack(event) {
    console.log("handle track");
    this.mediastream.addTrack(event.track);
  }

  removeTrack(event) {
    console.log("remove track", event);
    this.mediastream.removeTrack(event.track);
  }

  close() {
    console.log("Close the RTCPeerConnection");
    this.webrtc.close();
  }

  static setServer(serv) {
    this.server = serv;
  }
}
