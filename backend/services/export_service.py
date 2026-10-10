from sqlalchemy.orm import Session
from models.daily_record import DailyRecord
from models.activity import ActivityLog
from models.task import Task
from models.diary import DiaryEntry
from models.growth import Goal, Project
from models.dsa_entry import DSAEntry
from models.communication import CommunicationEntry
from models.planning import WeeklyReview, MonthlyReview, Certification, Competition
import csv
import io
import json
import shutil
import os
from database import DB_PATH

class ExportService:
    @staticmethod
    def export_all_json(db: Session) -> str:
        data = {
            "daily_records": [r.__dict__ for r in db.query(DailyRecord).all()],
            "activities": [a.__dict__ for a in db.query(ActivityLog).all()],
            "tasks": [t.__dict__ for t in db.query(Task).all()],
            "diary_entries": [d.__dict__ for d in db.query(DiaryEntry).all()],
            "goals": [g.__dict__ for g in db.query(Goal).all()],
            "projects": [p.__dict__ for p in db.query(Project).all()],
            "dsa_entries": [e.__dict__ for e in db.query(DSAEntry).all()],
            "communication_entries": [c.__dict__ for c in db.query(CommunicationEntry).all()],
            "weekly_reviews": [w.__dict__ for w in db.query(WeeklyReview).all()],
            "monthly_reviews": [m.__dict__ for m in db.query(MonthlyReview).all()],
            "certifications": [cert.__dict__ for cert in db.query(Certification).all()],
            "competitions": [comp.__dict__ for comp in db.query(Competition).all()]
        }
        for table, rows in data.items():
            for row in rows:
                row.pop("_sa_instance_state", None)
                for k, v in list(row.items()):
                    if hasattr(v, "isoformat"):
                        row[k] = v.isoformat()
        return json.dumps(data, indent=2)

    @staticmethod
    def export_daily_csv(db: Session) -> str:
        records = db.query(DailyRecord).order_by(DailyRecord.date.asc()).all()
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "date", "daily_score", "status", "health_score", "brain_score",
            "engineering_score", "communication_score", "discipline_score",
            "sleep_hours", "water_l", "walking_min", "workout_sessions",
            "coding_min", "dsa_problems", "reading_min", "communication_min"
        ])
        for r in records:
            writer.writerow([
                r.date, r.daily_score, r.status, r.health_score, r.brain_score,
                r.engineering_score, r.communication_score, r.discipline_score,
                r.sleep_hours, r.water_l, r.walking_min, r.workout_sessions,
                r.coding_min, r.dsa_problems, r.reading_min, r.communication_min
            ])
        return output.getvalue()

    @staticmethod
    def backup_database() -> str:
        backup_dir = os.path.join(os.path.dirname(DB_PATH), "backups")
        os.makedirs(backup_dir, exist_ok=True)
        backup_file = os.path.join(backup_dir, "god_hq_backup.db")
        if os.path.exists(DB_PATH):
            shutil.copy2(DB_PATH, backup_file)
            return backup_file
        return ""
