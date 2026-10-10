from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db, DB_PATH
from models.daily_record import DailyRecord
from models.activity import ActivityLog
from models.task import Task
from models.diary import DiaryEntry
from models.dsa_entry import DSAEntry
from models.communication import CommunicationEntry
from models.planning import WeeklyReview, MonthlyReview
from services.daily_service import DailyService
import shutil
import os
from datetime import datetime

router = APIRouter(prefix="/admin", tags=["Admin & Maintenance"])

@router.post("/reset-progress")
def reset_progress(db: Session = Depends(get_db)):
    # 1. Create a safe backup before reset
    backup_dir = os.path.join(os.path.dirname(DB_PATH), "backups")
    os.makedirs(backup_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = os.path.join(backup_dir, f"god_hq_reset_backup_{timestamp}.db")
    if os.path.exists(DB_PATH):
        shutil.copy2(DB_PATH, backup_file)

    # 2. Delete progress and activity tables only
    db.query(DailyRecord).delete()
    db.query(ActivityLog).delete()
    db.query(DiaryEntry).delete()
    db.query(Task).delete()
    db.query(DSAEntry).delete()
    db.query(CommunicationEntry).delete()
    db.query(WeeklyReview).delete()
    db.query(MonthlyReview).delete()
    db.commit()

    # 3. Ensure configuration & user_settings remain intact
    DailyService.get_or_create_settings(db)

    return {
        "status": "success",
        "message": "User progress, activity logs, and history have been safely reset. Configuration, targets, and scoring weights remain intact.",
        "backup_created": backup_file
    }
