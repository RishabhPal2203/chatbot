from groq import Groq
from models.conversation import Conversation
from sqlalchemy.orm import Session
from fastapi import Request
import os
from datetime import datetime
import re

class ChatService:
    def __init__(self):
        self._client = None
        self.system_prompt = """You are a Cloud Contact Center Assistant. You help with IVR systems, omnichannel support, cloud telephony, CRM integrations, contact center analytics, and platforms like Amazon Connect, Twilio, Genesys.

FORMATTING RULES (MANDATORY):
- Use ## for section headings
- Use numbered lists (1. 2. 3.) for steps or sequential items
- Use bullet points (• or -) for feature lists
- Use **bold** for important terms and keywords
- Add blank lines between sections
- Keep responses well-structured and scannable

EXAMPLE FORMAT:
## Main Topic
Brief intro text.

• **Feature 1**: Description
• **Feature 2**: Description

## Steps
1. **First step**: Details
2. **Second step**: Details

Be concise, professional, and always use proper formatting."""
    
    def get_client(self, request: Request):
        """Get Groq client with current session's API key"""
        from routes.settings import get_groq_api_key
        api_key = get_groq_api_key(request)
        if not api_key:
            raise ValueError("Please configure your Groq API key in Settings")
        return Groq(api_key=api_key)
    
    async def stream_message(self, user_input: str, session_id: str, request: Request):
        """Stream tokens from Groq"""
        client = self.get_client(request)
        stream = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": user_input}
            ],
            max_tokens=500,
            temperature=0.7,
            stream=True
        )
        
        for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
    
    def save_conversation(self, user_input: str, bot_response: str, intent: str, session_id: str, db: Session):
        """Save conversation to database"""
        conversation = Conversation(
            session_id=session_id,
            user_input=user_input,
            detected_intent=intent,
            bot_response=bot_response,
            confidence_score=0.9,
            timestamp=datetime.utcnow()
        )
        db.add(conversation)
        db.commit()
    
    def detect_intent(self, text: str) -> str:
        """Simple intent detection for logging"""
        text_lower = text.lower()
        if any(word in text_lower for word in ['hello', 'hi', 'hey']):
            return 'greeting'
        elif any(word in text_lower for word in ['price', 'cost', 'pricing']):
            return 'pricing_query'
        elif any(word in text_lower for word in ['order', 'track', 'status']):
            return 'order_status'
        elif any(word in text_lower for word in ['problem', 'issue', 'help', 'support']):
            return 'technical_support'
        elif any(word in text_lower for word in ['complaint', 'angry', 'frustrated']):
            return 'complaint'
        elif any(word in text_lower for word in ['bye', 'goodbye', 'see you']):
            return 'goodbye'
        elif any(word in text_lower for word in ['capability', 'capabilities', 'what can you', 'what do you']):
            return 'capabilities'
        else:
            return 'general_query'
    
    def format_response(self, raw_response: str) -> str:
        """Format response with proper structure for points, headings, and lists"""
        formatted = raw_response
        
        # Ensure proper spacing after headings
        formatted = re.sub(r'(#{1,3}\s+[^\n]+)\n(?!\n)', r'\1\n\n', formatted)
        
        # Ensure proper spacing before headings
        formatted = re.sub(r'(?<!\n)\n(#{1,3}\s+)', r'\n\n\1', formatted)
        
        # Format numbered lists with proper spacing
        formatted = re.sub(r'(\d+\.\s+[^\n]+)\n(?=\d+\.)', r'\1\n', formatted)
        
        # Format bullet points consistently
        formatted = re.sub(r'^[-*]\s+', '• ', formatted, flags=re.MULTILINE)
        
        return formatted.strip()
    
    def process_message(self, user_input: str, session_id: str, db: Session, request: Request) -> dict:
        intent = self.detect_intent(user_input)
        
        # Use Groq for response generation
        try:
            client = self.get_client(request)
            response_obj = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": user_input}
                ],
                max_tokens=500,
                temperature=0.7
            )
            raw_response = response_obj.choices[0].message.content
            response = self.format_response(raw_response)
            confidence = 0.9
        except Exception as e:
            print(f"Groq API error: {e}")
            response = "I'm here to help with cloud contact center solutions. Could you please rephrase your question?"
            confidence = 0.5
        
        conversation = Conversation(
            session_id=session_id,
            user_input=user_input,
            detected_intent=intent,
            bot_response=response,
            confidence_score=confidence,
            timestamp=datetime.utcnow()
        )
        db.add(conversation)
        db.commit()
        
        return {
            "response": response,
            "intent": intent,
            "confidence": confidence,
            "session_id": session_id
        }
