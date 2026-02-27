from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from models.conversation import Conversation
from datetime import datetime, timedelta

class AnalyticsService:
    @staticmethod
    def get_total_conversations(db: Session) -> int:
        return db.query(Conversation).count()
    
    @staticmethod
    def get_intent_distribution(db: Session) -> dict:
        results = db.query(
            Conversation.detected_intent,
            func.count(Conversation.id).label('count')
        ).group_by(Conversation.detected_intent).all()
        
        return {intent: count for intent, count in results}
    
    @staticmethod
    def get_average_confidence(db: Session) -> float:
        result = db.query(func.avg(Conversation.confidence_score)).scalar()
        return round(result, 2) if result else 0.0
    
    @staticmethod
    def get_daily_conversation_count(db: Session, days: int = 7) -> dict:
        start_date = datetime.utcnow() - timedelta(days=days)
        results = db.query(
            cast(Conversation.timestamp, Date).label('date'),
            func.count(Conversation.id).label('count')
        ).filter(Conversation.timestamp >= start_date).group_by('date').all()
        
        return {str(date): count for date, count in results}
