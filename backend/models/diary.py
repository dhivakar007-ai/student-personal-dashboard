from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from database import Base

class DiaryEntry(Base):
    __tablename__ = "diary_entries"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String(10), unique=True, index=True, nullable=False)
    title = Column(String(255), default="")
    what_happened = Column(Text, default="")
    what_accomplished = Column(Text, default="")
    what_learned = Column(Text, default="")
    what_went_wrong = Column(Text, default="")
    tomorrow_priority = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
