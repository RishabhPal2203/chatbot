# 🚀 Getting Started - 5 Minutes to Running

## Choose Your Path

### 🐳 Path 1: Docker (Recommended - Easiest)

**Prerequisites:** Docker and Docker Compose installed

```bash
# 1. Navigate to project
cd "chatbot sarvv"

# 2. Start everything
docker-compose up

# 3. Open browser
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

**That's it! 🎉**

---

### 💻 Path 2: Local Development

**Prerequisites:** Python 3.11+, Node.js 18+

#### Step 1: Setup (First Time Only)

```bash
# Make setup script executable
chmod +x setup.sh

# Run setup
./setup.sh
```

This will:
- Create virtual environment
- Install Python dependencies
- Download spaCy model
- Install Node.js dependencies

#### Step 2: Start Backend

```bash
# Activate virtual environment
source venv/bin/activate  # On Linux/Mac
# OR
venv\Scripts\activate     # On Windows

# Start backend
python backend/main.py
```

Backend runs on: http://localhost:8000

#### Step 3: Start Frontend (New Terminal)

```bash
cd frontend
npm start
```

Frontend runs on: http://localhost:3000

---

### ⚡ Path 3: Quick Start Script

```bash
chmod +x start.sh
./start.sh
```

---

## 🧪 Test the System

### Method 1: Web Interface

1. Open http://localhost:3000
2. Type: "Hello"
3. See bot response with audio
4. Try: "How much does it cost?"
5. Click 🔊 to hear audio response

### Method 2: API Testing

```bash
# Test text chat
curl -X POST http://localhost:8000/chat/text \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'

# Test analytics
curl http://localhost:8000/analytics/summary
```

### Method 3: Test Script

```bash
python test_api.py
```

---

## 📱 What You'll See

### Frontend (http://localhost:3000)
- Modern chat interface
- Purple gradient header
- Message bubbles (user on right, bot on left)
- Intent badges showing detected intent
- Audio playback buttons
- Real-time responses

### Backend API (http://localhost:8000)
- JSON API responses
- Automatic documentation at /docs
- Health check at /health

### API Documentation (http://localhost:8000/docs)
- Interactive Swagger UI
- Try endpoints directly
- See request/response schemas

---

## 🎯 Try These Messages

| Message | Expected Intent | Response Type |
|---------|----------------|---------------|
| "Hello" | greeting | Welcome message |
| "I have a complaint" | complaint | Support escalation |
| "Where is my order?" | order_status | Order tracking help |
| "How much does it cost?" | pricing_query | Pricing information |
| "I need help" | technical_support | Technical assistance |
| "Goodbye" | goodbye | Farewell message |

---

## 📊 View Analytics

### Via API
```bash
curl http://localhost:8000/analytics/summary
```

### Via Browser
Open: http://localhost:8000/docs
Navigate to: GET /analytics/summary
Click "Try it out" → "Execute"

---

## 🛑 Stop the System

### Docker
```bash
docker-compose down
```

### Local Development
Press `Ctrl+C` in both terminal windows

---

## 🔧 Troubleshooting

### "Port already in use"
```bash
# Find and kill process on port 8000
lsof -i :8000
kill -9 <PID>

# Or use different port
uvicorn main:app --port 8001
```

### "Module not found"
```bash
# Reinstall dependencies
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### "npm command not found"
```bash
# Install Node.js from https://nodejs.org
# Then run:
cd frontend
npm install
```

### Docker issues
```bash
# Rebuild containers
docker-compose down
docker-compose up --build
```

---

## 📚 Next Steps

1. ✅ **Explore the API** - Visit http://localhost:8000/docs
2. ✅ **Test all intents** - Try different messages
3. ✅ **View analytics** - Check conversation statistics
4. ✅ **Read documentation** - See README.md for details
5. ✅ **Customize intents** - Edit backend/nlp/intent_detector.py
6. ✅ **Deploy** - Follow DEPLOYMENT.md guide

---

## 🎓 Learn More

- **Full Documentation**: [README.md](README.md)
- **API Examples**: [API_EXAMPLES.md](API_EXAMPLES.md)
- **Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Architecture**: [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- **Quick Reference**: [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

---

## 💡 Pro Tips

1. **Session Persistence**: Session ID is auto-generated and maintained across messages
2. **Audio Files**: Generated audio files are in `audio_responses/` directory
3. **Database**: SQLite database is `chatbot.db` - view with any SQLite browser
4. **Logs**: Check terminal output for detailed logs
5. **Hot Reload**: Frontend auto-reloads on code changes

---

## ✨ You're Ready!

The Cloud Contact Center AI Assistant is now running. Start chatting! 🎉

**Quick Access:**
- Chat: http://localhost:3000
- API: http://localhost:8000
- Docs: http://localhost:8000/docs

---

**Need help?** Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md) or [README.md](README.md)
