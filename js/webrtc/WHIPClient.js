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
          
          // Set up keyframe interval if specified
          if (this.encodingOptions.keyframeInterval) {
            this.setupKeyframeInterval(transceiver.sender, this.encodingOptions.keyframeInterval);
          }
          
          this.videoElement.srcObject = ms;
          break;
        default:
          break;
      }
    });
    
    return stream;
  }

  setupKeyframeInterval(sender, intervalSeconds) {
    console.log(`Setting up keyframe interval: ${intervalSeconds} seconds`);
    
    // Method 1: Try to use setParameters with keyframe interval
    if (sender.setParameters) {
      try {
        // Ensure getParameters is called first
        const params = sender.getParameters();
        if (params.encodings && params.encodings.length > 0) {
          // Store original parameters for restoration
          this.originalEncodingParams = JSON.parse(JSON.stringify(params.encodings[0]));
          
          // Add keyframe interval to encoding parameters
          params.encodings[0].keyframeInterval = intervalSeconds;
          sender.setParameters(params);
          console.log(`Set keyframe interval via setParameters: ${intervalSeconds}s`);
        }
      } catch (error) {
        console.warn('Failed to set keyframe interval via setParameters:', error);
      }
    }
    
    // Method 2: Try MediaStreamTrack constraints
    if (sender.track && sender.track.applyConstraints) {
      try {
        const constraints = {
          keyframeInterval: intervalSeconds,
          frameRate: { ideal: 30, max: 30 }
        };
        sender.track.applyConstraints(constraints);
        console.log(`Applied keyframe interval constraints: ${intervalSeconds}s`);
      } catch (error) {
        console.warn('Failed to apply keyframe interval constraints:', error);
      }
    }
    
    // Method 3: Always use periodic forcing as backup
    this.startPeriodicKeyframes(intervalSeconds);
  }

  startPeriodicKeyframes(intervalSeconds) {
    // Enhanced keyframe forcing with multiple strategies
    console.log(`Starting enhanced keyframe forcing every ${intervalSeconds} seconds`);
    
    this.keyframeInterval = setInterval(() => {
      console.log(`[KEYFRAME] Forcing keyframe at ${new Date().toISOString()}`);
      
      if (this.peerConnection && this.peerConnection.getSenders) {
        const senders = this.peerConnection.getSenders();
        senders.forEach(sender => {
          if (sender.track && sender.track.kind === 'video') {
            // Ensure sender is ready before forcing keyframe
            this.ensureSenderReady(sender).then(() => {
              this.forceKeyframe(sender);
            }).catch(error => {
              console.warn('Sender not ready for keyframe forcing:', error);
            });
          }
        });
      }
    }, intervalSeconds * 1000);
  }

  async ensureSenderReady(sender) {
    try {
      // Call getParameters to ensure sender is initialized
      await sender.getParameters();
      return true;
    } catch (error) {
      console.warn('Sender not ready:', error);
      return false;
    }
  }

  forceKeyframe(sender) {
    try {
      // First, ensure we have valid parameters by calling getParameters
      let params;
      try {
        params = sender.getParameters();
      } catch (error) {
        console.warn('Failed to get parameters, skipping keyframe forcing:', error);
        return;
      }
      
      if (params.encodings && params.encodings.length > 0) {
        const encoding = params.encodings[0];
        
        // Strategy 1: Toggle maxBitrate to force keyframe
        const originalMaxBitrate = encoding.maxBitrate;
        const originalMinBitrate = encoding.minBitrate;
        
        // Temporarily change bitrate parameters
        encoding.maxBitrate = originalMaxBitrate + 1000; // Increase by 1kbps
        encoding.minBitrate = originalMinBitrate + 500;  // Increase min bitrate
        
        sender.setParameters(params).then(() => {
          // Restore original parameters after a short delay
          setTimeout(() => {
            try {
              const restoreParams = sender.getParameters();
              if (restoreParams.encodings && restoreParams.encodings.length > 0) {
                restoreParams.encodings[0].maxBitrate = originalMaxBitrate;
                restoreParams.encodings[0].minBitrate = originalMinBitrate;
                sender.setParameters(restoreParams);
                console.log(`[KEYFRAME] Restored bitrate parameters`);
              }
            } catch (error) {
              console.warn('Failed to restore bitrate parameters:', error);
            }
          }, 100); // Short delay to allow keyframe generation
        }).catch(error => {
          console.warn('Failed to set bitrate parameters for keyframe:', error);
        });
        
        // Strategy 2: Toggle scaleResolutionDownBy
        setTimeout(() => {
          try {
            const scaleParams = sender.getParameters();
            if (scaleParams.encodings && scaleParams.encodings.length > 0) {
              const originalScale = scaleParams.encodings[0].scaleResolutionDownBy;
              scaleParams.encodings[0].scaleResolutionDownBy = originalScale === 1 ? 1.1 : 1;
              
              sender.setParameters(scaleParams).then(() => {
                // Restore scale
                setTimeout(() => {
                  try {
                    const restoreScaleParams = sender.getParameters();
                    if (restoreScaleParams.encodings && restoreScaleParams.encodings.length > 0) {
                      restoreScaleParams.encodings[0].scaleResolutionDownBy = originalScale;
                      sender.setParameters(restoreScaleParams);
                    }
                  } catch (error) {
                    console.warn('Failed to restore scale parameters:', error);
                  }
                }, 50);
              }).catch(error => {
                console.warn('Failed to set scale parameters:', error);
              });
            }
          } catch (error) {
            console.warn('Failed to toggle scale for keyframe:', error);
          }
        }, 50);
        
        // Strategy 3: Force track constraints refresh
        setTimeout(() => {
          try {
            if (sender.track && sender.track.applyConstraints) {
              const currentConstraints = sender.track.getConstraints();
              const newConstraints = {
                ...currentConstraints,
                frameRate: { ideal: 30, max: 30 },
                width: { ideal: this.encodingOptions.width || 1280 },
                height: { ideal: this.encodingOptions.height || 720 }
              };
              
              sender.track.applyConstraints(newConstraints).then(() => {
                console.log(`[KEYFRAME] Applied track constraints refresh`);
              }).catch(error => {
                console.warn('Failed to apply track constraints:', error);
              });
            }
          } catch (error) {
            console.warn('Failed to apply track constraints refresh:', error);
          }
        }, 100);
        
        console.log(`[KEYFRAME] Applied multiple forcing strategies`);
      }
    } catch (error) {
      console.warn('Failed to force keyframe:', error);
    }
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
    
    // Stop keyframe interval timer
    if (this.keyframeInterval) {
      clearInterval(this.keyframeInterval);
      this.keyframeInterval = null;
    }
    
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