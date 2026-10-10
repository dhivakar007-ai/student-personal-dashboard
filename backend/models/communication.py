from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from database import Base

class CommunicationEntry(Base):
    __tablename__ = "communication_entries"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String(10), index=True, nullable=False)
    duration_min = Column(Integer, default=15)
    type = Column(String(50), default="Communication")
    topic = Column(String(255), default="")
    confidence = Column(Integer, default=3)
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
