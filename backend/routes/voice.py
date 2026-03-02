from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from groq import Groq
import os
import re
from io import BytesIO
from gtts import gTTS

router = APIRouter(prefix="/api", tags=["voice"])

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

from typing import Optional

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class TTSRequest(BaseModel):
    text: str

# System prompt for domain restriction
SYSTEM_PROMPT = """You are a Cloud Contact Center Assistant, a specialized AI assistant focused exclusively on cloud contact center solutions.

Your knowledge domain includes:
- IVR (Interactive Voice Response) systems
- Call routing and ACD (Automatic Call Distribution)
- Omnichannel support (voice, chat, email, SMS)
- Cloud telephony and VoIP
- CRM integrations
- Agent dashboards and workforce management
- Contact center analytics and reporting
- SIP trunking and telephony infrastructure
- AI in contact centers (chatbots, voice AI, sentiment analysis)
- Quality management and call recording
- Contact center platforms (Amazon Connect, Twilio, Genesys, Five9, etc.)

You MUST:
- Only answer questions related to cloud contact centers
- Be concise and professional
- Provide technical and business insights

You MUST NOT:
- Answer questions outside the cloud contact center domain
- Provide general knowledge or unrelated information"""

# Multiple greeting variations for natural conversation
GREETING_RESPONSES = [
    "Hello! I'm your Cloud Contact Center Assistant. How can I help you today?",
    "Hi there! I specialize in cloud contact center solutions. What can I assist you with?",
    "Good day! I'm here to help with your contact center needs. What would you like to know?",
    "Hey! I'm your assistant for all things cloud contact centers. How may I help you?",
    "Welcome! I focus on cloud contact center solutions. What brings you here today?",
    "Hello! Ready to help with your contact center questions. What's on your mind?"
]

REFUSAL_MESSAGE = "I specialize in cloud contact center solutions like IVR, call routing, CRM integrations, and omnichannel support. I'd be happy to help you with questions in this area."

# Domain keywords for cloud contact centers
DOMAIN_KEYWORDS = [
    'ivr', 'interactive voice response', 'call routing', 'acd', 'automatic call distribution',
    'contact center', 'call center', 'omnichannel', 'cloud telephony', 'voip', 'sip',
    'crm', 'customer relationship', 'agent dashboard', 'workforce management',
    'call analytics', 'contact analytics', 'call recording', 'quality management',
    'amazon connect', 'twilio', 'genesys', 'five9', 'nice', 'avaya',
    'pbx', 'dialer', 'predictive dialer', 'auto dialer', 'outbound calling',
    'inbound calling', 'queue', 'call queue', 'hold time', 'wait time',
    'agent', 'supervisor', 'call monitoring', 'whisper coaching', 'barge in',
    'sentiment analysis', 'speech analytics', 'voice ai', 'chatbot integration',
    'sms support', 'email support', 'chat support', 'social media support',
    'escalation', 'call transfer', 'warm transfer', 'cold transfer',
    'skill based routing', 'priority routing', 'callback', 'virtual queue',
    'cti', 'computer telephony integration', 'screen pop', 'call disposition',
    'wrap up time', 'after call work', 'service level', 'sla', 'kpi',
    'average handle time', 'first call resolution', 'customer satisfaction',
    'net promoter score', 'csat', 'nps', 'fcr', 'aht'
]

GREETING_PATTERNS = [
    r'\b(hi|hello|hey|heyy|heyyy|yo|sup|wassup|whatsup|hola|namaste|salaam|salam)\b',
    r'\b(good morning|good afternoon|good evening|morning|afternoon|evening)\b',
    r'\b(howdy|greetings|salutations|aloha|bonjour|ciao|bro|dude|mate)\b'
]

def is_greeting(text: str) -> bool:
    """Detect if input is a greeting"""
    text_lower = text.lower().strip()
    for pattern in GREETING_PATTERNS:
        if re.search(pattern, text_lower):
            return True
    return False

def is_domain_related(text: str) -> bool:
    """Check if query is related to cloud contact centers"""
    text_lower = text.lower()
    
    # Check for domain keywords
    for keyword in DOMAIN_KEYWORDS:
        if keyword in text_lower:
            return True
    
    # Check for question patterns about contact centers
    question_patterns = [
        r'\b(how|what|why|when|where|which|can|should|is|are|do|does)\b.*\b(contact center|call center|customer service|support)\b',
    ]
    
    for pattern in question_patterns:
        if re.search(pattern, text_lower):
            return True
    
    return False

@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        audio_data = await file.read()
        print(f"Received audio file: {file.filename}, size: {len(audio_data)} bytes")
        
        transcript = client.audio.transcriptions.create(
            model="whisper-large-v3",
            file=(file.filename or "audio.webm", audio_data),
            response_format="verbose_json"
        )
        
        print(f"Transcription result: {transcript.text}")
        return {"text": transcript.text}
    except Exception as e:
        print(f"Transcription error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat")
async def chat(request: ChatRequest):
    try:
        user_message = request.message.strip()
        
        # Check if greeting
        if is_greeting(user_message):
            import random
            return {
                "response": random.choice(GREETING_RESPONSES),
                "session_id": request.session_id or "default",
                "type": "greeting"
            }
        
        # Check if domain-related
        if not is_domain_related(user_message):
            return {
                "response": REFUSAL_MESSAGE,
                "session_id": request.session_id or "default",
                "type": "out_of_scope"
            }
        
        # Call GROQ API for domain-related queries
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ]
        )
        
        return {
            "response": response.choices[0].message.content,
            "session_id": request.session_id or "default",
            "type": "domain_response"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tts")
async def text_to_speech(request: TTSRequest):
    try:
        tts = gTTS(text=request.text, lang='en', slow=False)
        audio_stream = BytesIO()
        tts.write_to_fp(audio_stream)
        audio_stream.seek(0)
        
        return StreamingResponse(
            audio_stream,
            media_type="audio/mpeg",
            headers={"Content-Disposition": "inline; filename=speech.mp3"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
