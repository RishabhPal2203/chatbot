# 🤖 Cloud Contact Center AI Assistant

A production-ready Voice and Text-Based Conversational AI Chatbot that simulates a Cloud Contact-Center Support Assistant, similar to enterprise platforms like Amazon Connect or Twilio Flex.

## 🌟 Features

- ✅ **Dual Input Modes**: Text chat and voice input
- ✅ **Speech-to-Text**: Convert voice to text using Google Speech Recognition
- ✅ **Text-to-Speech**: Generate audio responses using gTTS
- ✅ **NLP Intent Detection**: 8 pre-trained intents using spaCy
- ✅ **Conversation Logging**: SQLite database with full conversation history
- ✅ **Analytics Dashboard**: Real-time metrics and insights
- ✅ **RESTful API**: FastAPI with automatic documentation
- ✅ **Modern UI**: React-based chat interface
- ✅ **Docker Support**: Full containerization with docker-compose

## 📋 Supported Intents

1. **greeting** - Welcome messages
2. **complaint** - Customer complaints
3. **order_status** - Order tracking queries
4. **pricing_query** - Pricing information
5. **technical_support** - Technical assistance
6. **goodbye** - Farewell messages
7. **fallback** - Unknown intents

## 🏗 Architecture

```
chatbot-sarvv/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── routes/
│   │   ├── chat.py            # Chat endpoints
│   │   └── analytics.py       # Analytics endpoints
│   ├── services/
│   │   ├── chat_service.py    # Chat logic
│   │   └── speech_service.py  # Speech processing
│   ├── nlp/
│   │   └── intent_detector.py # NLP engine
│   ├── models/
│   │   └── conversation.py    # Database models
│   ├── database/
│   │   └── config.py          # Database configuration
│   ├── analytics/
│   │   └── analytics_service.py
│   └── utils/
│       └── schemas.py         # Pydantic schemas
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat.js
│   │   │   └── Chat.css
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose (optional)

### Option 1: Local Setup

#### Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Run backend
cd backend
python main.py
```

Backend will run on `http://localhost:8000`

#### Frontend Setup

```bash
# Install Node dependencies
cd frontend
npm install

# Start React app
npm start
```

Frontend will run on `http://localhost:3000`

### Option 2: Docker Setup

```bash
# Build and run all services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop services
docker-compose down
```

## 📡 API Endpoints

### Chat Endpoints

#### POST `/chat/text`
Send text message to chatbot

**Request:**
```json
{
  "message": "Hello, I need help",
  "session_id": "optional-session-id"
}
```

**Response:**
```json
{
  "response": "Hello! I'm your Cloud Contact Center Assistant...",
  "intent": "greeting",
  "confidence": 0.85,
  "session_id": "uuid-here",
  "audio_url": "/audio/response.mp3"
}
```

#### POST `/chat/voice`
Send voice message to chatbot

**Request:** Multipart form data with audio file

**Response:** Same as text endpoint

### Analytics Endpoints

#### GET `/analytics/summary`
Get overall analytics summary

**Response:**
```json
{
  "total_conversations": 150,
  "average_confidence": 0.78,
  "intent_distribution": {
    "greeting": 45,
    "technical_support": 30,
    "pricing_query": 25
  }
}
```

#### GET `/analytics/intents`
Get intent distribution

#### GET `/analytics/daily?days=7`
Get daily conversation counts

## 🧪 Testing the API

### Using cURL

```bash
# Test text chat
curl -X POST http://localhost:8000/chat/text \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'

# Test analytics
curl http://localhost:8000/analytics/summary
```

### Using Python

```python
import requests

response = requests.post(
    "http://localhost:8000/chat/text",
    json={"message": "What are your prices?"}
)
print(response.json())
```

## 🎨 Frontend Usage

1. Open `http://localhost:3000`
2. Type a message in the input box
3. Press Enter or click Send
4. View bot response with detected intent
5. Click 🔊 Play to hear audio response

## 🗄 Database Schema

```sql
CREATE TABLE conversations (
    id INTEGER PRIMARY KEY,
    session_id VARCHAR,
    user_input VARCHAR,
    detected_intent VARCHAR,
    bot_response VARCHAR,
    confidence_score FLOAT,
    timestamp DATETIME
);
```

## 🔧 Configuration

Edit `.env` file:

```env
DATABASE_URL=sqlite:///./chatbot.db
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
LOG_LEVEL=INFO
CONFIDENCE_THRESHOLD=0.6
```

## 📊 Sample Test Data

Test these messages:

- "Hello" → greeting
- "I have a complaint" → complaint
- "Where is my order?" → order_status
- "How much does it cost?" → pricing_query
- "I need technical help" → technical_support
- "Goodbye" → goodbye

## 🚢 Deployment

### AWS EC2 Deployment

```bash
# SSH into EC2 instance
ssh -i key.pem ubuntu@your-ec2-ip

# Install Docker
sudo apt update
sudo apt install docker.io docker-compose -y

# Clone repository
git clone <your-repo>
cd chatbot-sarvv

# Run with Docker
sudo docker-compose up -d
```

### Environment Variables for Production

```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
CORS_ORIGINS=https://yourdomain.com
LOG_LEVEL=WARNING
```

## 🔐 Security Considerations

- Use PostgreSQL in production
- Enable HTTPS with SSL certificates
- Implement rate limiting
- Add authentication/authorization
- Sanitize user inputs
- Use environment variables for secrets

## 📈 Extending the System

### Adding New Intents

Edit `backend/nlp/intent_detector.py`:

```python
self.intent_patterns["new_intent"] = [
    r"\b(keyword1|keyword2)\b",
]

self.responses["new_intent"] = "Response text"
```

### Switching to PostgreSQL

Update `.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/chatbot
```

Install psycopg2:
```bash
pip install psycopg2-binary
```

### Adding More NLP Features

Replace rule-based with ML:
```bash
pip install rasa
```

## 🐛 Troubleshooting

**Issue:** spaCy model not found
```bash
python -m spacy download en_core_web_sm
```

**Issue:** Audio not playing
- Check CORS settings
- Verify audio file permissions
- Check browser console for errors

**Issue:** Database locked
- Close other connections
- Use PostgreSQL for production

## 📝 API Documentation

Interactive API docs available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License

## 👥 Support

For issues and questions, please open a GitHub issue.

---

**Built with ❤️ using FastAPI, React, and spaCy**
