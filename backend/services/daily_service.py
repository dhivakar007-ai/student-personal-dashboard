from sqlalchemy.orm import Session
from models.daily_record import DailyRecord
from models.settings import UserSettings
from services.scoring_service import ScoringService
from datetime import datetime

class DailyService:
    @staticmethod
    def get_or_create_settings(db: Session) -> UserSettings:
        settings = db.query(UserSettings).filter(UserSettings.id == 1).first()
        if not settings:
            settings = UserSettings(id=1)
            db.add(settings)
            db.commit()
            db.refresh(settings)
        return settings

    @staticmethod
    def get_or_create_daily_record(db: Session, date_str: str) -> DailyRecord:
        record = db.query(DailyRecord).filter(DailyRecord.date == date_str).first()
        if not record:
            record = DailyRecord(date=date_str)
            db.add(record)
            db.commit()
            db.refresh(record)
            DailyService.recalculate_scores(db, record)
        return record

    @staticmethod
    def recalculate_scores(db: Session, record: DailyRecord):
        settings = DailyService.get_or_create_settings(db)
        scores = ScoringService.calculate_scores(record, settings)
        for k, v in scores.items():
            setattr(record, k, v)
        record.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(record)
        return record

    @staticmethod
    def update_checklist(db: Session, date_str: str, updates: dict) -> DailyRecord:
        record = DailyService.get_or_create_daily_record(db, date_str)
        for k, v in updates.items():
            if hasattr(record, k) and v is not None:
                setattr(record, k, v)
        return DailyService.recalculate_scores(db, record)

    @staticmethod
    def update_measurements(db: Session, date_str: str, updates: dict) -> DailyRecord:
        record = DailyService.get_or_create_daily_record(db, date_str)
        for k, v in updates.items():
            if hasattr(record, k) and v is not None:
                setattr(record, k, v)
        return DailyService.recalculate_scores(db, record)
