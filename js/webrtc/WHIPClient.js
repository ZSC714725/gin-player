'use strict';

class WHIPClient {
  constructor(endpoint, token, audioElement, videoElement, encodingOptions = {}) {
    this.endpoint = endpoint;
    this.token = token;
    this.audioElement = audioElement;
    this.videoElement = videoElement;
    this.encodingOptions = encodingOptions;
    this.localStream = null;
    this.isStreaming = false;

    this.peerConnection = new RTCPeerConnection({
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: "require",
      iceTransportPolicy: "all"
    });

    console.log('whip peer connection created.')

    this.peerConnection.addEventListener('negotiationneeded', async ev => {
      console.log('Connection negotiation starting');
      this.location = await negotiateConnectionWithClientOffer(this.peerConnection, this.endpoint, this.token, this.encodingOptions);
      console.log('Connection negotiation ended');
    });
  }

  async startPublishing() {
    if (this.isStreaming) {
      console.log('Already streaming');
      return;
    }
    
    try {
      await this.accessLocalMediaSources();
      this.isStreaming = true;
      console.log('Started publishing');
    } catch (error) {
      console.error('Failed to start publishing:', error);
      throw error;
    }
  }

  async accessLocalMediaSources() {
    // Build video constraints based on encoding options
    const videoConstraints = {
      width: this.encodingOptions.width || 1280,
      height: this.encodingOptions.height || 720,
      frameRate: 30
    };

    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: videoConstraints, 
      audio: true 
    });
    
    // Store the local stream for cleanup
    this.localStream = stream;
    
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
          // Apply video constraints
          const videoConstraints = {
            width: this.encodingOptions.width || 1280,
            height: this.encodingOptions.height || 720,
            frameRate: 30
          };
          
          transceiver.sender.track.applyConstraints(videoConstraints);
          
          // Set encoding parameters if supported
          if (transceiver.sender.setParameters) {
            const params = transceiver.sender.getParameters();
            if (params.encodings && params.encodings.length > 0) {
              params.encodings[0].maxBitrate = (this.encodingOptions.bitrate || 2500) * 1000;
              if (this.encodingOptions.codec) {
                params.encodings[0].codecPayloadType = this.getCodecPayloadType(this.encodingOptions.codec);
              }
              transceiver.sender.setParameters(params);
            }
          }
          
          this.videoElement.srcObject = ms;
          break;
        default:
          break;
      }
    });
    
    return stream;
  }

  getCodecPayloadType(codec) {
    // Return payload type for different codecs
    // These are standard RTP payload types
    switch(codec.toUpperCase()) {
      case 'VP8':
        return 96;
      case 'VP9':
        return 98;
      case 'H264':
        return 97;
      case 'H265':
        return 99;
      case 'AV1':
        return 100;
      default:
        return 97; // Default to H.264
    }
  }

  async disconnectStream() {
    this.isStreaming = false;
    
    // Stop local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    // Clear video element
    this.videoElement.srcObject = null;
    
    // Stop stream visualizer
    if (this.streamVisualizer) {
      this.streamVisualizer.stop();
      this.streamVisualizer = null;
    }

    // Send DELETE request to server if location is available
    if (this.location) {
      try {
        const response = await fetch(this.location, {
          method: 'DELETE',
          mode: 'cors',
        });
        console.log('DELETE request sent to server');
      } catch (error) {
        console.error('Failed to send DELETE request:', error);
      }
    }
    
    // Close peer connection
    this.peerConnection.close();
  }
}