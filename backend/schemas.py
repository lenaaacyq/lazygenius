from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class FlashcardBase(BaseModel):
    hook_title: str
    core_insight: str
    logic_breakdown: List[str]
    actionable_takeaway: str
    golden_quote: str
    xiaohongshu_copy: str
    tags: List[str]
    visual_vibe: str
    content_type: str
    information_extraction: List[str]
    ocr_text: str
    source_excerpt: str
    source_url: str
    status: str
    weight: float

class FlashcardCreate(FlashcardBase):
    pass

class FlashcardOut(FlashcardBase):
    id: int
    created_at: Optional[datetime]

    class Config:
        orm_mode = True

class FlashcardReview(BaseModel):
    action: str

class FlashcardGenerateInput(BaseModel):
    text: Optional[str] = None
    url: Optional[str] = None
    auth_cookie: Optional[str] = None
    xhs_session_id: Optional[str] = None
