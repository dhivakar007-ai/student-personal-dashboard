from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from database import Base

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    area = Column(String(50), default="Engineering")
    type = Column(String(50), default="Monthly")
    start_date = Column(String(10), default="")
    deadline = Column(String(10), default="")
    progress = Column(Integer, default=0)
    status = Column(String(20), default="Active")
    why = Column(Text, default="")
    next_action = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    status = Column(String(20), default="Active")
    progress = Column(Integer, default=0)
    start_date = Column(String(10), default="")
    deadline = Column(String(10), default="")
    technology = Column(String(255), default="")
    next_action = Column(Text, default="")
    goal_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
