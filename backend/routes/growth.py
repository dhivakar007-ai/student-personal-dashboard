from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.growth import Goal, Project
from schemas.trackers import GoalCreate, GoalUpdate, GoalResponse, ProjectCreate, ProjectUpdate, ProjectResponse

router = APIRouter(prefix="/growth", tags=["Growth"])

# Goals
@router.get("/goals", response_model=List[GoalResponse])
def get_goals(db: Session = Depends(get_db)):
    return db.query(Goal).order_by(Goal.created_at.desc()).all()

@router.post("/goals", response_model=GoalResponse)
def create_goal(goal: GoalCreate, db: Session = Depends(get_db)):
    db_goal = Goal(**goal.dict())
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@router.put("/goals/{goal_id}", response_model=GoalResponse)
def update_goal(goal_id: int, update: GoalUpdate, db: Session = Depends(get_db)):
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    for k, v in update.dict(exclude_unset=True).items():
        setattr(goal, k, v)
    db.commit()
    db.refresh(goal)
    return goal

@router.delete("/goals/{goal_id}")
def delete_goal(goal_id: int, db: Session = Depends(get_db)):
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(goal)
    db.commit()
    return {"status": "success", "id": goal_id}

# Projects
@router.get("/projects", response_model=List[ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    return db.query(Project).order_by(Project.created_at.desc()).all()

@router.post("/projects", response_model=ProjectResponse)
def create_project(proj: ProjectCreate, db: Session = Depends(get_db)):
    db_proj = Project(**proj.dict())
    db.add(db_proj)
    db.commit()
    db.refresh(db_proj)
    return db_proj

@router.put("/projects/{proj_id}", response_model=ProjectResponse)
def update_project(proj_id: int, update: ProjectUpdate, db: Session = Depends(get_db)):
    proj = db.query(Project).filter(Project.id == proj_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    for k, v in update.dict(exclude_unset=True).items():
        setattr(proj, k, v)
    db.commit()
    db.refresh(proj)
    return proj

@router.delete("/projects/{proj_id}")
def delete_project(proj_id: int, db: Session = Depends(get_db)):
    proj = db.query(Project).filter(Project.id == proj_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(proj)
    db.commit()
    return {"status": "success", "id": proj_id}
