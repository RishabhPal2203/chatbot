# Deployment Guide

## ✅ Fixed Import Issues

The application now uses **relative imports** that work in both local development and production deployment (Render, AWS, etc.).

## 🚀 Local Development

### Option 1: Using the Local Runner (Recommended)

```bash
# From project root
python run_local.py
```

### Option 2: Using uvicorn directly

```bash
# From project root (NOT from backend directory)
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### Option 3: Using the start script

```bash
# From project root
./start.sh
```

## 🌐 Render Deployment

The Dockerfile is already configured correctly for Render. Your build command should be:

```bash
docker build -t chatbot .
```

And the start command in Render should be:

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

### Render Configuration

1. **Build Command**: Leave empty (Render will use Dockerfile)
2. **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port 8000`
3. **Environment Variables**:
   - `DATABASE_URL` (if using PostgreSQL)
   - `CORS_ORIGINS` (your frontend URL)
   - `LOG_LEVEL=INFO`

## 🐳 Docker Deployment

The Dockerfile uses the correct command:

```dockerfile
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

This works because:
- The working directory is `/app`
- The backend code is in `/app/backend/`
- Python can import `backend.main` as a module

### Docker Compose

```bash
docker-compose up --build
```

## ☁️ AWS/Other Cloud Platforms

For AWS EC2, ECS, or other platforms:

1. Use the Dockerfile as-is
2. Ensure the start command is: `uvicorn backend.main:app --host 0.0.0.0 --port 8000`
3. Set environment variables appropriately

## 🔧 What Was Fixed

### Before (Broken)
```python
# In backend/main.py
from database.config import engine, Base  # ❌ Fails in production
from routes import chat, analytics        # ❌ Fails in production
```

### After (Fixed)
```python
# In backend/main.py
from .database.config import engine, Base  # ✅ Works everywhere
from .routes import chat, analytics        # ✅ Works everywhere
```

### Files Updated with Relative Imports

- ✅ `backend/main.py`
- ✅ `backend/routes/chat.py`
- ✅ `backend/routes/analytics.py`
- ✅ `backend/routes/voice.py`
- ✅ `backend/routes/streaming.py`
- ✅ `backend/services/chat_service.py`
- ✅ `backend/analytics/analytics_service.py`
- ✅ `backend/streaming_audio.py`

## 📝 Important Notes

1. **Never run from inside the backend directory** - Always run from project root
2. **Use `backend.main:app`** not `main:app` when using uvicorn
3. **The Dockerfile is correct** - Don't change the CMD line
4. **For local dev** - Use `python run_local.py` for easiest setup

## 🐛 Troubleshooting

### Error: "No module named 'database'"

**Cause**: Running from wrong directory or using wrong import style

**Solution**: 
- Run from project root: `python run_local.py`
- OR: `uvicorn backend.main:app --reload`

### Error: "attempted relative import beyond top-level package"

**Cause**: Running the file directly with `python backend/main.py`

**Solution**: Use uvicorn or the run_local.py script

### Docker works but local doesn't

**Cause**: Not running from project root

**Solution**: 
```bash
cd /path/to/chatbot-sarvv  # Go to project root
python run_local.py
```

## ✨ Testing

Test that everything works:

```bash
# Start the server
python run_local.py

# In another terminal, test the API
curl http://localhost:8000/health

# Should return: {"status": "healthy"}
```

## 🎯 Summary

- ✅ All imports are now relative (using `.` prefix)
- ✅ Works in Docker/Render/AWS
- ✅ Works in local development
- ✅ No code changes needed for deployment
- ✅ Single codebase for all environments
