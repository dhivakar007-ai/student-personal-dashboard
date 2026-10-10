from datetime import datetime, timedelta
import calendar

class DateService:
    @staticmethod
    def get_today() -> str:
        return datetime.now().strftime('%Y-%m-%d')

    @staticmethod
    def parse_date(date_str: str) -> datetime:
        return datetime.strptime(date_str, '%Y-%m-%d')

    @staticmethod
    def format_date(dt: datetime) -> str:
        return dt.strftime('%Y-%m-%d')

    @staticmethod
    def get_yesterday(date_str: str = None) -> str:
        base = DateService.parse_date(date_str) if date_str else datetime.now()
        return DateService.format_date(base - timedelta(days=1))

    @staticmethod
    def get_relative_date(date_str: str, offset_days: int) -> str:
        base = DateService.parse_date(date_str)
        return DateService.format_date(base + timedelta(days=offset_days))

    @staticmethod
    def get_week_bounds(date_str: str, week_start_day: str = 'Monday'):
        dt = DateService.parse_date(date_str)
        start_idx = 0 if week_start_day.lower() == 'monday' else 6
        current_idx = dt.weekday()
        diff = (current_idx - start_idx) % 7
        monday = dt - timedelta(days=diff)
        sunday = monday + timedelta(days=6)
        return DateService.format_date(monday), DateService.format_date(sunday)

    @staticmethod
    def get_previous_week_bounds(date_str: str, week_start_day: str = 'Monday'):
        start, end = DateService.get_week_bounds(date_str, week_start_day)
        return DateService.get_relative_date(start, -7), DateService.get_relative_date(end, -7)

    @staticmethod
    def get_month_bounds(date_str: str):
        parts = date_str.split('-')
        year, month = int(parts[0]), int(parts[1])
        last_day = calendar.monthrange(year, month)[1]
        return f'{year:04d}-{month:02d}-01', f'{year:04d}-{month:02d}-{last_day:02d}'

    @staticmethod
    def get_previous_month_bounds(date_str: str):
        parts = date_str.split('-')
        year, month = int(parts[0]), int(parts[1])
        if month == 1:
            prev_year, prev_month = year - 1, 12
        else:
            prev_year, prev_month = year, month - 1
        last_day = calendar.monthrange(prev_year, prev_month)[1]
        return f'{prev_year:04d}-{prev_month:02d}-01', f'{prev_year:04d}-{prev_month:02d}-{last_day:02d}'

    @staticmethod
    def get_year_bounds(year: int):
        return f'{year:04d}-01-01', f'{year:04d}-12-31'

    @staticmethod
    def get_days_in_range(start_date: str, end_date: str):
        cur = DateService.parse_date(start_date)
        end = DateService.parse_date(end_date)
        days = []
        while cur <= end:
            days.append(DateService.format_date(cur))
            cur += timedelta(days=1)
        return days
