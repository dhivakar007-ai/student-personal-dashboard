from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Activity Log
class ActivityCreate(BaseModel):
    date: str
    start_time: Optional[str] = ""
    end_time: Optional[str] = ""
    duration_min: Optional[int] = 0
    activity: str
    category: Optional[str] = "Other"
    description: Optional[str] = ""
    related_project: Optional[str] = ""
    notes: Optional[str] = ""

class ActivityResponse(ActivityCreate):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Task
class TaskCreate(BaseModel):
    title: str
    date: str
    priority: Optional[str] = "P2"
    status: Optional[str] = "Planned"
    category: Optional[str] = "Engineering"
    goal_id: Optional[int] = None
    project_id: Optional[int] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    category: Optional[str] = None
    goal_id: Optional[int] = None
    project_id: Optional[int] = None

class TaskResponse(BaseModel):
    id: int
    title: str
    date: str
    priority: str
    status: str
    category: str
    goal_id: Optional[int] = None
    project_id: Optional[int] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    class Config:
        from_attributes = True

# Diary
class DiaryCreate(BaseModel):
    date: str
    title: Optional[str] = ""
    what_happened: Optional[str] = ""
    what_accomplished: Optional[str] = ""
    what_learned: Optional[str] = ""
    what_went_wrong: Optional[str] = ""
    tomorrow_priority: Optional[str] = ""

class DiaryUpdate(BaseModel):
    title: Optional[str] = None
    what_happened: Optional[str] = None
    what_accomplished: Optional[str] = None
    what_learned: Optional[str] = None
    what_went_wrong: Optional[str] = None
    tomorrow_priority: Optional[str] = None

class DiaryResponse(BaseModel):
    id: int
    date: str
    title: str
    what_happened: str
    what_accomplished: str
    what_learned: str
    what_went_wrong: str
    tomorrow_priority: str
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# Goal
class GoalCreate(BaseModel):
    title: str
    area: Optional[str] = "Engineering"
    type: Optional[str] = "Monthly"
    start_date: Optional[str] = ""
    deadline: Optional[str] = ""
    progress: Optional[int] = 0
    status: Optional[str] = "Active"
    why: Optional[str] = ""
    next_action: Optional[str] = ""

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    area: Optional[str] = None
    type: Optional[str] = None
    start_date: Optional[str] = None
    deadline: Optional[str] = None
    progress: Optional[int] = None
    status: Optional[str] = None
    why: Optional[str] = None
    next_action: Optional[str] = None

class GoalResponse(GoalCreate):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Project
class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    status: Optional[str] = "Active"
    progress: Optional[int] = 0
    start_date: Optional[str] = ""
    deadline: Optional[str] = ""
    technology: Optional[str] = ""
    next_action: Optional[str] = ""
    goal_id: Optional[int] = None

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    progress: Optional[int] = None
    start_date: Optional[str] = None
    deadline: Optional[str] = None
    technology: Optional[str] = None
    next_action: Optional[str] = None
    goal_id: Optional[int] = None

class ProjectResponse(ProjectCreate):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# DSA
class DSACreate(BaseModel):
    date: str
    problem: str
    platform: Optional[str] = "LeetCode"
    difficulty: Optional[str] = "Medium"
    topic: Optional[str] = "Arrays"
    time_spent_min: Optional[int] = 30
    solved: Optional[bool] = True
    approach: Optional[str] = ""
    notes: Optional[str] = ""

class DSAResponse(DSACreate):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Communication
class CommunicationCreate(BaseModel):
    date: str
    duration_min: Optional[int] = 15
    type: Optional[str] = "Communication"
    topic: Optional[str] = ""
    confidence: Optional[int] = 3
    notes: Optional[str] = ""

class CommunicationResponse(CommunicationCreate):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Reviews
class WeeklyReviewCreate(BaseModel):
    week_start: str
    week_end: str
    what_went_well: Optional[str] = ""
    what_went_wrong: Optional[str] = ""
    what_learned: Optional[str] = ""
    what_to_stop: Optional[str] = ""
    what_to_start: Optional[str] = ""
    what_to_continue: Optional[str] = ""
    next_week_priority: Optional[str] = ""

class WeeklyReviewResponse(BaseModel):
    id: int
    week_start: str
    week_end: str
    weekly_score: float
    days_tracked: int
    best_day: str
    worst_day: str
    best_habit: str
    weakest_habit: str
    coding_hours: float
    dsa_problems: int
    reading_hours: float
    communication_hours: float
    workout_sessions: int
    what_went_well: str
    what_went_wrong: str
    what_learned: str
    what_to_stop: str
    what_to_start: str
    what_to_continue: str
    next_week_priority: str
    created_at: datetime
    class Config:
        from_attributes = True

class MonthlyReviewCreate(BaseModel):
    month: str
    biggest_achievement: Optional[str] = ""
    biggest_mistake: Optional[str] = ""
    biggest_lesson: Optional[str] = ""
    what_improved: Optional[str] = ""
    what_needs_improvement: Optional[str] = ""
    what_to_change_next_month: Optional[str] = ""
    main_objective: Optional[str] = ""

class MonthlyReviewResponse(BaseModel):
    id: int
    month: str
    monthly_score: float
    prev_month_score: float
    score_diff: float
    days_tracked: int
    best_week: str
    worst_week: str
    coding_hours: float
    dsa_problems: int
    reading_hours: float
    communication_hours: float
    workout_sessions: int
    learning_hours: float
    project_hours: float
    biggest_achievement: str
    biggest_mistake: str
    biggest_lesson: str
    what_improved: str
    what_needs_improvement: str
    what_to_change_next_month: str
    main_objective: str
    created_at: datetime
    class Config:
        from_attributes = True

# Certification & Competition
class CertificationCreate(BaseModel):
    title: str
    provider: Optional[str] = ""
    start_date: Optional[str] = ""
    deadline: Optional[str] = ""
    exam_date: Optional[str] = ""
    progress: Optional[int] = 0
    status: Optional[str] = "Planned"
    hours_invested: Optional[float] = 0.0
    link: Optional[str] = ""

class CertificationResponse(CertificationCreate):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class CompetitionCreate(BaseModel):
    title: str
    organization: Optional[str] = ""
    reg_deadline: Optional[str] = ""
    sub_deadline: Optional[str] = ""
    status: Optional[str] = "Registered"
    team: Optional[str] = ""
    idea: Optional[str] = ""
    result: Optional[str] = ""
    link: Optional[str] = ""

class CompetitionResponse(CompetitionCreate):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True
