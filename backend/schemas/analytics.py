from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ComparisonMetric(BaseModel):
    name: str
    current_value: float
    previous_value: float
    diff: float
    pct_change: float
    status: str # "up", "down", "neutral"
    unit: str

class HabitMatrixRow(BaseModel):
    habit: str
    category: str
    days: List[Optional[bool]] # Mon - Sun (7 elements)

class CalendarHeatmapDay(BaseModel):
    date: str
    day: int
    score: float
    status: str
    intensity: int # 0-4

class SevenDayOverviewItem(BaseModel):
    date: str
    label: str # "Today", "Yesterday", "-2 Days", etc.
    score: float
    coding_hours: float
    dsa_problems: int
    sleep_hours: float

class WeeklyAnalyticsResponse(BaseModel):
    week_start: str
    week_end: str
    weekly_score: float
    days_tracked: int
    avg_sleep: float
    total_coding_hours: float
    total_dsa: int
    total_reading_hours: float
    total_comm_hours: float
    workout_sessions: int
    walking_min: int
    meditation_min: int
    project_hours: float
    learning_hours: float
    comparisons: List[ComparisonMetric]
    matrix: List[HabitMatrixRow]
    daily_scores: List[SevenDayOverviewItem]

class MonthlyAnalyticsResponse(BaseModel):
    month: str # YYYY-MM
    monthly_score: float
    days_tracked: int
    total_days: int
    best_day: Optional[str] = None
    worst_day: Optional[str] = None
    avg_sleep: float
    total_coding_hours: float
    total_dsa: int
    total_reading_hours: float
    total_comm_hours: float
    workout_sessions: int
    learning_hours: float
    project_hours: float
    calendar_days: List[CalendarHeatmapDay]
    trends: List[Dict[str, Any]]
    comparisons: List[ComparisonMetric]

class YearMonthSummary(BaseModel):
    month: str # "01", "02", ...
    month_name: str # "January", ...
    avg_score: float
    days_tracked: int
    coding_hours: float
    dsa_problems: int
    reading_hours: float
    workout_sessions: int

class YearlyAnalyticsResponse(BaseModel):
    year: int
    overall_score: float
    total_days_tracked: int
    months: List[YearMonthSummary]
    heatmap: List[CalendarHeatmapDay] # 365 days

class StreaksResponse(BaseModel):
    overall_streak: int
    best_overall_streak: int
    coding_streak: int
    best_coding_streak: int
    dsa_streak: int
    best_dsa_streak: int
    reading_streak: int
    best_reading_streak: int
    workout_streak: int
    best_workout_streak: int
    meditation_streak: int
    best_meditation_streak: int
    communication_streak: int
    best_communication_streak: int
