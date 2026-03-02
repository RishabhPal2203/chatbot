# 🚀 Groq API Setup Guide

## Quick Setup

### 1️⃣ Get Groq API Key

1. Go to https://console.groq.com
2. Sign up / Log in
3. Navigate to API Keys
4. Create new API key
5. Copy the key (starts with `gsk_...`)

### 2️⃣ Configure Backend

Edit `backend/.env`:
```env
GROQ_API_KEY=gsk_your_actual_key_here
```

### 3️⃣ Install Dependencies

```bash
cd backend
pip install groq==0.11.0 httpx==0.27.0
```

### 4️⃣ Start Services

```bash
# Terminal 1 - Backend
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 - Frontend
cd frontend
npm start
```

---

## 🎯 What Changed

| Feature | Provider | Model |
|---------|----------|-------|
| Speech-to-Text | Groq | whisper-large-v3 |
| Chat AI | Groq | llama-3.3-70b-versatile |
| Text-to-Speech | gTTS (Free) | Google TTS |

---

## ⚡ Why Groq?

- **10x faster** than OpenAI (500+ tokens/sec)
- **Free tier** available
- **Same API format** as OpenAI
- **Whisper + Llama** models included

---

## 💰 Pricing

**Groq Free Tier:**
- 30 requests/minute
- 14,400 requests/day
- Perfect for development!

**Paid:** $0.05-0.27 per 1M tokens (cheaper than OpenAI)

---

## 🧪 Test It

```bash
# Test transcription
curl -X POST http://localhost:8000/api/transcribe \
  -F "file=@audio.webm"

# Test chat
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

---

## 🔧 Available Models

**Chat Models:**
- `llama-3.3-70b-versatile` (default, best quality)
- `llama-3.1-8b-instant` (faster)
- `mixtral-8x7b-32768` (long context)

**Whisper Models:**
- `whisper-large-v3` (best accuracy)

Change in `backend/routes/voice.py`:
```python
model="llama-3.1-8b-instant"  # For faster responses
```

---

## ✅ Success!

Your chatbot now uses:
- ⚡ **Groq** for ultra-fast AI responses
- 🎤 **Groq Whisper** for speech recognition  
- 🔊 **gTTS** for text-to-speech (free, no API key needed)

**Ready to test!** Open http://localhost:3000 and click 🎤
