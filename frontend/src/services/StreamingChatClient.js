import StreamingAudioPlayer from './StreamingAudioPlayer';

class StreamingChatClient {
  constructor(onTextToken, onTextComplete, onAudioComplete) {
    this.ws = null;
    this.audioPlayer = new StreamingAudioPlayer();
    this.onTextToken = onTextToken;
    this.onTextComplete = onTextComplete;
    this.onAudioComplete = onAudioComplete;
    this.audioStartTime = null;
    this.isStreamingAudio = false;
  }

  connect() {
    const wsUrl = `ws://localhost:8000/ws/chat`;
    this.ws = new WebSocket(wsUrl);
    this.ws.binaryType = 'arraybuffer';

    this.ws.onopen = () => {
      console.log('WebSocket connected');
    };

    this.ws.onmessage = async (event) => {
      if (typeof event.data === 'string') {
        // Handle JSON messages (text tokens)
        const message = JSON.parse(event.data);
        console.log('[WS] Text message:', message.type);
        await this.handleTextMessage(message);
      } else {
        // Handle binary data (MP3 audio chunks)
        console.log(`[WS] Binary chunk: ${event.data.byteLength} bytes, isStreamingAudio: ${this.isStreamingAudio}`);
        await this.handleAudioChunk(event.data);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  async handleTextMessage(message) {
    switch (message.type) {
      case 'text_token':
        this.onTextToken(message.token);
        break;
      case 'text_complete':
        this.onTextComplete();
        break;
      case 'audio_complete':
        this.onAudioComplete();
        this.isStreamingAudio = false;
        break;
    }
  }

  async handleAudioChunk(arrayBuffer) {
    // Only process audio if explicitly requested
    if (!this.isStreamingAudio) {
      console.warn('Received unexpected audio chunk, ignoring');
      return;
    }

    if (!this.audioStartTime) {
      this.audioStartTime = performance.now();
    }

    // Play chunk immediately - no buffering
    await this.audioPlayer.addAudioChunk(arrayBuffer);

    // Log first chunk latency
    if (this.audioStartTime) {
      const latency = performance.now() - this.audioStartTime;
      console.log(`First audio chunk latency: ${latency.toFixed(2)}ms`);
      this.audioStartTime = null; // Only log first chunk
    }
  }

  sendMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // Stop any ongoing audio streaming
      this.isStreamingAudio = false;
      this.audioPlayer.stop();
      
      this.ws.send(JSON.stringify({ message }));
    }
  }

  requestAudio(text) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.isStreamingAudio = true;
      this.audioStartTime = performance.now();
      this.ws.send(JSON.stringify({ requestAudio: true, text }));
    }
  }

  stopAudio() {
    this.audioPlayer.stop();
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }

  getAudioLatency() {
    return this.audioPlayer.getLatency();
  }
}

export default StreamingChatClient;