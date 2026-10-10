from sqlalchemy import Column, Integer, String, Text, Float, DateTime
from datetime import datetime
from database import Base

class WeeklyReview(Base):
    __tablename__ = "weekly_reviews"

    id = Column(Integer, primary_key=True, index=True)
    week_start = Column(String(10), unique=True, index=True, nullable=False)
    week_end = Column(String(10), nullable=False)
    weekly_score = Column(Float, default=0.0)
    days_tracked = Column(Integer, default=0)
    best_day = Column(String(10), default="")
    worst_day = Column(String(10), default="")
    best_habit = Column(String(50), default="")
    weakest_habit = Column(String(50), default="")
    coding_hours = Column(Float, default=0.0)
    dsa_problems = Column(Integer, default=0)
    reading_hours = Column(Float, default=0.0)
    communication_hours = Column(Float, default=0.0)
    workout_sessions = Column(Integer, default=0)
    what_went_well = Column(Text, default="")
    what_went_wrong = Column(Text, default="")
    what_learned = Column(Text, default="")
    what_to_stop = Column(Text, default="")
    what_to_start = Column(Text, default="")
    what_to_continue = Column(Text, default="")
    next_week_priority = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

class MonthlyReview(Base):
    __tablename__ = "monthly_reviews"

    id = Column(Integer, primary_key=True, index=True)
    month = Column(String(7), unique=True, index=True, nullable=False)
    monthly_score = Column(Float, default=0.0)
    prev_month_score = Column(Float, default=0.0)
    score_diff = Column(Float, default=0.0)
    days_tracked = Column(Integer, default=0)
    best_week = Column(String(20), default="")
    worst_week = Column(String(20), default="")
    coding_hours = Column(Float, default=0.0)
    dsa_problems = Column(Integer, default=0)
    reading_hours = Column(Float, default=0.0)
    communication_hours = Column(Float, default=0.0)
    workout_sessions = Column(Integer, default=0)
    learning_hours = Column(Float, default=0.0)
    project_hours = Column(Float, default=0.0)
    biggest_achievement = Column(Text, default="")
    biggest_mistake = Column(Text, default="")
    biggest_lesson = Column(Text, default="")
    what_improved = Column(Text, default="")
    what_needs_improvement = Column(Text, default="")
    what_to_change_next_month = Column(Text, default="")
    main_objective = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    provider = Column(String(100), default="")
    start_date = Column(String(10), default="")
    deadline = Column(String(10), default="")
    exam_date = Column(String(10), default="")
    progress = Column(Integer, default=0)
    status = Column(String(50), default="Planned")
    hours_invested = Column(Float, default=0.0)
    link = Column(String(500), default="")
    created_at = Column(DateTime, default=datetime.utcnow)

class Competition(Base):
    __tablename__ = "competitions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    organization = Column(String(100), default="")
    reg_deadline = Column(String(10), default="")
    sub_deadline = Column(String(10), default="")
    status = Column(String(50), default="Registered")
    team = Column(String(255), default="")
    idea = Column(Text, default="")
    result = Column(String(100), default="")
    link = Column(String(500), default="")
    created_at = Column(DateTime, default=datetime.utcnow)
