export class AudioStreamPlayer {
  constructor() {
    this.audioContext = null;
    this.audioQueue = [];
    this.isPlaying = false;
    this.nextStartTime = 0;
  }

  async initialize() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
      source.connect(this.audioContext.destination);
      
      const currentTime = this.audioContext.currentTime;
      const startTime = Math.max(currentTime, this.nextStartTime);
      
      source.start(startTime);
      this.nextStartTime = startTime + audioBuffer.duration;
      
      if (!this.isPlaying) {
        this.isPlaying = true;
      }
      
      source.onended = () => {
        if (this.nextStartTime <= this.audioContext.currentTime + 0.1) {
          this.isPlaying = false;
        }
      };
      
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  }

  stop() {
    this.isPlaying = false;
    this.nextStartTime = 0;
    this.audioQueue = [];
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  reset() {
    this.nextStartTime = this.audioContext?.currentTime || 0;
    this.isPlaying = false;
  }
}
