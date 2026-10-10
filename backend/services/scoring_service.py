from models.daily_record import DailyRecord
from models.settings import UserSettings

class ScoringService:
    @staticmethod
    def calculate_scores(record: DailyRecord, settings: UserSettings):
        hw = settings.health_weight if settings else 0.25
        bw = settings.brain_weight if settings else 0.15
        ew = settings.engineering_weight if settings else 0.35
        cw = settings.communication_weight if settings else 0.10
        dw = settings.discipline_weight if settings else 0.15

        # Check if anything has been logged at all
        health_checklist_items = [
            record.wake_up_target, record.meals_tracked, record.water_target,
            record.walk_done, record.workout_done, record.sunlight_done,
            record.brush_am, record.brush_pm, record.bath_done, record.sleep_target
        ]
        brain_checklist_items = [
            record.reading_done, record.brain_workout_done,
            record.meditation_done, record.writing_done
        ]
        eng_checklist_items = [
            record.coding_done, record.dsa_done,
            record.technical_learning_done, record.project_done
        ]
        comm_checklist_items = [
            record.communication_done, record.jam_done, record.voice_practice_done
        ]
        disc_checklist_items = [
            record.avoid_scrolling, record.phone_free_sleep, record.mit_completed
        ]

        has_any_check = any(health_checklist_items + brain_checklist_items + eng_checklist_items + comm_checklist_items + disc_checklist_items)
        has_any_num = any([
            (record.sleep_hours or 0) > 0,
            (record.water_l or 0) > 0,
            (record.walking_min or 0) > 0,
            (record.workout_sessions or 0) > 0,
            (record.coding_min or 0) > 0,
            (record.dsa_problems or 0) > 0,
            (record.reading_min or 0) > 0,
            (record.meditation_min or 0) > 0,
            (record.communication_min or 0) > 0
        ])

        if not has_any_check and not has_any_num:
            return {
                "daily_score": 0.0,
                "health_score": 0.0,
                "brain_score": 0.0,
                "engineering_score": 0.0,
                "communication_score": 0.0,
                "discipline_score": 0.0,
                "status": "NOT STARTED"
            }

        # HEALTH SCORE
        health_check_ratio = sum(1 for x in health_checklist_items if x) / len(health_checklist_items)
        sleep_target = settings.target_sleep_hours if settings and settings.target_sleep_hours > 0 else 8.0
        sleep_ratio = min(1.0, (record.sleep_hours or 0.0) / sleep_target)
        water_target = settings.target_water_l if settings and settings.target_water_l > 0 else 4.0
        water_ratio = min(1.0, (record.water_l or 0.0) / water_target)
        walk_target = settings.target_walk_min if settings and settings.target_walk_min > 0 else 30
        walk_ratio = min(1.0, (record.walking_min or 0) / walk_target)
        workout_target = settings.target_workout_sessions if settings and settings.target_workout_sessions > 0 else 1
        workout_ratio = min(1.0, (record.workout_sessions or 0) / workout_target)

        health_numeric_ratio = (sleep_ratio + water_ratio + walk_ratio + workout_ratio) / 4.0
        health_score = round((health_check_ratio * 0.5 + health_numeric_ratio * 0.5) * 100, 1)

        # BRAIN SCORE
        brain_check_ratio = sum(1 for x in brain_checklist_items if x) / len(brain_checklist_items)
        reading_target = settings.target_reading_min if settings and settings.target_reading_min > 0 else 20
        reading_ratio = min(1.0, (record.reading_min or 0) / reading_target)
        meditation_target = settings.target_meditation_min if settings and settings.target_meditation_min > 0 else 5
        meditation_ratio = min(1.0, (record.meditation_min or 0) / meditation_target)
        brain_numeric_ratio = (reading_ratio + meditation_ratio) / 2.0
        brain_score = round((brain_check_ratio * 0.5 + brain_numeric_ratio * 0.5) * 100, 1)

        # ENGINEERING SCORE
        eng_check_ratio = sum(1 for x in eng_checklist_items if x) / len(eng_checklist_items)
        coding_target = settings.target_coding_min if settings and settings.target_coding_min > 0 else 60
        coding_ratio = min(1.0, (record.coding_min or 0) / coding_target)
        dsa_target = settings.target_dsa_problems if settings and settings.target_dsa_problems > 0 else 2
        dsa_ratio = min(1.0, (record.dsa_problems or 0) / dsa_target)
        eng_numeric_ratio = (coding_ratio + dsa_ratio) / 2.0
        engineering_score = round((eng_check_ratio * 0.5 + eng_numeric_ratio * 0.5) * 100, 1)

        # COMMUNICATION SCORE
        comm_check_ratio = sum(1 for x in comm_checklist_items if x) / len(comm_checklist_items)
        comm_target = settings.target_communication_min if settings and settings.target_communication_min > 0 else 15
        comm_numeric_ratio = min(1.0, (record.communication_min or 0) / comm_target)
        communication_score = round((comm_check_ratio * 0.5 + comm_numeric_ratio * 0.5) * 100, 1)

        # DISCIPLINE SCORE
        discipline_score = round((sum(1 for x in disc_checklist_items if x) / len(disc_checklist_items)) * 100, 1)

        total_weight = hw + bw + ew + cw + dw
        daily_score = round(
            (health_score * hw + brain_score * bw + engineering_score * ew + communication_score * cw + discipline_score * dw) / total_weight,
            1
        )

        status = "IN PROGRESS"
        if daily_score >= 80:
            status = "STRONG"
        elif daily_score >= 65:
            status = "OPTIMAL"
        elif daily_score >= 50:
            status = "FAIR"

        return {
            "daily_score": daily_score,
            "health_score": health_score,
            "brain_score": brain_score,
            "engineering_score": engineering_score,
            "communication_score": communication_score,
            "discipline_score": discipline_score,
            "status": status
        }
