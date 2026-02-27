# Quick Reference Guide

## 🚀 Quick Start Commands

### Local Development

```bash
# Setup (first time only)
chmod +x setup.sh
./setup.sh

# Start backend
python backend/main.py

# Start frontend (in new terminal)
cd frontend
npm start
```

### Docker

```bash
# Start everything
docker-compose up

# Start in background
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Rebuild
docker-compose up --build
```

## 📡 API Quick Reference

### Base URL
```
http://localhost:8000
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /chat/text | Send text message |
| POST | /chat/voice | Send voice message |
| GET | /analytics/summary | Get analytics summary |
| GET | /analytics/intents | Get intent distribution |
| GET | /analytics/daily | Get daily stats |
| GET | /health | Health check |
| GET | /docs | API documentation |

### Quick Test

```bash
# Test text chat
curl -X POST http://localhost:8000/chat/text \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'

# Test analytics
curl http://localhost:8000/analytics/summary

# Test health
curl http://localhost:8000/health
```

## 🧪 Testing

```bash
# Run test script
python test_api.py

# Manual testing
# 1. Open http://localhost:3000
# 2. Type: "Hello"
# 3. Type: "How much does it cost?"
# 4. Type: "I need help"
```

## 🎯 Sample Messages

| Message | Expected Intent |
|---------|----------------|
| "Hello" | greeting |
| "I have a complaint" | complaint |
| "Where is my order?" | order_status |
| "How much does it cost?" | pricing_query |
| "I need technical support" | technical_support |
| "Goodbye" | goodbye |
| "Random text" | fallback |

## 🔧 Configuration

### Environment Variables (.env)

```env
DATABASE_URL=sqlite:///./chatbot.db
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
LOG_LEVEL=INFO
CONFIDENCE_THRESHOLD=0.6
```

### Ports

- Backend: 8000
- Frontend: 3000

## 📁 Important Files

| File | Purpose |
|------|---------|
| backend/main.py | FastAPI app |
| backend/nlp/intent_detector.py | Intent detection |
| backend/routes/chat.py | Chat endpoints |
| frontend/src/components/Chat.js | Chat UI |
| docker-compose.yml | Docker config |
| requirements.txt | Python deps |

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check Python version
python3 --version  # Should be 3.11+

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm
```

### Frontend won't start

```bash
# Install dependencies
cd frontend
npm install

# Clear cache
rm -rf node_modules package-lock.json
npm install
```

### Port already in use

```bash
# Find process
lsof -i :8000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Docker issues

```bash
# Remove all containers
docker-compose down -v

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up
```

### Database locked

```bash
# Stop all processes
pkill -f "python backend/main.py"

# Remove database
rm chatbot.db

# Restart
python backend/main.py
```

## 📊 Monitoring

### Check logs

```bash
# Backend logs
tail -f log

# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Check database

```bash
# SQLite
sqlite3 chatbot.db "SELECT COUNT(*) FROM conversations;"
sqlite3 chatbot.db "SELECT * FROM conversations LIMIT 5;"
```

### Check API health

```bash
curl http://localhost:8000/health
```

## 🔐 Security Checklist

- [ ] Change default environment variables
- [ ] Use PostgreSQL in production
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Implement authentication
- [ ] Validate all inputs
- [ ] Regular security updates

## 📦 Dependencies

### Python (requirements.txt)
- fastapi==0.104.1
- uvicorn==0.24.0
- sqlalchemy==2.0.23
- pydantic==2.5.0
- spacy==3.7.2
- SpeechRecognition==3.10.0
- gTTS==2.4.0

### Node (package.json)
- react==18.2.0
- axios==1.6.0
- react-scripts==5.0.1

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc) | http://localhost:8000/redoc |

## 💡 Tips

1. **Session Management**: Session ID is auto-generated on first message
2. **Audio Files**: Stored in `audio_responses/` directory
3. **Database**: SQLite file is `chatbot.db`
4. **Logs**: Check console output for errors
5. **CORS**: Add your domain to CORS_ORIGINS in .env

## 🚢 Deployment

### Quick Deploy to AWS EC2

```bash
# 1. SSH to EC2
ssh -i key.pem ubuntu@your-ip

# 2. Install Docker
sudo apt update
sudo apt install docker.io docker-compose -y

# 3. Clone and run
git clone <repo>
cd chatbot-sarvv
sudo docker-compose up -d
```

### Check Deployment

```bash
# Check services
docker-compose ps

# Check logs
docker-compose logs

# Test API
curl http://your-ip:8000/health
```

## 📚 Documentation

- [README.md](README.md) - Main documentation
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [API_EXAMPLES.md](API_EXAMPLES.md) - API examples
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Architecture details

## 🆘 Getting Help

1. Check logs for errors
2. Review documentation
3. Test with curl commands
4. Check GitHub issues
5. Verify all dependencies installed

## 🎓 Learning Resources

- FastAPI: https://fastapi.tiangolo.com
- React: https://react.dev
- spaCy: https://spacy.io
- Docker: https://docs.docker.com
- SQLAlchemy: https://www.sqlalchemy.org

---

**Need more help?** Check the full documentation in README.md
