from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from database import get_db
from services.export_service import ExportService

router = APIRouter(prefix="/export", tags=["Export & Backup"])

@router.get("/json")
def export_json(db: Session = Depends(get_db)):
    content = ExportService.export_all_json(db)
    return Response(
        content=content,
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=god_hq_export.json"}
    )

@router.get("/csv")
def export_csv(db: Session = Depends(get_db)):
    content = ExportService.export_daily_csv(db)
    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=god_hq_daily_records.csv"}
    )

@router.post("/backup")
def create_backup():
    path = ExportService.backup_database()
    return {"status": "success", "backup_file": path}
