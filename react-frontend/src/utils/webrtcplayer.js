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

  constructor(id, stream, channel) {
    this.server = WebRtcPlayer.server;
    this.protocol = WebRtcPlayer.protocol;
    this.urlTemplate = WebRtcPlayer.urlTemplate;
    this.video = document.getElementById(id);
    this.stream = stream;
    this.channel = channel;

    this.video.addEventListener("loadeddata", () => {
      this.video.play();
    });

    this.video.addEventListener("error", () => {
      console.error("webRTC - video error", this.stream);
    });
    /*
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        console.log("Document became visible, restarting WebRTC stream.");
        this.play();
      }
    }); */

    this.play();
  }

  getStreamUrl() {
    const template = this.urlTemplate
      .replaceAll("{stream}", this.stream ?? "")
      .replaceAll("{channel}", this.channel ?? "");
    return `${this.server}${template}`;
  }

  async play() {
    //console.log("webrtc play, this.stream");
    this.mediastream = new MediaStream();
    this.video.srcObject = this.mediastream;
    console.log("webRTC play:", this.stream, this.mediastream);

    // close any existing connections  //I don't think this is appropriate here - need to clean up tracks via close() first - mjs
    //if (this.webrtc) {
    //  console.log("webrtc.play() -  Close any existing connections"); //logging-mjs
    //  this.webrtc.close();
    //}

    this.webrtc = new RTCPeerConnection({
      iceServers: [],
      sdpSemantics: "unified-plan",
    });


    //this.webrtc.ontrack = this.handleTrack.bind(this); //move before negotiation - mjs test
    this.webrtc.onnegotiationneeded = this.handleNegotiationNeeded.bind(this);
    this.webrtc.ontrack = this.handleTrack.bind(this);
    this.webrtc.onremovetrack = this.removeTrack.bind(this); //mjs - 11sept2024

    this.webrtc.addTransceiver("video", {
      direction: "recvonly",
    });
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
    console.log("webRTC - handleNegotiationNeeded:", this.stream);
    let offer = await this.webrtc.createOffer({
      offerToReceiveAudio: false,
      offerToReceiveVideo: true,
    });
    console.log("webRTC - handleNegotiationNeeded - offer:", this.stream, offer, this.mediastream);
    await this.webrtc.setLocalDescription(offer);
    await this.waitForIceGatheringComplete();

    try {
      const response = await this.sendOffer();
      await this.webrtc.setRemoteDescription(
        new RTCSessionDescription({
          type: "answer",
          sdp: response,
        })
      );
    } catch (error) {
      console.log(`webRTC - ERROR: handleNegotiationNeeded ${this.stream} : ${error}`);
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
    console.log("webRTC - handle track", this.stream, event);
    this.mediastream.addTrack(event.track);
  }


  removeTrack(event) {
    console.log("webRTC - remove track", this.stream, event);
    this.mediastream.removeTrack(event.track);
  }

  async close() {

    console.log("webRTC - Closing connection", this.stream);

    if (this.webrtc) {
      this.mediastream.getTracks().forEach(track => {
        console.log("webRTC - Closing stream tracks", this.stream);
        track.enabled = false;
        track.stop()
        //this.mediastream.removeTrack(track);
      });






      this.webrtc.ontrack = null;
      //this.webrtc.onremovetrack = null;
      //this.webrtc.onicecandidate = null;
      //this.webrtc.oniceconnectionstatechange = null;
      this.webrtc.onnegotiationneeded = null;


      this.webrtc.close();
      //this.close();

      //this.server = null;
      //this.stream = null;
      //this.channel = null;

      //this.webrtc = null;
      this.mediastream = null;

      this.video.srcObject = null;

      //this.video.src = '';

      //this.video = null; 
      //this.video.remove();
      //this.video.pause();

      console.log("webRTC - Connection closed!", this.stream);

    } else {

      console.log("webRTC not found!", this.stream);
    }
  }


  static setServer(serv) {
    this.server = serv;
  }

  static setProtocol(protocol) {
    this.protocol = (protocol || "whep").toLowerCase();
  }

  static setUrlTemplate(urlTemplate) {
    this.urlTemplate = urlTemplate || "/stream/{stream}/channel/{channel}/webrtc/whep";
  }
}
