from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from sqlalchemy.sql import func
from database import Base

class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True, index=True)
    hook_title = Column(String(64), nullable=False, default="")
    core_insight = Column(String(256), nullable=False, default="")
    logic_breakdown = Column(Text, nullable=False, default="[]")
    actionable_takeaway = Column(Text, nullable=False, default="")
    golden_quote = Column(Text, nullable=False, default="")
    xiaohongshu_copy = Column(Text, nullable=False, default="")
    tts_script = Column(Text, nullable=False, default="")
    tags = Column(Text, nullable=False, default="[]")
    visual_vibe = Column(String(32), nullable=False, default="")
    content_type = Column(String(64), nullable=False, default="")
    information_extraction = Column(Text, nullable=False, default="[]")
    ocr_text = Column(Text, nullable=False, default="")
    source_excerpt = Column(Text, nullable=False, default="")
    source_url = Column(Text, nullable=False, default="")
    status = Column(String(32), nullable=False, default="new")
    weight = Column(Float, nullable=False, default=1.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
