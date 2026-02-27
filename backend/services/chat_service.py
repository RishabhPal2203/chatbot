from nlp.intent_detector import IntentDetector
from models.conversation import Conversation
from sqlalchemy.orm import Session
import uuid
from datetime import datetime

class ChatService:
    def __init__(self):
        self.intent_detector = IntentDetector()
    
    def process_message(self, user_input: str, session_id: str, db: Session) -> dict:
        intent, confidence = self.intent_detector.detect_intent(user_input)
        response = self.intent_detector.generate_response(intent)
        
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
