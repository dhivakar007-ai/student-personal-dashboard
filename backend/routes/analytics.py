from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from database import get_db
from schemas.analytics import WeeklyAnalyticsResponse, MonthlyAnalyticsResponse, YearlyAnalyticsResponse, StreaksResponse
from schemas.daily import DailyRecordResponse
from services.analytics_service import AnalyticsService
from models.daily_record import DailyRecord

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/weekly", response_model=WeeklyAnalyticsResponse)
def get_weekly_analytics(date: str = Query(...), db: Session = Depends(get_db)):
    return AnalyticsService.get_weekly_analytics(db, date)

@router.get("/monthly", response_model=MonthlyAnalyticsResponse)
def get_monthly_analytics(date: str = Query(...), db: Session = Depends(get_db)):
    return AnalyticsService.get_monthly_analytics(db, date)

@router.get("/yearly", response_model=YearlyAnalyticsResponse)
def get_yearly_analytics(year: int = Query(...), db: Session = Depends(get_db)):
    return AnalyticsService.get_yearly_analytics(db, year)

@router.get("/streaks", response_model=StreaksResponse)
def get_streaks(date: str = Query(...), db: Session = Depends(get_db)):
    return AnalyticsService.get_streaks(db, date)

@router.get("/history", response_model=List[DailyRecordResponse])
def get_history(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    min_score: Optional[float] = None,
    max_score: Optional[float] = None,
    db: Session = Depends(get_db)
):
    query = db.query(DailyRecord)
    if start_date:
        query = query.filter(DailyRecord.date >= start_date)
    if end_date:
        query = query.filter(DailyRecord.date <= end_date)
    if min_score is not None:
        query = query.filter(DailyRecord.daily_score >= min_score)
    if max_score is not None:
        query = query.filter(DailyRecord.daily_score <= max_score)
    return query.order_by(DailyRecord.date.desc()).all()
