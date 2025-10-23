'use strict';

class WebRTCStats {
  constructor(peerConnection, containerId) {
    this.peerConnection = peerConnection;
    this.container = document.getElementById(containerId);
    this.statsInterval = null;
    this.isRunning = false;
    
    this.createStatsUI();
    this.startStatsCollection();
  }

  createStatsUI() {
    this.container.innerHTML = `
      <div class="stats-container">
        <h3>WebRTC Statistics</h3>
        <div class="stats-controls">
          <button id="toggleStats" class="stats-toggle">Hide Statistics</button>
          <button id="exportStats" class="stats-export">Export Stats</button>
        </div>
        <div class="stats-content" id="statsContent">
          <div class="stats-section">
            <h4>Connection State</h4>
            <div id="connectionStats" class="stats-grid"></div>
          </div>
          <div class="stats-section">
            <h4>Outbound RTP (Send)</h4>
            <div id="outboundStats" class="stats-grid"></div>
          </div>
          <div class="stats-section">
            <h4>Inbound RTP (Receive)</h4>
            <div id="inboundStats" class="stats-grid"></div>
          </div>
          <div class="stats-section">
            <h4>ICE Candidates</h4>
            <div id="iceStats" class="stats-grid"></div>
          </div>
          <div class="stats-section">
            <h4>Transport</h4>
            <div id="transportStats" class="stats-grid"></div>
          </div>
        </div>
      </div>
    `;

    // Add event listeners
    document.getElementById('toggleStats').addEventListener('click', () => this.toggleStats());
    document.getElementById('exportStats').addEventListener('click', () => this.exportStats());
  }

  startStatsCollection() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.statsInterval = setInterval(() => {
      this.collectAndDisplayStats();
    }, 1000); // Update every second
  }

  stopStatsCollection() {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
    this.isRunning = false;
  }

  async collectAndDisplayStats() {
    try {
      const stats = await this.peerConnection.getStats();
      this.displayConnectionStats(stats);
      this.displayOutboundStats(stats);
      this.displayInboundStats(stats);
      this.displayIceStats(stats);
      this.displayTransportStats(stats);
    } catch (error) {
      console.error('Error collecting WebRTC stats:', error);
    }
  }

  displayConnectionStats(stats) {
    const container = document.getElementById('connectionStats');
    const connectionState = this.peerConnection.connectionState;
    const iceConnectionState = this.peerConnection.iceConnectionState;
    const iceGatheringState = this.peerConnection.iceGatheringState;
    const signalingState = this.peerConnection.signalingState;

    container.innerHTML = `
      <div class="stat-item">
        <span class="stat-label">Connection State:</span>
        <span class="stat-value ${this.getStateClass(connectionState)}">${connectionState}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">ICE Connection:</span>
        <span class="stat-value ${this.getStateClass(iceConnectionState)}">${iceConnectionState}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">ICE Gathering:</span>
        <span class="stat-value ${this.getStateClass(iceGatheringState)}">${iceGatheringState}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Signaling State:</span>
        <span class="stat-value ${this.getStateClass(signalingState)}">${signalingState}</span>
      </div>
    `;
  }

  displayOutboundStats(stats) {
    const container = document.getElementById('outboundStats');
    let outboundStats = [];

    stats.forEach(report => {
      if (report.type === 'outbound-rtp') {
        outboundStats.push({
          kind: report.kind,
          ssrc: report.ssrc,
          packetsSent: report.packetsSent,
          bytesSent: report.bytesSent,
          framesEncoded: report.framesEncoded,
          keyFramesEncoded: report.keyFramesEncoded,
          frameWidth: report.frameWidth,
          frameHeight: report.frameHeight,
          framesPerSecond: report.framesPerSecond,
          qualityLimitationReason: report.qualityLimitationReason,
          encoderImplementation: report.encoderImplementation,
          timestamp: report.timestamp
        });
      }
    });

    if (outboundStats.length === 0) {
      container.innerHTML = '<div class="no-stats">No outbound RTP statistics available</div>';
      return;
    }

    let html = '';
    outboundStats.forEach((stat, index) => {
      html += `
        <div class="stat-group">
          <h5>${stat.kind.toUpperCase()} Stream ${index + 1}</h5>
          <div class="stat-item">
            <span class="stat-label">SSRC:</span>
            <span class="stat-value">${stat.ssrc || 'N/A'}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Packets Sent:</span>
            <span class="stat-value">${stat.packetsSent || 0}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Bytes Sent:</span>
            <span class="stat-value">${this.formatBytes(stat.bytesSent || 0)}</span>
          </div>
          ${stat.kind === 'video' ? `
          <div class="stat-item">
            <span class="stat-label">Frames Encoded:</span>
            <span class="stat-value">${stat.framesEncoded || 0}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Key Frames:</span>
            <span class="stat-value">${stat.keyFramesEncoded || 0}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Resolution:</span>
            <span class="stat-value">${stat.frameWidth || 0}x${stat.frameHeight || 0}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">FPS:</span>
            <span class="stat-value">${(stat.framesPerSecond || 0).toFixed(1)}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Quality Limitation:</span>
            <span class="stat-value">${stat.qualityLimitationReason || 'none'}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Encoder:</span>
            <span class="stat-value">${stat.encoderImplementation || 'unknown'}</span>
          </div>
          ` : ''}
        </div>
      `;
    });

    container.innerHTML = html;
  }

  displayInboundStats(stats) {
    const container = document.getElementById('inboundStats');
    let inboundStats = [];

    stats.forEach(report => {
      if (report.type === 'inbound-rtp') {
        inboundStats.push({
          kind: report.kind,
          ssrc: report.ssrc,
          packetsReceived: report.packetsReceived,
          bytesReceived: report.bytesReceived,
          packetsLost: report.packetsLost,
          jitter: report.jitter,
          framesDecoded: report.framesDecoded,
          keyFramesDecoded: report.keyFramesDecoded,
          frameWidth: report.frameWidth,
          frameHeight: report.frameHeight,
          framesPerSecond: report.framesPerSecond,
          decoderImplementation: report.decoderImplementation,
          timestamp: report.timestamp
        });
      }
    });

    if (inboundStats.length === 0) {
      container.innerHTML = '<div class="no-stats">No inbound RTP statistics available</div>';
      return;
    }

    let html = '';
    inboundStats.forEach((stat, index) => {
      html += `
        <div class="stat-group">
          <h5>${stat.kind.toUpperCase()} Stream ${index + 1}</h5>
          <div class="stat-item">
            <span class="stat-label">SSRC:</span>
            <span class="stat-value">${stat.ssrc || 'N/A'}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Packets Received:</span>
            <span class="stat-value">${stat.packetsReceived || 0}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Bytes Received:</span>
            <span class="stat-value">${this.formatBytes(stat.bytesReceived || 0)}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Packets Lost:</span>
            <span class="stat-value">${stat.packetsLost || 0}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Jitter:</span>
            <span class="stat-value">${(stat.jitter || 0).toFixed(3)}s</span>
          </div>
          ${stat.kind === 'video' ? `
          <div class="stat-item">
            <span class="stat-label">Frames Decoded:</span>
            <span class="stat-value">${stat.framesDecoded || 0}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Key Frames:</span>
            <span class="stat-value">${stat.keyFramesDecoded || 0}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Resolution:</span>
            <span class="stat-value">${stat.frameWidth || 0}x${stat.frameHeight || 0}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">FPS:</span>
            <span class="stat-value">${(stat.framesPerSecond || 0).toFixed(1)}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Decoder:</span>
            <span class="stat-value">${stat.decoderImplementation || 'unknown'}</span>
          </div>
          ` : ''}
        </div>
      `;
    });

    container.innerHTML = html;
  }

  displayIceStats(stats) {
    const container = document.getElementById('iceStats');
    let iceStats = [];

    stats.forEach(report => {
      if (report.type === 'candidate-pair') {
        iceStats.push({
          state: report.state,
          nominated: report.nominated,
          priority: report.priority,
          localCandidateId: report.localCandidateId,
          remoteCandidateId: report.remoteCandidateId,
          bytesSent: report.bytesSent,
          bytesReceived: report.bytesReceived,
          roundTripTime: report.roundTripTime,
          availableOutgoingBitrate: report.availableOutgoingBitrate,
          availableIncomingBitrate: report.availableIncomingBitrate
        });
      }
    });

    if (iceStats.length === 0) {
      container.innerHTML = '<div class="no-stats">No ICE candidate statistics available</div>';
      return;
    }

    let html = '';
    iceStats.forEach((stat, index) => {
      html += `
        <div class="stat-group">
          <h5>Candidate Pair ${index + 1}</h5>
          <div class="stat-item">
            <span class="stat-label">State:</span>
            <span class="stat-value ${this.getStateClass(stat.state)}">${stat.state}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Nominated:</span>
            <span class="stat-value">${stat.nominated ? 'Yes' : 'No'}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Priority:</span>
            <span class="stat-value">${stat.priority || 'N/A'}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Bytes Sent:</span>
            <span class="stat-value">${this.formatBytes(stat.bytesSent || 0)}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Bytes Received:</span>
            <span class="stat-value">${this.formatBytes(stat.bytesReceived || 0)}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">RTT:</span>
            <span class="stat-value">${(stat.roundTripTime || 0).toFixed(3)}s</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Outgoing Bitrate:</span>
            <span class="stat-value">${this.formatBitrate(stat.availableOutgoingBitrate || 0)}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Incoming Bitrate:</span>
            <span class="stat-value">${this.formatBitrate(stat.availableIncomingBitrate || 0)}</span>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  displayTransportStats(stats) {
    const container = document.getElementById('transportStats');
    let transportStats = [];

    stats.forEach(report => {
      if (report.type === 'transport') {
        transportStats.push({
          bytesReceived: report.bytesReceived,
          bytesSent: report.bytesSent,
          packetsReceived: report.packetsReceived,
          packetsSent: report.packetsSent,
          dtlsState: report.dtlsState,
          iceState: report.iceState,
          selectedCandidatePairId: report.selectedCandidatePairId
        });
      }
    });

    if (transportStats.length === 0) {
      container.innerHTML = '<div class="no-stats">No transport statistics available</div>';
      return;
    }

    let html = '';
    transportStats.forEach((stat, index) => {
      html += `
        <div class="stat-group">
          <h5>Transport ${index + 1}</h5>
          <div class="stat-item">
            <span class="stat-label">DTLS State:</span>
            <span class="stat-value ${this.getStateClass(stat.dtlsState)}">${stat.dtlsState}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">ICE State:</span>
            <span class="stat-value ${this.getStateClass(stat.iceState)}">${stat.iceState}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Packets Sent:</span>
            <span class="stat-value">${stat.packetsSent || 0}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Packets Received:</span>
            <span class="stat-value">${stat.packetsReceived || 0}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Bytes Sent:</span>
            <span class="stat-value">${this.formatBytes(stat.bytesSent || 0)}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Bytes Received:</span>
            <span class="stat-value">${this.formatBytes(stat.bytesReceived || 0)}</span>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  getStateClass(state) {
    switch (state) {
      case 'connected':
      case 'completed':
      case 'succeeded':
        return 'state-success';
      case 'connecting':
      case 'checking':
      case 'gathering':
        return 'state-warning';
      case 'disconnected':
      case 'failed':
      case 'closed':
        return 'state-error';
      default:
        return 'state-info';
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatBitrate(bitsPerSecond) {
    if (bitsPerSecond === 0) return '0 bps';
    const k = 1000;
    const sizes = ['bps', 'Kbps', 'Mbps', 'Gbps'];
    const i = Math.floor(Math.log(bitsPerSecond) / Math.log(k));
    return parseFloat((bitsPerSecond / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  toggleStats() {
    const content = document.getElementById('statsContent');
    const button = document.getElementById('toggleStats');
    
    if (content.style.display === 'none') {
      content.style.display = 'block';
      button.textContent = 'Hide Statistics';
    } else {
      content.style.display = 'none';
      button.textContent = 'Show Statistics';
    }
  }

  async exportStats() {
    try {
      const stats = await this.peerConnection.getStats();
      const statsArray = Array.from(stats.values());
      const statsJson = JSON.stringify(statsArray, null, 2);
      
      const blob = new Blob([statsJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `webrtc-stats-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting stats:', error);
      alert('Failed to export statistics');
    }
  }

  destroy() {
    this.stopStatsCollection();
  }
}
