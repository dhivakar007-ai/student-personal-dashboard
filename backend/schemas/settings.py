from pydantic import BaseModel
from typing import Optional

class UserSettingsUpdate(BaseModel):
    health_weight: Optional[float] = None
    brain_weight: Optional[float] = None
    engineering_weight: Optional[float] = None
    communication_weight: Optional[float] = None
    discipline_weight: Optional[float] = None

    target_wake_time: Optional[str] = None
    target_sleep_hours: Optional[float] = None
    target_water_l: Optional[float] = None
    target_walk_min: Optional[int] = None
    target_workout_sessions: Optional[int] = None
    target_reading_min: Optional[int] = None
    target_brain_workout_min: Optional[int] = None
    target_meditation_min: Optional[int] = None
    target_coding_min: Optional[int] = None
    target_dsa_problems: Optional[int] = None
    target_technical_learning_min: Optional[int] = None
    target_project_min: Optional[int] = None
    target_communication_min: Optional[int] = None
    target_jam_min: Optional[int] = None
    target_voice_min: Optional[int] = None

    week_start_day: Optional[str] = None
    timezone: Optional[str] = None
    theme: Optional[str] = None

class UserSettingsResponse(BaseModel):
    id: int
    health_weight: float
    brain_weight: float
    engineering_weight: float
    communication_weight: float
    discipline_weight: float

    target_wake_time: str
    target_sleep_hours: float
    target_water_l: float
    target_walk_min: int
    target_workout_sessions: int
    target_reading_min: int
    target_brain_workout_min: int
    target_meditation_min: int
    target_coding_min: int
    target_dsa_problems: int
    target_technical_learning_min: int
    target_project_min: int
    target_communication_min: int
    target_jam_min: int
    target_voice_min: int

    week_start_day: str
    timezone: str
    theme: str
    class Config:
        from_attributes = True
