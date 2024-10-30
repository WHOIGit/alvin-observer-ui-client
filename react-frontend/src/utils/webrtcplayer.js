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
    
    // RTSPtoWeb only, not RTSPtoWebRTC
    return `${this.server}/stream/${this.stream}/channel/${this.channel}/webrtc`;
          
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
      iceServers: [
        {
          urls: ["stun:stun.l.google.com:19302"],
        },
      ],
      sdpSemantics: "unified-plan",
    });

    //this.webrtc.ontrack = this.handleTrack.bind(this); //move before negotiation - mjs test
    this.webrtc.onnegotiationneeded = this.handleNegotiationNeeded.bind(this);
    this.webrtc.onsignalingstatechange = this.handleSignalingStateChange.bind(this);
    this.webrtc.ontrack = this.handleTrack.bind(this);
    this.webrtc.onremovetrack = this.removeTrack.bind(this); //mjs - 11sept2024

    this.webrtc.addTransceiver("video", {
      direction: "sendrecv",
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
  }

  async handleSignalingStateChange() {
    //console.log(`handleSignalingStateChange ${this.webrtc.signalingState}`);
    console.log("webRTC - handleSignalingStateChange:", this.stream, this.webrtc.signalingState);
    try {  //added to catch error when no video source available - 30may2024 - mjs
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
          //console.log('The RTCPeerConnection has been closed: ${this.webrtc.signalingState}`);
          console.log("webRTC - RTCPeerConnection has been closed:", this.stream, this.webrtc.signalingState);
          break;

        default:
          //console.log(`unhandled signalingState is ${this.webrtc.signalingState}`);
          console.log("webRTC - unhandled signalingState:", this.stream, this.webrtc.signalingState);
          break;
      }
    
    } 
    catch (error) {
      console.log(`webRTC - ERROR: handleSignalingStateChange ${this.stream} : ${this.webrtc.signalingState} : ${error}`);
    }   
    
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
      this.webrtc.onsignalingstatechange = null;
    
         
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
}
