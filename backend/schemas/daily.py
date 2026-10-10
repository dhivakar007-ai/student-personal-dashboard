from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ChecklistUpdate(BaseModel):
    wake_up_target: Optional[bool] = None
    meals_tracked: Optional[bool] = None
    water_target: Optional[bool] = None
    walk_done: Optional[bool] = None
    workout_done: Optional[bool] = None
    sunlight_done: Optional[bool] = None
    brush_am: Optional[bool] = None
    brush_pm: Optional[bool] = None
    bath_done: Optional[bool] = None
    sleep_target: Optional[bool] = None

    reading_done: Optional[bool] = None
    brain_workout_done: Optional[bool] = None
    meditation_done: Optional[bool] = None
    writing_done: Optional[bool] = None

    coding_done: Optional[bool] = None
    dsa_done: Optional[bool] = None
    technical_learning_done: Optional[bool] = None
    project_done: Optional[bool] = None

    communication_done: Optional[bool] = None
    jam_done: Optional[bool] = None
    voice_practice_done: Optional[bool] = None

    avoid_scrolling: Optional[bool] = None
    phone_free_sleep: Optional[bool] = None
    mit_completed: Optional[bool] = None

class MeasurementsUpdate(BaseModel):
    sleep_hours: Optional[float] = None
    sleep_quality: Optional[int] = None
    wake_time: Optional[str] = None
    bed_time: Optional[str] = None
    water_l: Optional[float] = None
    walking_min: Optional[int] = None
    workout_sessions: Optional[int] = None
    outdoor_min: Optional[int] = None
    meditation_min: Optional[int] = None
    coding_min: Optional[int] = None
    dsa_problems: Optional[int] = None
    reading_min: Optional[int] = None
    communication_min: Optional[int] = None
    technical_learning_min: Optional[int] = None
    project_min: Optional[int] = None
    notes: Optional[str] = None

class DailyRecordResponse(BaseModel):
    id: int
    date: str
    created_at: datetime
    updated_at: datetime

    wake_up_target: bool
    meals_tracked: bool
    water_target: bool
    walk_done: bool
    workout_done: bool
    sunlight_done: bool
    brush_am: bool
    brush_pm: bool
    bath_done: bool
    sleep_target: bool

    reading_done: bool
    brain_workout_done: bool
    meditation_done: bool
    writing_done: bool

    coding_done: bool
    dsa_done: bool
    technical_learning_done: bool
    project_done: bool

    communication_done: bool
    jam_done: bool
    voice_practice_done: bool

    avoid_scrolling: bool
    phone_free_sleep: bool
    mit_completed: bool

    sleep_hours: float
    sleep_quality: int
    wake_time: str
    bed_time: str
    water_l: float
    walking_min: int
    workout_sessions: int
    outdoor_min: int
    meditation_min: int
    coding_min: int
    dsa_problems: int
    reading_min: int
    communication_min: int
    technical_learning_min: int
    project_min: int

    daily_score: float
    health_score: float
    brain_score: float
    engineering_score: float
    communication_score: float
    discipline_score: float
    status: str
    notes: str

    class Config:
        from_attributes = True
