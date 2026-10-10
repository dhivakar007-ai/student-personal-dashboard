from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from datetime import datetime
from database import Base

class DSAEntry(Base):
    __tablename__ = "dsa_entries"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String(10), index=True, nullable=False)
    problem = Column(String(255), nullable=False)
    platform = Column(String(50), default="LeetCode")
    difficulty = Column(String(20), default="Medium")
    topic = Column(String(50), default="Arrays")
    time_spent_min = Column(Integer, default=30)
    solved = Column(Boolean, default=True)
    approach = Column(Text, default="")
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
