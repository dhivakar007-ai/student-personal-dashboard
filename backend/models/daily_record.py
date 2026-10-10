from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from datetime import datetime
from database import Base

class DailyRecord(Base):
    __tablename__ = "daily_records"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String(10), unique=True, index=True, nullable=False) # YYYY-MM-DD
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Checklist - Health (10 items)
    wake_up_target = Column(Boolean, default=False)
    meals_tracked = Column(Boolean, default=False)
    water_target = Column(Boolean, default=False)
    walk_done = Column(Boolean, default=False)
    workout_done = Column(Boolean, default=False)
    sunlight_done = Column(Boolean, default=False)
    brush_am = Column(Boolean, default=False)
    brush_pm = Column(Boolean, default=False)
    bath_done = Column(Boolean, default=False)
    sleep_target = Column(Boolean, default=False)

    # Checklist - Brain (4 items)
    reading_done = Column(Boolean, default=False)
    brain_workout_done = Column(Boolean, default=False)
    meditation_done = Column(Boolean, default=False)
    writing_done = Column(Boolean, default=False)

    # Checklist - Engineering (4 items)
    coding_done = Column(Boolean, default=False)
    dsa_done = Column(Boolean, default=False)
    technical_learning_done = Column(Boolean, default=False)
    project_done = Column(Boolean, default=False)

    # Checklist - Communication (3 items)
    communication_done = Column(Boolean, default=False)
    jam_done = Column(Boolean, default=False)
    voice_practice_done = Column(Boolean, default=False)

    # Checklist - Discipline (3 items)
    avoid_scrolling = Column(Boolean, default=False)
    phone_free_sleep = Column(Boolean, default=False)
    mit_completed = Column(Boolean, default=False)

    # Numeric Measurements
    sleep_hours = Column(Float, default=0.0)
    sleep_quality = Column(Integer, default=3)
    wake_time = Column(String(10), default="")
    bed_time = Column(String(10), default="")
    water_l = Column(Float, default=0.0)
    walking_min = Column(Integer, default=0)
    workout_sessions = Column(Integer, default=0)
    outdoor_min = Column(Integer, default=0)
    meditation_min = Column(Integer, default=0)
    coding_min = Column(Integer, default=0)
    dsa_problems = Column(Integer, default=0)
    reading_min = Column(Integer, default=0)
    communication_min = Column(Integer, default=0)
    technical_learning_min = Column(Integer, default=0)
    project_min = Column(Integer, default=0)

    # Calculated Scores
    daily_score = Column(Float, default=0.0)
    health_score = Column(Float, default=0.0)
    brain_score = Column(Float, default=0.0)
    engineering_score = Column(Float, default=0.0)
    communication_score = Column(Float, default=0.0)
    discipline_score = Column(Float, default=0.0)
    status = Column(String(20), default="NEEDS_WORK")
    notes = Column(Text, default="")
