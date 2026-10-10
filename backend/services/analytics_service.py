from sqlalchemy.orm import Session
from models.daily_record import DailyRecord
from models.settings import UserSettings
from services.date_service import DateService
from services.daily_service import DailyService
import calendar

class AnalyticsService:
    @staticmethod
    def get_seven_day_overview(db: Session, reference_date: str):
        days = []
        labels = ['Today', 'Yesterday', '-2 Days', '-3 Days', '-4 Days', '-5 Days', '-6 Days']
        for i in range(7):
            d_str = DateService.get_relative_date(reference_date, -i)
            record = db.query(DailyRecord).filter(DailyRecord.date == d_str).first()
            score = record.daily_score if record else 0.0
            coding = round((record.coding_min or 0) / 60.0, 1) if record else 0.0
            dsa = record.dsa_problems if record else 0
            sleep = record.sleep_hours if record else 0.0
            days.append({
                'date': d_str,
                'label': labels[i],
                'score': score,
                'coding_hours': coding,
                'dsa_problems': dsa,
                'sleep_hours': sleep
            })
        days.reverse()
        return days

    @staticmethod
    def compute_metric_comparison(name: str, cur_val: float, prev_val: float, unit: str):
        diff = round(cur_val - prev_val, 2)
        if prev_val > 0:
            pct = round(((cur_val - prev_val) / prev_val) * 100, 1)
        else:
            pct = 100.0 if cur_val > 0 else 0.0
        status = 'up' if diff > 0 else ('down' if diff < 0 else 'neutral')
        return {
            'name': name,
            'current_value': round(cur_val, 2),
            'previous_value': round(prev_val, 2),
            'diff': diff,
            'pct_change': pct,
            'status': status,
            'unit': unit
        }

    @staticmethod
    def get_weekly_analytics(db: Session, reference_date: str):
        settings = DailyService.get_or_create_settings(db)
        week_start, week_end = DateService.get_week_bounds(reference_date, settings.week_start_day)
        prev_start, prev_end = DateService.get_previous_week_bounds(reference_date, settings.week_start_day)

        cur_records = db.query(DailyRecord).filter(DailyRecord.date >= week_start, DailyRecord.date <= week_end).all()
        prev_records = db.query(DailyRecord).filter(DailyRecord.date >= prev_start, DailyRecord.date <= prev_end).all()

        cur_map = {r.date: r for r in cur_records}

        def summarize(recs):
            if not recs:
                return {
                    'count': 0, 'avg_score': 0.0, 'avg_sleep': 0.0,
                    'coding_h': 0.0, 'dsa': 0, 'reading_h': 0.0,
                    'comm_h': 0.0, 'workouts': 0, 'walk_m': 0,
                    'med_m': 0, 'proj_h': 0.0, 'learn_h': 0.0
                }
            active = [r for r in recs if r.daily_score > 0 or r.coding_min > 0 or r.sleep_hours > 0 or r.walk_done]
            count = len(active)
            scores = [r.daily_score for r in recs if r.daily_score > 0]
            avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0
            sleeps = [r.sleep_hours for r in recs if r.sleep_hours > 0]
            avg_sleep = round(sum(sleeps) / len(sleeps), 1) if sleeps else 0.0
            return {
                'count': count,
                'avg_score': avg_score,
                'avg_sleep': avg_sleep,
                'coding_h': round(sum(r.coding_min or 0 for r in recs) / 60.0, 1),
                'dsa': sum(r.dsa_problems or 0 for r in recs),
                'reading_h': round(sum(r.reading_min or 0 for r in recs) / 60.0, 1),
                'comm_h': round(sum(r.communication_min or 0 for r in recs) / 60.0, 1),
                'workouts': sum(r.workout_sessions or 0 for r in recs),
                'walk_m': sum(r.walking_min or 0 for r in recs),
                'med_m': sum(r.meditation_min or 0 for r in recs),
                'proj_h': round(sum(r.project_min or 0 for r in recs) / 60.0, 1),
                'learn_h': round(sum(r.technical_learning_min or 0 for r in recs) / 60.0, 1)
            }

        cur_sum = summarize(cur_records)
        prev_sum = summarize(prev_records)

        comparisons = [
            AnalyticsService.compute_metric_comparison('Weekly Score', cur_sum['avg_score'], prev_sum['avg_score'], '%'),
            AnalyticsService.compute_metric_comparison('Coding', cur_sum['coding_h'], prev_sum['coding_h'], 'h'),
            AnalyticsService.compute_metric_comparison('DSA Problems', cur_sum['dsa'], prev_sum['dsa'], 'problems'),
            AnalyticsService.compute_metric_comparison('Sleep Average', cur_sum['avg_sleep'], prev_sum['avg_sleep'], 'h'),
            AnalyticsService.compute_metric_comparison('Reading', cur_sum['reading_h'], prev_sum['reading_h'], 'h'),
            AnalyticsService.compute_metric_comparison('Workouts', cur_sum['workouts'], prev_sum['workouts'], 'sessions')
        ]

        week_days = DateService.get_days_in_range(week_start, week_end)
        habits_tracked = [
            ('Wake Up', 'Health', 'wake_up_target'),
            ('Water Target', 'Health', 'water_target'),
            ('Walk', 'Health', 'walk_done'),
            ('Workout', 'Health', 'workout_done'),
            ('Coding', 'Engineering', 'coding_done'),
            ('DSA', 'Engineering', 'dsa_done'),
            ('Reading', 'Brain', 'reading_done'),
            ('Meditation', 'Brain', 'meditation_done'),
            ('Communication', 'Communication', 'communication_done'),
            ('No Scrolling', 'Discipline', 'avoid_scrolling')
        ]

        matrix = []
        for h_name, cat, attr in habits_tracked:
            row_days = []
            for d in week_days:
                rec = cur_map.get(d)
                val = getattr(rec, attr, False) if rec else False
                row_days.append(val)
            matrix.append({'habit': h_name, 'category': cat, 'days': row_days})

        daily_scores = AnalyticsService.get_seven_day_overview(db, reference_date)

        return {
            'week_start': week_start,
            'week_end': week_end,
            'weekly_score': cur_sum['avg_score'],
            'days_tracked': cur_sum['count'],
            'avg_sleep': cur_sum['avg_sleep'],
            'total_coding_hours': cur_sum['coding_h'],
            'total_dsa': cur_sum['dsa'],
            'total_reading_hours': cur_sum['reading_h'],
            'total_comm_hours': cur_sum['comm_h'],
            'workout_sessions': cur_sum['workouts'],
            'walking_min': cur_sum['walk_m'],
            'meditation_min': cur_sum['med_m'],
            'project_hours': cur_sum['proj_h'],
            'learning_hours': cur_sum['learn_h'],
            'comparisons': comparisons,
            'matrix': matrix,
            'daily_scores': daily_scores
        }

    @staticmethod
    def get_monthly_analytics(db: Session, reference_date: str):
        month_str = reference_date[:7]
        m_start, m_end = DateService.get_month_bounds(month_str)
        prev_m_start, prev_m_end = DateService.get_previous_month_bounds(month_str)

        cur_records = db.query(DailyRecord).filter(DailyRecord.date >= m_start, DailyRecord.date <= m_end).all()
        prev_records = db.query(DailyRecord).filter(DailyRecord.date >= prev_m_start, DailyRecord.date <= prev_m_end).all()

        cur_map = {r.date: r for r in cur_records}
        days_in_month = DateService.get_days_in_range(m_start, m_end)
        total_days = len(days_in_month)

        scored_records = [r for r in cur_records if r.daily_score > 0]
        days_tracked = len(scored_records)
        monthly_score = round(sum(r.daily_score for r in scored_records) / len(scored_records), 1) if scored_records else 0.0

        best_day = max(scored_records, key=lambda x: x.daily_score).date if scored_records else None
        worst_day = min(scored_records, key=lambda x: x.daily_score).date if scored_records else None

        sleeps = [r.sleep_hours for r in cur_records if r.sleep_hours > 0]
        avg_sleep = round(sum(sleeps) / len(sleeps), 1) if sleeps else 0.0
        total_coding = round(sum(r.coding_min or 0 for r in cur_records) / 60.0, 1)
        total_dsa = sum(r.dsa_problems or 0 for r in cur_records)
        total_reading = round(sum(r.reading_min or 0 for r in cur_records) / 60.0, 1)
        total_comm = round(sum(r.communication_min or 0 for r in cur_records) / 60.0, 1)
        total_workouts = sum(r.workout_sessions or 0 for r in cur_records)
        total_learning = round(sum(r.technical_learning_min or 0 for r in cur_records) / 60.0, 1)
        total_projects = round(sum(r.project_min or 0 for r in cur_records) / 60.0, 1)

        calendar_days = []
        for d in days_in_month:
            day_num = int(d.split('-')[2])
            rec = cur_map.get(d)
            score = rec.daily_score if rec else 0.0
            status = rec.status if rec else 'NEEDS_WORK'
            intensity = 0
            if score >= 80:
                intensity = 4
            elif score >= 65:
                intensity = 3
            elif score >= 50:
                intensity = 2
            elif score > 0:
                intensity = 1
            calendar_days.append({
                'date': d,
                'day': day_num,
                'score': score,
                'status': status,
                'intensity': intensity
            })

        trends = []
        for d in days_in_month:
            day_num = int(d.split('-')[2])
            rec = cur_map.get(d)
            trends.append({
                'date': d,
                'day': day_num,
                'score': rec.daily_score if rec else 0.0,
                'coding_hours': round((rec.coding_min or 0) / 60.0, 1) if rec else 0.0,
                'dsa_problems': rec.dsa_problems if rec else 0,
                'sleep_hours': rec.sleep_hours if rec else 0.0,
                'reading_hours': round((rec.reading_min or 0) / 60.0, 1) if rec else 0.0,
                'comm_hours': round((rec.communication_min or 0) / 60.0, 1) if rec else 0.0
            })

        prev_scored = [r for r in prev_records if r.daily_score > 0]
        prev_m_score = round(sum(r.daily_score for r in prev_scored) / len(prev_scored), 1) if prev_scored else 0.0
        prev_coding = round(sum(r.coding_min or 0 for r in prev_records) / 60.0, 1)
        prev_dsa = sum(r.dsa_problems or 0 for r in prev_records)

        comparisons = [
            AnalyticsService.compute_metric_comparison('Monthly Score', monthly_score, prev_m_score, '%'),
            AnalyticsService.compute_metric_comparison('Coding Hours', total_coding, prev_coding, 'h'),
            AnalyticsService.compute_metric_comparison('DSA Solved', total_dsa, prev_dsa, 'problems')
        ]

        return {
            'month': month_str,
            'monthly_score': monthly_score,
            'days_tracked': days_tracked,
            'total_days': total_days,
            'best_day': best_day,
            'worst_day': worst_day,
            'avg_sleep': avg_sleep,
            'total_coding_hours': total_coding,
            'total_dsa': total_dsa,
            'total_reading_hours': total_reading,
            'total_comm_hours': total_comm,
            'workout_sessions': total_workouts,
            'learning_hours': total_learning,
            'project_hours': total_projects,
            'calendar_days': calendar_days,
            'trends': trends,
            'comparisons': comparisons
        }

    @staticmethod
    def get_yearly_analytics(db: Session, year: int):
        y_start, y_end = DateService.get_year_bounds(year)
        records = db.query(DailyRecord).filter(DailyRecord.date >= y_start, DailyRecord.date <= y_end).all()
        rec_map = {r.date: r for r in records}

        months = []
        for m in range(1, 13):
            m_str = f'{year:04d}-{m:02d}'
            m_recs = [r for r in records if r.date.startswith(m_str)]
            scored = [r for r in m_recs if r.daily_score > 0]
            avg_score = round(sum(r.daily_score for r in scored) / len(scored), 1) if scored else 0.0
            months.append({
                'month': f'{m:02d}',
                'month_name': calendar.month_name[m],
                'avg_score': avg_score,
                'days_tracked': len(scored),
                'coding_hours': round(sum(r.coding_min or 0 for r in m_recs) / 60.0, 1),
                'dsa_problems': sum(r.dsa_problems or 0 for r in m_recs),
                'reading_hours': round(sum(r.reading_min or 0 for r in m_recs) / 60.0, 1),
                'workout_sessions': sum(r.workout_sessions or 0 for r in m_recs)
            })

        all_days = DateService.get_days_in_range(y_start, y_end)
        heatmap = []
        for d in all_days:
            rec = rec_map.get(d)
            score = rec.daily_score if rec else 0.0
            status = rec.status if rec else 'NEEDS_WORK'
            intensity = 0
            if score >= 80:
                intensity = 4
            elif score >= 65:
                intensity = 3
            elif score >= 50:
                intensity = 2
            elif score > 0:
                intensity = 1
            heatmap.append({
                'date': d,
                'day': int(d.split('-')[2]),
                'score': score,
                'status': status,
                'intensity': intensity
            })

        total_tracked = sum(1 for r in records if r.daily_score > 0)
        overall_score = round(sum(r.daily_score for r in records if r.daily_score > 0) / total_tracked, 1) if total_tracked else 0.0

        return {
            'year': year,
            'overall_score': overall_score,
            'total_days_tracked': total_tracked,
            'months': months,
            'heatmap': heatmap
        }

    @staticmethod
    def get_streaks(db: Session, reference_date: str):
        records = db.query(DailyRecord).order_by(DailyRecord.date.asc()).all()
        date_map = {r.date: r for r in records}

        def calculate_streak_for_filter(condition_fn):
            current_streak = 0
            best_streak = 0
            temp_streak = 0

            cur_d = reference_date
            while True:
                rec = date_map.get(cur_d)
                if rec and condition_fn(rec):
                    current_streak += 1
                    cur_d = DateService.get_relative_date(cur_d, -1)
                else:
                    if cur_d == reference_date:
                        cur_d = DateService.get_yesterday(reference_date)
                        rec = date_map.get(cur_d)
                        if rec and condition_fn(rec):
                            current_streak += 1
                            cur_d = DateService.get_relative_date(cur_d, -1)
                            continue
                    break

            sorted_dates = sorted(date_map.keys())
            prev_dt = None
            for d in sorted_dates:
                rec = date_map[d]
                if condition_fn(rec):
                    dt = DateService.parse_date(d)
                    if prev_dt and (dt - prev_dt).days == 1:
                        temp_streak += 1
                    else:
                        temp_streak = 1
                    prev_dt = dt
                    if temp_streak > best_streak:
                        best_streak = temp_streak
                else:
                    temp_streak = 0
                    prev_dt = None

            return current_streak, max(current_streak, best_streak)

        overall_cur, overall_best = calculate_streak_for_filter(lambda r: (r.daily_score or 0) >= 50 or (r.coding_min or 0) > 0 or r.walk_done)
        coding_cur, coding_best = calculate_streak_for_filter(lambda r: (r.coding_min or 0) >= 30 or r.coding_done)
        dsa_cur, dsa_best = calculate_streak_for_filter(lambda r: (r.dsa_problems or 0) >= 1 or r.dsa_done)
        reading_cur, reading_best = calculate_streak_for_filter(lambda r: (r.reading_min or 0) >= 15 or r.reading_done)
        workout_cur, workout_best = calculate_streak_for_filter(lambda r: (r.workout_sessions or 0) >= 1 or r.workout_done)
        med_cur, med_best = calculate_streak_for_filter(lambda r: (r.meditation_min or 0) >= 5 or r.meditation_done)
        comm_cur, comm_best = calculate_streak_for_filter(lambda r: (r.communication_min or 0) >= 10 or r.communication_done)

        return {
            'overall_streak': overall_cur,
            'best_overall_streak': overall_best,
            'coding_streak': coding_cur,
            'best_coding_streak': coding_best,
            'dsa_streak': dsa_cur,
            'best_dsa_streak': dsa_best,
            'reading_streak': reading_cur,
            'best_reading_streak': reading_best,
            'workout_streak': workout_cur,
            'best_workout_streak': workout_best,
            'meditation_streak': med_cur,
            'best_meditation_streak': med_best,
            'communication_streak': comm_cur,
            'best_communication_streak': comm_best
        }
