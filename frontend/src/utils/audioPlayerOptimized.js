export class AudioStreamPlayer {
  constructor() {
    this.audioContext = null;
    this.nextStartTime = 0;
    this.isPlaying = false;
    this.pendingSources = [];
  }

  async initialize() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        latencyHint: 'interactive',
        sampleRate: 24000
      });
    }
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  async playChunk(audioData) {
    await this.initialize();
    
    try {
      const audioBuffer = await this.audioContext.decodeAudioData(audioData);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      
      // Add gain node for volume control
      const gainNode = this.audioContext.createGain();
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      const currentTime = this.audioContext.currentTime;
      const startTime = Math.max(currentTime, this.nextStartTime);
      
      source.start(startTime);
      this.nextStartTime = startTime + audioBuffer.duration;
      this.isPlaying = true;
      
      this.pendingSources.push(source);
      
      source.onended = () => {
        this.pendingSources = this.pendingSources.filter(s => s !== source);
        if (this.pendingSources.length === 0) {
          this.isPlaying = false;
        }
      };
      
    } catch (error) {
      console.error('Audio decode error:', error);
    }
  }

  stop() {
    this.pendingSources.forEach(source => {
      try {
        source.stop();
      } catch (e) {}
    });
    
    this.pendingSources = [];
    this.isPlaying = false;
    this.nextStartTime = 0;
  }

  reset() {
    this.stop();
    if (this.audioContext) {
      this.nextStartTime = this.audioContext.currentTime;
    }
  }

  async close() {
    this.stop();
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }
  }
}
