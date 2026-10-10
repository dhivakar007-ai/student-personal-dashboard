from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.planning import WeeklyReview, MonthlyReview, Certification, Competition
from schemas.trackers import (
    WeeklyReviewCreate, WeeklyReviewResponse,
    MonthlyReviewCreate, MonthlyReviewResponse,
    CertificationCreate, CertificationResponse,
    CompetitionCreate, CompetitionResponse
)
from services.analytics_service import AnalyticsService

router = APIRouter(prefix="/planning", tags=["Planning & Reviews"])

# Reviews
@router.get("/reviews/weekly/{week_start}", response_model=WeeklyReviewResponse)
def get_or_generate_weekly_review(week_start: str, db: Session = Depends(get_db)):
    rev = db.query(WeeklyReview).filter(WeeklyReview.week_start == week_start).first()
    if not rev:
        analytics = AnalyticsService.get_weekly_analytics(db, week_start)
        rev = WeeklyReview(
            week_start=week_start,
            week_end=analytics["week_end"],
            weekly_score=analytics["weekly_score"],
            days_tracked=analytics["days_tracked"],
            coding_hours=analytics["total_coding_hours"],
            dsa_problems=analytics["total_dsa"],
            reading_hours=analytics["total_reading_hours"],
            communication_hours=analytics["total_comm_hours"],
            workout_sessions=analytics["workout_sessions"]
        )
        db.add(rev)
        db.commit()
        db.refresh(rev)
    return rev

@router.put("/reviews/weekly/{week_start}", response_model=WeeklyReviewResponse)
def update_weekly_review(week_start: str, review_data: WeeklyReviewCreate, db: Session = Depends(get_db)):
    rev = db.query(WeeklyReview).filter(WeeklyReview.week_start == week_start).first()
    if not rev:
        rev = WeeklyReview(week_start=week_start, week_end=review_data.week_end)
        db.add(rev)
    for k, v in review_data.dict(exclude_unset=True).items():
        setattr(rev, k, v)
    db.commit()
    db.refresh(rev)
    return rev

@router.get("/reviews/monthly/{month}", response_model=MonthlyReviewResponse)
def get_or_generate_monthly_review(month: str, db: Session = Depends(get_db)):
    rev = db.query(MonthlyReview).filter(MonthlyReview.month == month).first()
    if not rev:
        ref_date = f"{month}-01"
        analytics = AnalyticsService.get_monthly_analytics(db, ref_date)
        prev_score = next((c["previous_value"] for c in analytics["comparisons"] if c["name"] == "Monthly Score"), 0.0)
        rev = MonthlyReview(
            month=month,
            monthly_score=analytics["monthly_score"],
            prev_month_score=prev_score,
            score_diff=round(analytics["monthly_score"] - prev_score, 1),
            days_tracked=analytics["days_tracked"],
            coding_hours=analytics["total_coding_hours"],
            dsa_problems=analytics["total_dsa"],
            reading_hours=analytics["total_reading_hours"],
            communication_hours=analytics["total_comm_hours"],
            workout_sessions=analytics["workout_sessions"],
            learning_hours=analytics["learning_hours"],
            project_hours=analytics["project_hours"],
            best_week="Week 2",
            worst_week="Week 1"
        )
        db.add(rev)
        db.commit()
        db.refresh(rev)
    return rev

@router.put("/reviews/monthly/{month}", response_model=MonthlyReviewResponse)
def update_monthly_review(month: str, review_data: MonthlyReviewCreate, db: Session = Depends(get_db)):
    rev = db.query(MonthlyReview).filter(MonthlyReview.month == month).first()
    if not rev:
        rev = MonthlyReview(month=month)
        db.add(rev)
    for k, v in review_data.dict(exclude_unset=True).items():
        setattr(rev, k, v)
    db.commit()
    db.refresh(rev)
    return rev

# Certifications
@router.get("/certifications", response_model=List[CertificationResponse])
def get_certifications(db: Session = Depends(get_db)):
    return db.query(Certification).order_by(Certification.created_at.desc()).all()

@router.post("/certifications", response_model=CertificationResponse)
def create_certification(cert: CertificationCreate, db: Session = Depends(get_db)):
    db_cert = Certification(**cert.dict())
    db.add(db_cert)
    db.commit()
    db.refresh(db_cert)
    return db_cert

@router.delete("/certifications/{cert_id}")
def delete_certification(cert_id: int, db: Session = Depends(get_db)):
    c = db.query(Certification).filter(Certification.id == cert_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Certification not found")
    db.delete(c)
    db.commit()
    return {"status": "success", "id": cert_id}

# Competitions
@router.get("/competitions", response_model=List[CompetitionResponse])
def get_competitions(db: Session = Depends(get_db)):
    return db.query(Competition).order_by(Competition.created_at.desc()).all()

@router.post("/competitions", response_model=CompetitionResponse)
def create_competition(comp: CompetitionCreate, db: Session = Depends(get_db)):
    db_comp = Competition(**comp.dict())
    db.add(db_comp)
    db.commit()
    db.refresh(db_comp)
    return db_comp

@router.delete("/competitions/{comp_id}")
def delete_competition(comp_id: int, db: Session = Depends(get_db)):
    c = db.query(Competition).filter(Competition.id == comp_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Competition not found")
    db.delete(c)
    db.commit()
    return {"status": "success", "id": comp_id}
