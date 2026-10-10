from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models.communication import CommunicationEntry
from schemas.trackers import CommunicationCreate, CommunicationResponse

router = APIRouter(prefix="/communication", tags=["Communication"])

@router.get("", response_model=List[CommunicationResponse])
def get_comm_entries(date: Optional[str] = Query(None), db: Session = Depends(get_db)):
    q = db.query(CommunicationEntry)
    if date:
        q = q.filter(CommunicationEntry.date == date)
    return q.order_by(CommunicationEntry.created_at.desc()).all()

@router.post("", response_model=CommunicationResponse)
def create_comm_entry(entry: CommunicationCreate, db: Session = Depends(get_db)):
    db_entry = CommunicationEntry(**entry.dict())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@router.delete("/{entry_id}")
def delete_comm_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(CommunicationEntry).filter(CommunicationEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    db.delete(entry)
    db.commit()
    return {"status": "success", "id": entry_id}
