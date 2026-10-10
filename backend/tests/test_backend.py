import pytest
from services.daily_service import DailyService
from services.analytics_service import AnalyticsService
from models.daily_record import DailyRecord

def test_daily_record_creation_and_isolation(db_session):
    db = db_session
    rec27 = DailyService.get_or_create_daily_record(db, "2026-09-27")
    DailyService.update_measurements(db, "2026-09-27", {
        "coding_min": 60, "dsa_problems": 2, "sleep_hours": 7.5, "water_l": 3.5, "walking_min": 30
    })
    DailyService.update_checklist(db, "2026-09-27", {
        "wake_up_target": True, "coding_done": True, "dsa_done": True, "walk_done": True
    })

    rec28 = DailyService.get_or_create_daily_record(db, "2026-09-28")
    DailyService.update_measurements(db, "2026-09-28", {
        "coding_min": 90, "dsa_problems": 3, "sleep_hours": 8.0, "water_l": 4.0, "walking_min": 45
    })
    DailyService.update_checklist(db, "2026-09-28", {
        "wake_up_target": True, "coding_done": True, "dsa_done": True, "walk_done": True, "reading_done": True
    })

    r27 = db.query(DailyRecord).filter(DailyRecord.date == "2026-09-27").first()
    r28 = db.query(DailyRecord).filter(DailyRecord.date == "2026-09-28").first()

    assert r27.coding_min == 60
    assert r28.coding_min == 90
    assert r27.daily_score > 0
    assert r28.daily_score > 0
