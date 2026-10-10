from sqlalchemy.orm import Session
from sqlalchemy import or_
from models.activity import ActivityLog
from models.task import Task
from models.diary import DiaryEntry
from models.growth import Goal, Project
from models.dsa_entry import DSAEntry

class SearchService:
    @staticmethod
    def global_search(db: Session, query: str):
        if not query or len(query.strip()) < 2:
            return {"results": []}

        q = f"%{query.strip()}%"
        results = []

        acts = db.query(ActivityLog).filter(
            or_(ActivityLog.activity.ilike(q), ActivityLog.description.ilike(q), ActivityLog.notes.ilike(q))
        ).limit(10).all()
        for a in acts:
            results.append({
                "type": "activity",
                "title": a.activity,
                "snippet": f"{a.category} | {a.date} | {a.description or ''}",
                "date": a.date,
                "id": a.id
            })

        tasks = db.query(Task).filter(Task.title.ilike(q)).limit(10).all()
        for t in tasks:
            results.append({
                "type": "task",
                "title": t.title,
                "snippet": f"{t.priority} | {t.status} | {t.category}",
                "date": t.date,
                "id": t.id
            })

        diaries = db.query(DiaryEntry).filter(
            or_(DiaryEntry.title.ilike(q), DiaryEntry.what_happened.ilike(q), DiaryEntry.what_accomplished.ilike(q), DiaryEntry.what_learned.ilike(q))
        ).limit(10).all()
        for d in diaries:
            results.append({
                "type": "diary",
                "title": d.title or f"Diary {d.date}",
                "snippet": (d.what_accomplished or d.what_happened or "")[:80],
                "date": d.date,
                "id": d.id
            })

        projects = db.query(Project).filter(
            or_(Project.title.ilike(q), Project.description.ilike(q), Project.technology.ilike(q))
        ).limit(10).all()
        for p in projects:
            results.append({
                "type": "project",
                "title": p.title,
                "snippet": f"{p.status} | {p.technology} | {p.progress}%",
                "date": p.start_date,
                "id": p.id
            })

        goals = db.query(Goal).filter(
            or_(Goal.title.ilike(q), Goal.area.ilike(q), Goal.why.ilike(q))
        ).limit(10).all()
        for g in goals:
            results.append({
                "type": "goal",
                "title": g.title,
                "snippet": f"{g.area} | {g.type} | {g.status}",
                "date": g.start_date,
                "id": g.id
            })

        dsa = db.query(DSAEntry).filter(
            or_(DSAEntry.problem.ilike(q), DSAEntry.topic.ilike(q), DSAEntry.approach.ilike(q))
        ).limit(10).all()
        for entry in dsa:
            results.append({
                "type": "dsa",
                "title": entry.problem,
                "snippet": f"{entry.platform} | {entry.difficulty} | {entry.topic}",
                "date": entry.date,
                "id": entry.id
            })

        return {"results": results}
