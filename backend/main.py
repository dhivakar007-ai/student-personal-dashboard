from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from database import engine, Base
import models
import os
import sys
from routes import (
    daily_router, analytics_router, activities_router,
    tasks_router, diary_router, dsa_router,
    communication_router, growth_router, planning_router,
    settings_router, search_router, export_router, admin_router
)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Student Personal Dashboard API",
    description="Local backend for the Student Personal Dashboard",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(daily_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(activities_router, prefix="/api")
app.include_router(tasks_router, prefix="/api")
app.include_router(diary_router, prefix="/api")
app.include_router(dsa_router, prefix="/api")
app.include_router(communication_router, prefix="/api")
app.include_router(growth_router, prefix="/api")
app.include_router(planning_router, prefix="/api")
app.include_router(settings_router, prefix="/api")
app.include_router(search_router, prefix="/api")
app.include_router(export_router, prefix="/api")
app.include_router(admin_router, prefix="/api")

# Serve built frontend in production
_frontend_dir = None
if getattr(sys, 'frozen', False):
    # PyInstaller: frontend is next to the backend in resources
    _frontend_dir = os.path.join(os.path.dirname(sys.executable), "..", "frontend")
elif os.environ.get("GOD_HQ_SERVE_FRONTEND"):
    _frontend_dir = os.environ["GOD_HQ_SERVE_FRONTEND"]

if _frontend_dir and os.path.isdir(_frontend_dir):
    _frontend_dir = os.path.abspath(_frontend_dir)

    @app.get("/")
    def serve_index():
        return FileResponse(os.path.join(_frontend_dir, "index.html"))

    # Mount static assets AFTER the root route
    app.mount("/assets", StaticFiles(directory=os.path.join(_frontend_dir, "assets")), name="assets")
else:
    @app.get("/")
    def root():
        return {
            "status": "online",
            "app": "Student Personal Dashboard",
            "subtitle": "STUDY AND PERSONAL PROGRESS TRACKING"
        }

if __name__ == "__main__":
    import uvicorn
    import sys
    is_frozen = getattr(sys, 'frozen', False)
    uvicorn.run(
        "main:app" if not is_frozen else app,
        host="127.0.0.1",
        port=8000,
        reload=not is_frozen,
    )
