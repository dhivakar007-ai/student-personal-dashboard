export interface DailyRecord {
  id: number;
  date: string; // YYYY-MM-DD
  created_at?: string;
  updated_at?: string;

  // Checklist - Health
  wake_up_target: boolean;
  meals_tracked: boolean;
  water_target: boolean;
  walk_done: boolean;
  workout_done: boolean;
  sunlight_done: boolean;
  brush_am: boolean;
  brush_pm: boolean;
  bath_done: boolean;
  sleep_target: boolean;

  // Checklist - Brain
  reading_done: boolean;
  brain_workout_done: boolean;
  meditation_done: boolean;
  writing_done: boolean;

  // Checklist - Engineering
  coding_done: boolean;
  dsa_done: boolean;
  technical_learning_done: boolean;
  project_done: boolean;

  // Checklist - Communication
  communication_done: boolean;
  jam_done: boolean;
  voice_practice_done: boolean;

  // Checklist - Discipline
  avoid_scrolling: boolean;
  phone_free_sleep: boolean;
  mit_completed: boolean;

  // Numeric Measurements
  sleep_hours: number;
  sleep_quality?: number;
  wake_time?: string;
  bed_time?: string;
  water_l: number;
  walking_min: number;
  workout_sessions: number;
  outdoor_min?: number;
  meditation_min: number;
  coding_min: number;
  dsa_problems: number;
  reading_min: number;
  communication_min: number;
  technical_learning_min?: number;
  project_min?: number;

  // Scores
  daily_score: number;
  health_score: number;
  brain_score: number;
  engineering_score: number;
  communication_score: number;
  discipline_score: number;
  status: string;
  notes: string;
}

export interface ActivityLog {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  duration_min: number;
  activity: string;
  category: string;
  description: string;
  related_project: string;
  notes?: string;
  created_at?: string;
}

export interface Task {
  id: number;
  title: string;
  date: string;
  priority: "P1" | "P2" | "P3";
  status: "Inbox" | "Planned" | "In Progress" | "Completed" | "Cancelled" | string;
  category: string;
  goal_id?: number | null;
  project_id?: number | null;
  completed_at?: string | null;
  created_at?: string;
}

export interface DiaryEntry {
  id: number;
  date: string;
  title: string;
  what_happened: string;
  what_accomplished: string;
  what_learned: string;
  what_went_wrong: string;
  tomorrow_priority: string;
  created_at?: string;
  updated_at?: string;
}

export interface Goal {
  id: number;
  title: string;
  area: string;
  type: "Long-term" | "Yearly" | "Semester" | "Monthly" | "Weekly" | string;
  start_date: string;
  deadline: string;
  progress: number;
  status: "Active" | "Completed" | "Paused" | "Archived" | string;
  why: string;
  next_action: string;
  created_at?: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  status: "Idea" | "Planned" | "Active" | "Paused" | "Completed" | "Archived" | string;
  progress: number;
  start_date: string;
  deadline: string;
  technology: string;
  next_action: string;
  goal_id?: number | null;
  created_at?: string;
}

export interface DSAEntry {
  id: number;
  date: string;
  problem: string;
  platform: string;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  topic: string;
  time_spent_min: number;
  solved: boolean;
  approach: string;
  notes: string;
  created_at?: string;
}

export interface CommunicationEntry {
  id: number;
  date: string;
  duration_min: number;
  type: string;
  topic: string;
  confidence: number;
  notes: string;
  created_at?: string;
}

export interface ComparisonMetric {
  name: string;
  current_value: number;
  previous_value: number;
  diff: number;
  pct_change: number;
  status: "up" | "down" | "neutral" | string;
  unit: string;
}

export interface HabitMatrixRow {
  habit: string;
  category: string;
  days: boolean[];
}

export interface CalendarHeatmapDay {
  date: string;
  day: number;
  score: number;
  status: string;
  intensity: number; // 0-4
}

export interface SevenDayOverviewItem {
  date: string;
  label: string;
  score: number;
  coding_hours: number;
  dsa_problems: number;
  sleep_hours: number;
}

export interface WeeklyAnalytics {
  week_start: string;
  week_end: string;
  weekly_score: number;
  days_tracked: number;
  avg_sleep: number;
  total_coding_hours: number;
  total_dsa: number;
  total_reading_hours: number;
  total_comm_hours: number;
  workout_sessions: number;
  walking_min: number;
  meditation_min: number;
  project_hours: number;
  learning_hours: number;
  comparisons: ComparisonMetric[];
  matrix: HabitMatrixRow[];
  daily_scores: SevenDayOverviewItem[];
}

export interface MonthlyAnalytics {
  month: string;
  monthly_score: number;
  days_tracked: number;
  total_days: number;
  best_day: string | null;
  worst_day: string | null;
  avg_sleep: number;
  total_coding_hours: number;
  total_dsa: number;
  total_reading_hours: number;
  total_comm_hours: number;
  workout_sessions: number;
  learning_hours: number;
  project_hours: number;
  calendar_days: CalendarHeatmapDay[];
  trends?: Array<{
    date: string;
    day: number;
    score: number;
    coding_hours: number;
    dsa_problems: number;
    sleep_hours: number;
    reading_hours: number;
    comm_hours: number;
  }>;
  comparisons: ComparisonMetric[];
}

export interface YearlyAnalytics {
  year: number;
  overall_score: number;
  total_days_tracked: number;
  months: Array<{
    month: string;
    month_name: string;
    avg_score: number;
    days_tracked: number;
    coding_hours: number;
    dsa_problems: number;
    reading_hours: number;
    workout_sessions: number;
  }>;
  heatmap: CalendarHeatmapDay[];
}

export interface StreaksData {
  overall_streak: number;
  best_overall_streak: number;
  coding_streak: number;
  best_coding_streak: number;
  dsa_streak: number;
  best_dsa_streak: number;
  reading_streak: number;
  best_reading_streak: number;
  workout_streak: number;
  best_workout_streak: number;
  meditation_streak: number;
  best_meditation_streak: number;
  communication_streak: number;
  best_communication_streak: number;
}

export interface UserSettings {
  id: number;
  health_weight: number;
  brain_weight: number;
  engineering_weight: number;
  communication_weight: number;
  discipline_weight: number;

  target_wake_time: string;
  target_sleep_hours: number;
  target_water_l: number;
  target_walk_min: number;
  target_workout_sessions: number;
  target_reading_min: number;
  target_brain_workout_min: number;
  target_meditation_min: number;
  target_coding_min: number;
  target_dsa_problems: number;
  target_technical_learning_min: number;
  target_project_min: number;
  target_communication_min: number;
  target_jam_min: number;
  target_voice_min: number;

  week_start_day: string;
  timezone: string;
  theme: string;
}

export interface Certification {
  id: number;
  title: string;
  provider: string;
  start_date: string;
  deadline: string;
  exam_date: string;
  progress: number;
  status: string;
  hours_invested: number;
  link: string;
  created_at?: string;
}

export interface Competition {
  id: number;
  title: string;
  organization: string;
  reg_deadline: string;
  sub_deadline: string;
  status: string;
  team: string;
  idea: string;
  result: string;
  link: string;
  created_at?: string;
}

export interface WeeklyReview {
  id: number;
  week_start: string;
  week_end: string;
  weekly_score: number;
  days_tracked: number;
  coding_hours: number;
  dsa_problems: number;
  reading_hours: number;
  communication_hours: number;
  workout_sessions: number;
  what_went_well: string;
  what_went_wrong: string;
  what_learned: string;
  what_to_stop: string;
  what_to_start: string;
  what_to_continue: string;
  next_week_priority: string;
}

export interface MonthlyReview {
  id: number;
  month: string;
  monthly_score: number;
  prev_month_score: number;
  score_diff: number;
  days_tracked: number;
  coding_hours: number;
  dsa_problems: number;
  reading_hours: number;
  communication_hours: number;
  workout_sessions: number;
  learning_hours: number;
  project_hours: number;
  biggest_achievement: string;
  biggest_mistake: string;
  biggest_lesson: string;
  what_improved: string;
  what_needs_improvement: string;
  what_to_change_next_month: string;
  main_objective: string;
}

export interface SearchResult {
  type: string;
  title: string;
  snippet: string;
  date: string;
  id: number;
}
