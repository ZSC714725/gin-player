'use strict';

class WHEPClient {
  private endpoint: string;
  private token: string;
  private audioElement: HTMLCanvasElement;
  private videoElement: HTMLVideoElement;
  private peerConnection: RTCPeerConnection;
  private location?: string;
  private streamVisualizer?: StreamVisualizer;
  private localStream?: MediaStream;
  private ms: MediaStream;

  constructor(endpoint: string, token: string, audioElement: HTMLCanvasElement, videoElement: HTMLVideoElement) {
    this.endpoint = endpoint;
    this.token = token;
    this.audioElement = audioElement;
    this.videoElement = videoElement;
    this.ms = new MediaStream();

    this.peerConnection = new RTCPeerConnection({
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: "require",
      iceTransportPolicy: "all"
    });

    console.log('whep peer connection created.')

    this.peerConnection.addTransceiver("video", {
      direction: "recvonly",
    });
    this.peerConnection.addTransceiver("audio", {
      direction: "recvonly",
    });

    this.peerConnection.ontrack = (event: RTCTrackEvent) => {
      const track = event.track;
      let ms = new MediaStream();
      switch (track.kind) {
        case "video":
          this.ms.addTrack(track);
          this.videoElement.srcObject = this.ms;
          break;
        case "audio":
          this.ms.addTrack(track);
          this.videoElement.srcObject = this.ms;
          this.streamVisualizer = new StreamVisualizer(this.ms, this.audioElement);
          this.streamVisualizer.start();
          break;
        default:
          console.log("got unknown track " + track);
      }
    };

    this.peerConnection.addEventListener("connectionstatechange", (ev) => {
      if (this.peerConnection.connectionState !== "connected") {
        return;
      }
      if (!this.videoElement.srcObject) {
        this.videoElement.srcObject = this.stream;
      }
    });

    this.peerConnection.addEventListener('negotiationneeded', async ev => {
      console.log('Connection negotiation starting');
      this.location = await negotiateConnectionWithClientOffer(this.peerConnection, this.endpoint, this.token);
      console.log('Connection negotiation ended');
    });
  }

  async disconnectStream(): Promise<void> {
    this.videoElement.srcObject = null;
    this.streamVisualizer?.stop();
    this.streamVisualizer = undefined;

    if (this.location) {
      const response = await fetch(this.location, {
        method: 'DELETE',
        mode: 'cors',
      });
    }
    this.peerConnection.close();
    this.localStream?.getTracks().forEach(track => track.stop());
  }
}
