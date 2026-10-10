from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.diary import DiaryEntry
from schemas.trackers import DiaryCreate, DiaryUpdate, DiaryResponse

router = APIRouter(prefix="/diary", tags=["Diary"])

@router.get("/{date}", response_model=DiaryResponse)
def get_diary_entry(date: str, db: Session = Depends(get_db)):
    entry = db.query(DiaryEntry).filter(DiaryEntry.date == date).first()
    if not entry:
        entry = DiaryEntry(date=date, title=f"Journal for {date}")
        db.add(entry)
        db.commit()
        db.refresh(entry)
    return entry

@router.put("/{date}", response_model=DiaryResponse)
def update_diary_entry(date: str, updates: DiaryUpdate, db: Session = Depends(get_db)):
    entry = db.query(DiaryEntry).filter(DiaryEntry.date == date).first()
    if not entry:
        entry = DiaryEntry(date=date, title=f"Journal for {date}")
        db.add(entry)
        db.commit()
        db.refresh(entry)
    for k, v in updates.dict(exclude_unset=True).items():
        if v is not None:
            setattr(entry, k, v)
    db.commit()
    db.refresh(entry)
    return entry
