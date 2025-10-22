'use strict';

class WHIPClient {
  constructor(endpoint, token, audioElement, videoElement) {
    this.endpoint = endpoint;
    this.token = token;
    this.audioElement = audioElement;
    this.videoElement = videoElement;

    this.peerConnection = new RTCPeerConnection({
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: "require",
      iceTransportPolicy: "all"
    });

    console.log('whip peer connection created.')

    this.peerConnection.addEventListener('negotiationneeded', async ev => {
      console.log('Connection negotiation starting');
      this.location = await negotiateConnectionWithClientOffer(this.peerConnection, this.endpoint, this.token);
      console.log('Connection negotiation ended');
    });

    this.accessLocalMediaSources().catch(console.error);
  }

  async accessLocalMediaSources() {
    return navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      stream.getTracks().forEach(track => {
        const transceiver = this.peerConnection.addTransceiver(track, {
          direction: 'sendonly',
        });
        if (!transceiver.sender.track) {
          return
        }
        let ms = new MediaStream([transceiver.sender.track]);
        switch (track.kind) {
          case 'audio':
            this.streamVisualizer = new StreamVisualizer(ms, this.audioElement);
            this.streamVisualizer.start();
            break;
          case 'video':
            transceiver.sender.track.applyConstraints({
              width: 1280,
              height: 720,
            });
            this.videoElement.srcObject = ms;
            break;
          default:
            break;
        }
      });
      return stream;
    });
  }

  async disconnectStream() {
    this.videoElement.srcObject = null;
    this.streamVisualizer.stop();
    this.streamVisualizer = null;

    var _a;
    const response = await fetch(this.location, {
      method: 'DELETE',
      mode: 'cors',
    });
    this.peerConnection.close();
    (_a = this.localStream) === null || _a === void 0
      ? void 0
      : _a.getTracks().forEach(track => track.stop());
  }
}
