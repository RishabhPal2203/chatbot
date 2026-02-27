# Project Structure

```
chatbot-sarvv/
│
├── backend/                          # Backend Python application
│   ├── __init__.py
│   ├── main.py                       # FastAPI application entry point
│   │
│   ├── routes/                       # API route handlers
│   │   ├── __init__.py
│   │   ├── chat.py                   # Chat endpoints (/chat/text, /chat/voice)
│   │   └── analytics.py              # Analytics endpoints
│   │
│   ├── services/                     # Business logic layer
│   │   ├── __init__.py
│   │   ├── chat_service.py           # Chat processing logic
│   │   └── speech_service.py         # Speech-to-text & text-to-speech
│   │
│   ├── nlp/                          # Natural Language Processing
│   │   ├── __init__.py
│   │   └── intent_detector.py        # Intent detection with spaCy
│   │
│   ├── models/                       # Database models
│   │   ├── __init__.py
│   │   └── conversation.py           # Conversation SQLAlchemy model
│   │
│   ├── database/                     # Database configuration
│   │   ├── __init__.py
│   │   └── config.py                 # SQLAlchemy setup & session management
│   │
│   ├── analytics/                    # Analytics services
│   │   ├── __init__.py
│   │   └── analytics_service.py      # Analytics queries & aggregations
│   │
│   └── utils/                        # Utility functions
│       ├── __init__.py
│       └── schemas.py                # Pydantic request/response schemas
│
├── frontend/                         # React frontend application
│   ├── public/
│   │   └── index.html                # HTML template
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat.js               # Main chat component
│   │   │   └── Chat.css              # Chat styling
│   │   │
│   │   ├── services/
│   │   │   └── api.js                # API client (axios)
│   │   │
│   │   ├── App.js                    # Root React component
│   │   ├── App.css                   # Global styles
│   │   └── index.js                  # React entry point
│   │
│   ├── Dockerfile                    # Frontend Docker configuration
│   └── package.json                  # Node.js dependencies
│
├── .env                              # Environment variables (local)
├── .env.example                      # Environment variables template
├── .gitignore                        # Git ignore rules
│
├── Dockerfile                        # Backend Docker configuration
├── docker-compose.yml                # Multi-container orchestration
│
├── requirements.txt                  # Python dependencies
│
├── setup.sh                          # Setup script for local development
├── start.sh                          # Quick start script
├── test_api.py                       # API testing script
│
├── README.md                         # Main documentation
├── DEPLOYMENT.md                     # Deployment guide
└── API_EXAMPLES.md                   # API usage examples
```

## Component Descriptions

### Backend Components

#### main.py
- FastAPI application initialization
- CORS middleware configuration
- Database initialization
- Route registration
- Static file serving for audio responses

#### routes/chat.py
- POST /chat/text - Text message endpoint
- POST /chat/voice - Voice message endpoint
- Handles session management
- Integrates chat and speech services

#### routes/analytics.py
- GET /analytics/summary - Overall statistics
- GET /analytics/intents - Intent distribution
- GET /analytics/daily - Daily conversation counts

#### services/chat_service.py
- Process user messages
- Detect intents using NLP
- Generate responses
- Log conversations to database

#### services/speech_service.py
- Convert speech to text (Google Speech Recognition)
- Convert text to speech (gTTS)
- Manage audio file storage

#### nlp/intent_detector.py
- Rule-based intent detection using regex
- spaCy NLP integration
- Confidence scoring
- Response generation

#### models/conversation.py
- SQLAlchemy ORM model
- Fields: session_id, user_input, detected_intent, bot_response, confidence_score, timestamp

#### database/config.py
- Database engine configuration
- Session management
- Dependency injection for routes

#### analytics/analytics_service.py
- Aggregate conversation statistics
- Calculate metrics (total, average confidence)
- Generate reports

#### utils/schemas.py
- Pydantic models for request validation
- Response serialization
- Type safety

### Frontend Components

#### components/Chat.js
- Main chat interface
- Message display (user/bot)
- Input handling
- Audio playback
- Intent/confidence display

#### services/api.js
- Axios HTTP client
- API endpoint wrappers
- Error handling

#### App.js
- Root component
- Layout structure

### Configuration Files

#### .env
- DATABASE_URL - Database connection string
- CORS_ORIGINS - Allowed origins for CORS
- LOG_LEVEL - Logging verbosity
- CONFIDENCE_THRESHOLD - Minimum confidence for intent detection

#### requirements.txt
- fastapi - Web framework
- uvicorn - ASGI server
- sqlalchemy - ORM
- pydantic - Data validation
- spacy - NLP library
- SpeechRecognition - Speech-to-text
- gTTS - Text-to-speech

#### package.json
- react - UI library
- axios - HTTP client
- react-scripts - Build tools

### Docker Files

#### Dockerfile (Backend)
- Python 3.11 base image
- Install system dependencies
- Install Python packages
- Download spaCy model
- Expose port 8000

#### frontend/Dockerfile
- Node 18 base image
- Install npm dependencies
- Expose port 3000

#### docker-compose.yml
- Backend service configuration
- Frontend service configuration
- Volume mounts
- Network configuration
- Environment variables

## Data Flow

### Text Chat Flow
1. User sends message via frontend
2. Frontend calls POST /chat/text
3. Backend receives request
4. ChatService processes message
5. IntentDetector analyzes text
6. Response generated
7. SpeechService creates audio
8. Conversation logged to database
9. Response returned to frontend
10. Frontend displays message and audio

### Voice Chat Flow
1. User records audio via frontend
2. Frontend uploads audio file
3. Backend receives audio
4. SpeechService converts to text
5. Same flow as text chat from step 4

### Analytics Flow
1. Frontend requests analytics
2. Backend queries database
3. AnalyticsService aggregates data
4. Results returned as JSON
5. Frontend displays metrics

## Database Schema

### conversations table
- id (INTEGER, PRIMARY KEY)
- session_id (VARCHAR, INDEX)
- user_input (VARCHAR)
- detected_intent (VARCHAR)
- bot_response (VARCHAR)
- confidence_score (FLOAT)
- timestamp (DATETIME)

## API Endpoints

### Chat Endpoints
- POST /chat/text - Send text message
- POST /chat/voice - Send voice message

### Analytics Endpoints
- GET /analytics/summary - Get overall statistics
- GET /analytics/intents - Get intent distribution
- GET /analytics/daily - Get daily conversation counts

### Utility Endpoints
- GET / - API information
- GET /health - Health check
- GET /docs - Swagger UI
- GET /redoc - ReDoc documentation
- GET /audio/{filename} - Serve audio files

## Supported Intents

1. **greeting** - Hello, hi, good morning
2. **complaint** - Issues, problems, complaints
3. **order_status** - Order tracking, delivery status
4. **pricing_query** - Pricing, cost, billing
5. **technical_support** - Technical help, errors, bugs
6. **goodbye** - Farewell messages
7. **fallback** - Unknown intents

## Technology Stack

### Backend
- **Framework**: FastAPI 0.104.1
- **Server**: Uvicorn 0.24.0
- **Database**: SQLAlchemy 2.0.23 + SQLite
- **NLP**: spaCy 3.7.2
- **Speech**: SpeechRecognition 3.10.0, gTTS 2.4.0
- **Validation**: Pydantic 2.5.0

### Frontend
- **Framework**: React 18.2.0
- **HTTP Client**: Axios 1.6.0
- **Build Tool**: React Scripts 5.0.1

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Environment**: Python 3.11, Node 18

## Extension Points

### Adding New Intents
1. Add pattern to `intent_patterns` in intent_detector.py
2. Add response to `responses` dictionary
3. Test with sample messages

### Switching to PostgreSQL
1. Update DATABASE_URL in .env
2. Install psycopg2-binary
3. Run migrations

### Adding Authentication
1. Install python-jose, passlib
2. Create auth middleware
3. Add user model
4. Protect endpoints with dependencies

### Implementing ML-based NLP
1. Install rasa or transformers
2. Train custom model
3. Replace IntentDetector logic
4. Update confidence scoring

### Adding More Analytics
1. Create new methods in AnalyticsService
2. Add routes in analytics.py
3. Update frontend to display new metrics

## Performance Considerations

- Use connection pooling for database
- Implement caching for frequent queries
- Use async/await for I/O operations
- Optimize audio file storage
- Add rate limiting for API endpoints
- Use CDN for static assets in production

## Security Best Practices

- Validate all user inputs
- Sanitize database queries (SQLAlchemy handles this)
- Use HTTPS in production
- Implement rate limiting
- Add authentication/authorization
- Secure environment variables
- Regular dependency updates
- Input size limits
- CORS configuration
