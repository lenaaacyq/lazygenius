import json
import random
from typing import Any, Optional, cast
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Flashcard
from schemas import FlashcardOut, FlashcardReview, FlashcardGenerateInput
from services import ai_processor, ocr

router = APIRouter(prefix="/cards")

PLACEHOLDER_CARD = FlashcardOut(
    id=0,
    hook_title="新用户示例卡：快速上手 3 步",
    core_insight="",
    logic_breakdown=[
        "第一步，粘贴一个链接，让系统抓取内容并生成卡片。",
        "第二步，向右滑保留，向左滑归档。",
        "第三步，点进详情查看原文并积累你的知识库。"
    ],
    actionable_takeaway="",
    golden_quote="从一条链接开始，把零散信息变成可复用的知识卡。",
    xiaohongshu_copy="",
    tags=[],
    visual_vibe="Tech Minimalism: 深邃黑底色 + 荧光紫点缀",
    content_type="",
    information_extraction=[],
    ocr_text="",
    source_excerpt="这是一个示例卡片，用于新用户首次进入时的占位展示。",
    source_url="",
    status="placeholder",
    weight=0.0,
    created_at=None
)

def to_flashcard_out(card: Any) -> FlashcardOut:
    tags = []
    logic_breakdown = []
    information_extraction = []
    try:
        tags = json.loads(card.tags) if card.tags else []
    except json.JSONDecodeError:
        tags = []
    try:
        logic_breakdown = json.loads(card.logic_breakdown) if card.logic_breakdown else []
    except json.JSONDecodeError:
        logic_breakdown = []
    try:
        information_extraction = json.loads(card.information_extraction) if card.information_extraction else []
    except json.JSONDecodeError:
        information_extraction = []
    return FlashcardOut(
        id=card.id,
        hook_title=card.hook_title,
        core_insight=card.core_insight,
        logic_breakdown=logic_breakdown,
        actionable_takeaway=card.actionable_takeaway,
        golden_quote=card.golden_quote,
        xiaohongshu_copy=card.xiaohongshu_copy,
        tags=tags,
        visual_vibe=card.visual_vibe,
        content_type=card.content_type,
        information_extraction=information_extraction,
        ocr_text=card.ocr_text,
        source_excerpt=card.source_excerpt,
        source_url=card.source_url,
        status=card.status,
        weight=card.weight,
        created_at=card.created_at
    )

def normalize_list(value: Any):
    if isinstance(value, list):
        return value
    if value is None:
        return []
    return [str(value)]

def truncate_text(value: Any, limit: int) -> str:
    text = ("" if value is None else str(value)).strip()
    if len(text) <= limit:
        return text
    return text[:limit].rstrip()

def display_len(value: Any) -> int:
    text = ("" if value is None else str(value))
    total = 0
    for ch in text:
        if ch == "\n":
            continue
        total += 2 if ord(ch) > 127 else 1
    return total

def truncate_by_display_len(value: Any, limit: int) -> str:
    text = ("" if value is None else str(value)).strip()
    if display_len(text) <= limit:
        return text
    out = []
    total = 0
    for ch in text:
        if ch == "\n":
            continue
        w = 2 if ord(ch) > 127 else 1
        if total + w > limit:
            break
        out.append(ch)
        total += w
    return "".join(out).rstrip()

def resolve_strategy(strategy: str, rand: float) -> str:
    if strategy != "hybrid":
        return strategy
    if rand < 0.3:
        return "new"
    if rand < 0.8:
        return "review"
    return "random"

def fetch_card_by_strategy(db: Session, strategy: str) -> Optional[Flashcard]:
    query = db.query(Flashcard)
    if strategy == "new":
        return query.filter(Flashcard.status == "new").order_by(Flashcard.created_at.desc()).first()
    if strategy == "review":
        return query.order_by(Flashcard.weight.desc(), Flashcard.created_at.asc()).first()
    return query.order_by(func.random()).first()

@router.get("/next", response_model=FlashcardOut)
def get_next_card(strategy: str = Query("random"), db: Session = Depends(get_db)):
    if strategy == "hybrid":
        total = db.query(Flashcard).count()
        if total == 0:
            return PLACEHOLDER_CARD
        strategy = resolve_strategy(strategy, random.random())

    card = fetch_card_by_strategy(db, strategy)
    if not card:
        return PLACEHOLDER_CARD
    return to_flashcard_out(card)

@router.post("/{card_id}/review", response_model=FlashcardOut)
def review_card(card_id: int, payload: FlashcardReview, db: Session = Depends(get_db)):
    card = cast(Any, db.query(Flashcard).filter(Flashcard.id == card_id).first())
    if not card:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    action = payload.action
    if action == "keep":
        card.status = "kept"
        card.weight = min(card.weight + 0.2, 2.0)
    elif action == "archive":
        card.status = "archived"
        card.weight = max(card.weight - 0.3, 0.1)
    else:
        raise HTTPException(status_code=400, detail="Invalid action")
    db.commit()
    db.refresh(card)
    return to_flashcard_out(card)

@router.post("/generate-image", response_model=FlashcardOut)
async def generate_card_from_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Image file required")
    image_bytes = await file.read()
    try:
        text = ocr.extract_text_from_image_bytes(image_bytes)
    except RuntimeError as e:
        if str(e) == "tesseract_not_installed":
            raise HTTPException(status_code=500, detail="OCR not available")
        raise HTTPException(status_code=500, detail="OCR failed")
    if not text:
        raise HTTPException(status_code=400, detail="No text extracted from image")
    source_excerpt = text[:150] + "..." if len(text) > 150 else text
    flashcard = ai_processor.generate_flashcard_from_text(text)
    if not flashcard:
        raise HTTPException(status_code=500, detail="Failed to generate flashcard")
    tags = normalize_list(flashcard.get("tags"))
    logic_breakdown = normalize_list(flashcard.get("logic_breakdown"))
    information_extraction = normalize_list(flashcard.get("information_extraction"))
    card = Flashcard(
        hook_title=flashcard.get("hook_title", ""),
        core_insight=flashcard.get("core_insight", ""),
        logic_breakdown=json.dumps(logic_breakdown, ensure_ascii=False),
        actionable_takeaway=flashcard.get("actionable_takeaway", ""),
        golden_quote=flashcard.get("golden_quote", ""),
        xiaohongshu_copy=flashcard.get("xiaohongshu_copy", ""),
        tags=json.dumps(tags, ensure_ascii=False),
        visual_vibe=flashcard.get("visual_vibe", ""),
        content_type=flashcard.get("content_type", ""),
        information_extraction=json.dumps(information_extraction, ensure_ascii=False),
        ocr_text=text,
        source_excerpt=source_excerpt,
        source_url="",
        status="new",
        weight=1.0
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    return to_flashcard_out(card)

@router.post("/generate", response_model=FlashcardOut)
def generate_card(payload: FlashcardGenerateInput, db: Session = Depends(get_db)):
    url = (payload.url or "").strip()
    text = (payload.text or "").strip()
    auth_cookie = (payload.auth_cookie or "").strip()
    xhs_session_id = (payload.xhs_session_id or "").strip()
    if not url and not text:
        raise HTTPException(status_code=400, detail="Text or URL is required")
    if url:
        content = ai_processor.get_content_from_url(
            url,
            auth_cookie=auth_cookie or None,
            xhs_session_id=xhs_session_id or None,
        )
        if not content:
            raise HTTPException(status_code=400, detail="Failed to fetch URL content")
        source_excerpt = content[:150] + "..." if len(content) > 150 else content
    else:
        content = text
        source_excerpt = content[:150] + "..." if len(content) > 150 else content
    flashcard = ai_processor.generate_flashcard_from_text(content)
    if not flashcard:
        raise HTTPException(status_code=500, detail="Failed to generate flashcard")
    tags = normalize_list(flashcard.get("tags"))
    logic_breakdown = normalize_list(flashcard.get("logic_breakdown"))
    information_extraction = normalize_list(flashcard.get("information_extraction"))
    hook_title = truncate_by_display_len(flashcard.get("hook_title", ""), 40)
    golden_quote = truncate_by_display_len(flashcard.get("golden_quote", ""), 110)
    core_insight = truncate_by_display_len(flashcard.get("core_insight", ""), 180)
    actionable_takeaway = truncate_by_display_len(flashcard.get("actionable_takeaway", ""), 180)
    visual_vibe = truncate_by_display_len(flashcard.get("visual_vibe", ""), 90)
    content_type = truncate_by_display_len(flashcard.get("content_type", ""), 60)
    logic_breakdown = [truncate_by_display_len(x, 120) for x in logic_breakdown][:3]
    information_extraction = [truncate_text(x, 160) for x in information_extraction][:6]
    card = Flashcard(
        hook_title=hook_title,
        core_insight=core_insight,
        logic_breakdown=json.dumps(logic_breakdown, ensure_ascii=False),
        actionable_takeaway=actionable_takeaway,
        golden_quote=golden_quote,
        xiaohongshu_copy=flashcard.get("xiaohongshu_copy", ""),
        tags=json.dumps(tags, ensure_ascii=False),
        visual_vibe=visual_vibe,
        content_type=content_type,
        information_extraction=json.dumps(information_extraction, ensure_ascii=False),
        ocr_text=flashcard.get("ocr_text", ""),
        source_excerpt=source_excerpt,
        source_url=url,
        status="new",
        weight=1.0
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    return to_flashcard_out(card)
