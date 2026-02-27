from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from database.config import Base

class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True)
    user_input = Column(String)
    detected_intent = Column(String)
    bot_response = Column(String)
    confidence_score = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)
