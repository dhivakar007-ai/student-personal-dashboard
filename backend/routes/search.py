from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from services.search_service import SearchService

router = APIRouter(prefix="/search", tags=["Global Search"])

@router.get("")
def search(q: str = Query(...), db: Session = Depends(get_db)):
    return SearchService.global_search(db, q)
