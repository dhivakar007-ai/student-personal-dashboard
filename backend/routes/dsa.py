from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models.dsa_entry import DSAEntry
from schemas.trackers import DSACreate, DSAResponse

router = APIRouter(prefix="/dsa", tags=["DSA"])

@router.get("", response_model=List[DSAResponse])
def get_dsa_entries(
    date: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    topic: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    q = db.query(DSAEntry)
    if date:
        q = q.filter(DSAEntry.date == date)
    if difficulty:
        q = q.filter(DSAEntry.difficulty == difficulty)
    if topic:
        q = q.filter(DSAEntry.topic == topic)
    return q.order_by(DSAEntry.created_at.desc()).all()

@router.get("/stats")
def get_dsa_stats(db: Session = Depends(get_db)):
    entries = db.query(DSAEntry).all()
    total = len(entries)
    easy = sum(1 for e in entries if e.difficulty == "Easy")
    medium = sum(1 for e in entries if e.difficulty == "Medium")
    hard = sum(1 for e in entries if e.difficulty == "Hard")
    
    topics = {}
    for e in entries:
        topics[e.topic] = topics.get(e.topic, 0) + 1
        
    return {
        "total": total,
        "easy": easy,
        "medium": medium,
        "hard": hard,
        "topics": topics
    }

@router.post("", response_model=DSAResponse)
def create_dsa_entry(entry: DSACreate, db: Session = Depends(get_db)):
    db_entry = DSAEntry(**entry.dict())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@router.delete("/{entry_id}")
def delete_dsa_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(DSAEntry).filter(DSAEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="DSA entry not found")
    db.delete(entry)
    db.commit()
    return {"status": "success", "id": entry_id}
