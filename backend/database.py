import os
import sqlite3
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./flashcards.db")
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def ensure_flashcards_schema():
    if not DATABASE_URL.startswith("sqlite"):
        return
    db_path = DATABASE_URL.replace("sqlite:///", "", 1)
    if db_path.startswith("./"):
        db_path = os.path.join(os.path.dirname(__file__), db_path[2:])
    if not os.path.exists(db_path):
        return
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='flashcards'")
    if not cursor.fetchone():
        conn.close()
        return
    cursor.execute("PRAGMA table_info(flashcards)")
    existing = {row[1] for row in cursor.fetchall()}
    columns = {
        "logic_breakdown": "TEXT DEFAULT '[]' NOT NULL",
        "actionable_takeaway": "TEXT DEFAULT '' NOT NULL",
        "xiaohongshu_copy": "TEXT DEFAULT '' NOT NULL",
        "tts_script": "TEXT DEFAULT '' NOT NULL",
        "content_type": "TEXT DEFAULT '' NOT NULL",
        "information_extraction": "TEXT DEFAULT '[]' NOT NULL",
        "ocr_text": "TEXT DEFAULT '' NOT NULL",
        "source_excerpt": "TEXT DEFAULT '' NOT NULL",
    }
    for name, ddl in columns.items():
        if name not in existing:
            cursor.execute(f"ALTER TABLE flashcards ADD COLUMN {name} {ddl}")
    conn.commit()
    conn.close()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
