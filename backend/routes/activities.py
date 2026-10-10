from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models.activity import ActivityLog
from schemas.trackers import ActivityCreate, ActivityResponse

router = APIRouter(prefix="/activities", tags=["Activities"])

@router.get("", response_model=List[ActivityResponse])
def get_activities(date: Optional[str] = Query(None), db: Session = Depends(get_db)):
    q = db.query(ActivityLog)
    if date:
        q = q.filter(ActivityLog.date == date)
    return q.order_by(ActivityLog.start_time.asc()).all()

@router.post("", response_model=ActivityResponse)
def create_activity(activity: ActivityCreate, db: Session = Depends(get_db)):
    db_act = ActivityLog(**activity.dict())
    db.add(db_act)
    db.commit()
    db.refresh(db_act)
    return db_act

@router.delete("/{activity_id}")
def delete_activity(activity_id: int, db: Session = Depends(get_db)):
    act = db.query(ActivityLog).filter(ActivityLog.id == activity_id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Activity not found")
    db.delete(act)
    db.commit()
    return {"status": "success", "id": activity_id}
