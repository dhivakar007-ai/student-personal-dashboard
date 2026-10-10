import pytest
from services.daily_service import DailyService
from services.analytics_service import AnalyticsService
from models.daily_record import DailyRecord

def test_critical_scenario(db_session):
    db = db_session

    # Step 1: Create data for Sept 27, 28, 29 with distinct values
    DailyService.get_or_create_daily_record(db, "2026-09-27")
    DailyService.update_measurements(db, "2026-09-27", {
        "sleep_hours": 7.0, "water_l": 3.0, "walking_min": 25, "coding_min": 60, "dsa_problems": 2, "reading_min": 20
    })
    DailyService.update_checklist(db, "2026-09-27", {
        "wake_up_target": True, "coding_done": True, "dsa_done": True, "walk_done": True
    })

    DailyService.get_or_create_daily_record(db, "2026-09-28")
    DailyService.update_measurements(db, "2026-09-28", {
        "sleep_hours": 8.0, "water_l": 4.0, "walking_min": 35, "coding_min": 90, "dsa_problems": 3, "reading_min": 30
    })
    DailyService.update_checklist(db, "2026-09-28", {
        "wake_up_target": True, "coding_done": True, "dsa_done": True, "walk_done": True, "reading_done": True
    })

    DailyService.get_or_create_daily_record(db, "2026-09-29")
    DailyService.update_measurements(db, "2026-09-29", {
        "sleep_hours": 7.5, "water_l": 3.5, "walking_min": 30, "coding_min": 120, "dsa_problems": 4, "reading_min": 25
    })
    DailyService.update_checklist(db, "2026-09-29", {
        "wake_up_target": True, "coding_done": True, "dsa_done": True, "walk_done": True, "reading_done": True, "meditation_done": True
    })

    # Step 2: Simulate September 30
    rec30 = DailyService.get_or_create_daily_record(db, "2026-09-30")
    DailyService.update_measurements(db, "2026-09-30", {
        "sleep_hours": 7.2, "water_l": 3.2, "walking_min": 24, "coding_min": 75, "dsa_problems": 2, "reading_min": 25, "meditation_min": 5, "communication_min": 15
    })
    DailyService.update_checklist(db, "2026-09-30", {
        "wake_up_target": True, "meals_tracked": True, "water_target": True, "coding_done": True, "dsa_done": True, "reading_done": True
    })

    # Verify: Sept 29, 28, 27 still exist with intact values
    r27 = db.query(DailyRecord).filter(DailyRecord.date == "2026-09-27").first()
    r28 = db.query(DailyRecord).filter(DailyRecord.date == "2026-09-28").first()
    r29 = db.query(DailyRecord).filter(DailyRecord.date == "2026-09-29").first()
    r30 = db.query(DailyRecord).filter(DailyRecord.date == "2026-09-30").first()

    assert r27 is not None and r27.coding_min == 60
    assert r28 is not None and r28.coding_min == 90
    assert r29 is not None and r29.coding_min == 120
    assert r30 is not None and r30.coding_min == 75

    # Verify 7-day rolling window includes all 4 dates
    seven_day = AnalyticsService.get_seven_day_overview(db, "2026-09-30")
    daily_dates = [d["date"] for d in seven_day]
    assert "2026-09-30" in daily_dates
    assert "2026-09-29" in daily_dates
    assert "2026-09-28" in daily_dates
    assert "2026-09-27" in daily_dates

    # Verify Weekly analytics (Mon-Sun week of Sept 28 - Oct 4) has Sept 28, 29, 30 (3 days)
    weekly_sept30 = AnalyticsService.get_weekly_analytics(db, "2026-09-30")
    assert weekly_sept30["days_tracked"] == 3

    # Verify Monthly statistics include all September records (Sept 27, 28, 29, 30)
    monthly_sept = AnalyticsService.get_monthly_analytics(db, "2026-09-30")
    assert monthly_sept["month"] == "2026-09"
    assert monthly_sept["days_tracked"] == 4
    # Coding hours: (60 + 90 + 120 + 75) / 60 = 345 / 60 = 5.75 -> 5.8h
    assert monthly_sept["total_coding_hours"] >= 5.7
    # DSA problems: 2 + 3 + 4 + 2 = 11
    assert monthly_sept["total_dsa"] == 11

    sept_coding_total = monthly_sept["total_coding_hours"]
    sept_score = monthly_sept["monthly_score"]

    # Step 3: Simulate October 1
    rec_oct1 = DailyService.get_or_create_daily_record(db, "2026-10-01")
    DailyService.update_measurements(db, "2026-10-01", {
        "sleep_hours": 8.0, "water_l": 4.0, "walking_min": 30, "coding_min": 100, "dsa_problems": 3, "reading_min": 20
    })
    DailyService.update_checklist(db, "2026-10-01", {
        "wake_up_target": True, "coding_done": True, "dsa_done": True
    })

    # Verify September remains completely intact
    monthly_sept_after = AnalyticsService.get_monthly_analytics(db, "2026-09-30")
    assert monthly_sept_after["total_coding_hours"] == sept_coding_total
    assert monthly_sept_after["monthly_score"] == sept_score

    # Verify October begins a new month
    monthly_oct = AnalyticsService.get_monthly_analytics(db, "2026-10-01")
    assert monthly_oct["month"] == "2026-10"
    assert monthly_oct["days_tracked"] == 1
    assert monthly_oct["total_coding_hours"] == round(100 / 60.0, 1)

    # Verify Monthly comparison: October vs September works
    comps = monthly_oct["comparisons"]
    score_comp = next((c for c in comps if c["name"] == "Monthly Score"), None)
    coding_comp = next((c for c in comps if c["name"] == "Coding Hours"), None)
    dsa_comp = next((c for c in comps if c["name"] == "DSA Solved"), None)

    assert score_comp is not None
    assert score_comp["previous_value"] == sept_score
    assert coding_comp is not None
    assert coding_comp["previous_value"] == sept_coding_total

    print("ALL CRITICAL TEST SCENARIO ASSERTIONS PASSED WITH 100% SUCCESS!")
