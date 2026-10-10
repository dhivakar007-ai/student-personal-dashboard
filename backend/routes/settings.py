from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas.settings import UserSettingsResponse, UserSettingsUpdate
from services.daily_service import DailyService

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("", response_model=UserSettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    return DailyService.get_or_create_settings(db)

@router.put("", response_model=UserSettingsResponse)
def update_settings(updates: UserSettingsUpdate, db: Session = Depends(get_db)):
    settings = DailyService.get_or_create_settings(db)
    for k, v in updates.dict(exclude_unset=True).items():
        setattr(settings, k, v)
    db.commit()
    db.refresh(settings)
    return settings
