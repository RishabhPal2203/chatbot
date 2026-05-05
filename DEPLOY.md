# Deployment Guide for Render

## Architecture
- **Frontend:** React SPA served as static site
- **Backend:** FastAPI REST + WebSocket API
- **Two separate Render services**

## Setup Steps

### 1. Create Backend Service on Render

1. Go to Render Dashboard → New → Web Service
2. Connect your GitHub repository
3. Service Name: `chatbot-backend`
4. Root Directory: `backend`
5. Runtime: `Python 3`
6. Build Command: `pip install -r requirements.txt`
7. Start Command: `python main.py`
8. Environment Variables:
   - `DATABASE_URL` = `sqlite:///./chatbot.db`
   - `CORS_ORIGINS` = `https://chatbot-frontend.onrender.com`
   - `LOG_LEVEL` = `INFO`
   - `PORT` = `8000`

### 2. Create Frontend Service on Render

1. Go to Render Dashboard → New → Static Site
2. Connect your GitHub repository
3. Service Name: `chatbot-frontend`
4. Root Directory: `frontend`
5. Build Command: `npm ci && npm run build`
6. Publish Directory: `build`
7. Environment Variables:
   - `REACT_APP_API_URL` = `https://chatbot-backend.onrender.com`

### 3. Deploy Order

1. Deploy **backend** first (takes ~2-3 minutes)
2. Deploy **frontend** second (takes ~3-5 minutes)

### 4. Access Your App

- **Frontend URL:** `https://chatbot-frontend.onrender.com`
- **Backend API:** `https://chatbot-backend.onrender.com`

### 5. First-Time Use

1. Open the frontend URL
2. You'll see a Settings modal requiring your Groq API key
3. Get your API key from https://console.groq.com/keys
4. Enter the key (must start with `gsk_`)
5. Start chatting!

## Troubleshooting

### Black Screen / JSON Output
- **Cause:** Visiting backend URL instead of frontend URL
- **Fix:** Use the frontend service URL

### CORS Errors
- **Cause:** Backend CORS not configured for frontend URL
- **Fix:** Update `CORS_ORIGINS` in backend env to include frontend URL

### API Key Validation Error
- **Cause:** Invalid Groq API key format
- **Fix:** Ensure key starts with `gsk_` (get a new key from Groq console)

### Frontend Not Loading
- **Cause:** Frontend build failed or not deployed
- **Fix:** Check Render logs for frontend service build errors

## Local Development

```bash
# Start backend
cd backend
python run_local.py

# Start frontend (in another terminal)
cd frontend
npm start
```

Frontend: http://localhost:3000
Backend: http://localhost:8000
