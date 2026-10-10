from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    date = Column(String(10), index=True, nullable=False)
    priority = Column(String(10), default="P2")
    status = Column(String(20), default="Planned")
    category = Column(String(50), default="Engineering")
    goal_id = Column(Integer, nullable=True)
    project_id = Column(Integer, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
