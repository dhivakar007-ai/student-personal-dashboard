from sqlalchemy import Column, Integer, String, Float, Text
from database import Base

class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    health_weight = Column(Float, default=0.25)
    brain_weight = Column(Float, default=0.15)
    engineering_weight = Column(Float, default=0.35)
    communication_weight = Column(Float, default=0.10)
    discipline_weight = Column(Float, default=0.15)

    target_wake_time = Column(String(10), default="05:00")
    target_sleep_hours = Column(Float, default=8.0)
    target_water_l = Column(Float, default=4.0)
    target_walk_min = Column(Integer, default=30)
    target_workout_sessions = Column(Integer, default=1)
    target_reading_min = Column(Integer, default=20)
    target_brain_workout_min = Column(Integer, default=10)
    target_meditation_min = Column(Integer, default=5)
    target_coding_min = Column(Integer, default=60)
    target_dsa_problems = Column(Integer, default=2)
    target_technical_learning_min = Column(Integer, default=30)
    target_project_min = Column(Integer, default=30)
    target_communication_min = Column(Integer, default=15)
    target_jam_min = Column(Integer, default=10)
    target_voice_min = Column(Integer, default=10)

    week_start_day = Column(String(10), default="Monday")
    timezone = Column(String(50), default="Asia/Kolkata")
    theme = Column(String(20), default="dark")
