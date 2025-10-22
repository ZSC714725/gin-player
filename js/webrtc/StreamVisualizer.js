'use strict';

class StreamVisualizer {
  constructor(stream, canvas) {
    this.stream = stream;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.animationId = null;
  }

  start() {
    if (this.audioContext) {
      return;
    }

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    const source = this.audioContext.createMediaStreamSource(this.stream);
    source.connect(this.analyser);

    this.analyser.fftSize = 256;
    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);

    this.draw();
  }

  draw() {
    this.animationId = requestAnimationFrame(() => this.draw());

    this.analyser.getByteFrequencyData(this.dataArray);

    this.ctx.fillStyle = 'rgb(0, 0, 0)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const barWidth = (this.canvas.width / this.dataArray.length) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < this.dataArray.length; i++) {
      barHeight = (this.dataArray[i] / 255) * this.canvas.height;

      this.ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
      this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
