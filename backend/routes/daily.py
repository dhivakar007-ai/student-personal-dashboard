from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas.daily import DailyRecordResponse, ChecklistUpdate, MeasurementsUpdate
from services.daily_service import DailyService

router = APIRouter(prefix="/daily", tags=["Daily Tracking"])

@router.get("/{date}", response_model=DailyRecordResponse)
def get_daily_record(date: str, db: Session = Depends(get_db)):
    record = DailyService.get_or_create_daily_record(db, date)
    return record

@router.put("/{date}/checklist", response_model=DailyRecordResponse)
def update_checklist(date: str, updates: ChecklistUpdate, db: Session = Depends(get_db)):
    data = updates.dict(exclude_unset=True)
    return DailyService.update_checklist(db, date, data)

@router.put("/{date}/measurements", response_model=DailyRecordResponse)
def update_measurements(date: str, updates: MeasurementsUpdate, db: Session = Depends(get_db)):
    data = updates.dict(exclude_unset=True)
    return DailyService.update_measurements(db, date, data)
