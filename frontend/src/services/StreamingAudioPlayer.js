class StreamingAudioPlayer {
  constructor() {
    this.audioContext = null;
    this.audioQueue = [];
    this.isPlaying = false;
    this.nextStartTime = 0;
    this.sampleRate = 22050;
    this.initAudioContext();
  }

  async initAudioContext() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: this.sampleRate
    });
  }

  async decodeMP3Chunk(mp3Chunk) {
    try {
      // Decode MP3 chunk directly
      const audioBuffer = await this.audioContext.decodeAudioData(mp3Chunk.slice());
      return audioBuffer;
    } catch (error) {
      console.warn('Decode error, skipping chunk:', error);
      return null;
    }
  }

  async playChunk(audioBuffer) {
    if (!audioBuffer) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);

    // Calculate precise timing to prevent gaps
    const currentTime = this.audioContext.currentTime;
    const startTime = Math.max(currentTime, this.nextStartTime);
    
    source.start(startTime);
    this.nextStartTime = startTime + audioBuffer.duration;

    // Clean up
    source.onended = () => {
      source.disconnect();
    };
  }

  async addAudioChunk(mp3Chunk) {
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const audioBuffer = await this.decodeMP3Chunk(mp3Chunk);
    if (audioBuffer) {
      // Play immediately without queuing
      await this.playChunk(audioBuffer);
      
      if (!this.isPlaying) {
        this.isPlaying = true;
        this.nextStartTime = this.audioContext.currentTime;
      }
    }
  }

  stop() {
    // Stop all audio immediately
    if (this.audioContext) {
      this.audioContext.suspend();
    }
    this.isPlaying = false;
    this.nextStartTime = 0;
    this.audioQueue = [];
  }

  getLatency() {
    return this.audioContext ? this.audioContext.outputLatency || 0 : 0;
  }
}

export default StreamingAudioPlayer;