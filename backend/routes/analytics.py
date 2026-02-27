from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.config import get_db
from analytics.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    return {
        "total_conversations": AnalyticsService.get_total_conversations(db),
        "average_confidence": AnalyticsService.get_average_confidence(db),
        "intent_distribution": AnalyticsService.get_intent_distribution(db)
    }

@router.get("/intents")
def get_intents(db: Session = Depends(get_db)):
    return AnalyticsService.get_intent_distribution(db)

@router.get("/daily")
def get_daily_stats(days: int = 7, db: Session = Depends(get_db)):
    return AnalyticsService.get_daily_conversation_count(db, days)
