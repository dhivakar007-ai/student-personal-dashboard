from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from database import Base

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String(10), index=True, nullable=False)
    start_time = Column(String(10), default="")
    end_time = Column(String(10), default="")
    duration_min = Column(Integer, default=0)
    activity = Column(String(100), nullable=False)
    category = Column(String(50), default="Other")
    description = Column(String(255), default="")
    related_project = Column(String(100), default="")
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
