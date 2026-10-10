import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


def _resolve_db_path() -> str:
    """Resolve database path based on environment.

    Priority:
    1. GOD_HQ_DB_PATH env var (explicit override)
    2. GOD_HQ_PRODUCTION env var → %APPDATA%/GOD-HQ/god_hq.db
    3. Default: relative to this file (development mode)
    """
    explicit = os.environ.get("GOD_HQ_DB_PATH")
    if explicit:
        os.makedirs(os.path.dirname(explicit), exist_ok=True)
        return explicit

    if os.environ.get("GOD_HQ_PRODUCTION"):
        appdata = os.environ.get("APPDATA", os.path.expanduser("~"))
        db_dir = os.path.join(appdata, "GOD-HQ")
        os.makedirs(db_dir, exist_ok=True)
        return os.path.join(db_dir, "god_hq.db")

    return os.path.join(os.path.dirname(os.path.abspath(__file__)), "god_hq.db")


DB_PATH = _resolve_db_path()
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
