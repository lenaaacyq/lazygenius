from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
import json
import re
import base64
from services import ai_processor
from database import SessionLocal
from models import Flashcard

router = APIRouter()

URL_REGEX = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'

def save_flashcard(flashcard: dict, source_url: str = "", source_excerpt: str = ""):
    tags = flashcard.get("tags") or []
    if not isinstance(tags, list):
        tags = [str(tags)]
    logic_breakdown = flashcard.get("logic_breakdown") or []
    if not isinstance(logic_breakdown, list):
        logic_breakdown = [str(logic_breakdown)]
    information_extraction = flashcard.get("information_extraction") or []
    if not isinstance(information_extraction, list):
        information_extraction = [str(information_extraction)]
    db = SessionLocal()
    try:
        card = Flashcard(
            hook_title=flashcard.get("hook_title", ""),
            core_insight=flashcard.get("core_insight", ""),
            logic_breakdown=json.dumps(logic_breakdown, ensure_ascii=False),
            actionable_takeaway=flashcard.get("actionable_takeaway", ""),
            golden_quote=flashcard.get("golden_quote", ""),
            tags=json.dumps(tags, ensure_ascii=False),
            visual_vibe=flashcard.get("visual_vibe", ""),
            content_type=flashcard.get("content_type", ""),
            information_extraction=json.dumps(information_extraction, ensure_ascii=False),
            ocr_text=flashcard.get("ocr_text", ""),
            source_excerpt=source_excerpt,
            source_url=source_url,
            status="new",
            weight=1.0
        )
        db.add(card)
        db.commit()
        db.refresh(card)
        print("Successfully generated and saved flashcard:")
        print(json.dumps(flashcard, indent=2, ensure_ascii=False))
    finally:
        db.close()

def process_text_task(text: str):
    print(f"Starting background task for text: {text}")
    match = re.search(URL_REGEX, text)
    if not match:
        print("No URL found in the message.")
        return

    url = match.group(0)
    print(f"Found URL: {url}")
    
    content = ai_processor.get_content_from_url(url)
    if not content:
        print("Failed to get content from URL.")
        return
        
    print("Successfully fetched content, generating flashcard...")
    flashcard = ai_processor.generate_flashcard_from_text(content)
    
    if flashcard:
        excerpt = content[:150] + "..." if len(content) > 150 else content
        save_flashcard(flashcard, source_url=url, source_excerpt=excerpt)
    else:
        print("Failed to generate flashcard.")

def process_image_task(image_key: str):
    print(f"Starting background task for image: {image_key}")
    
    image_data = ai_processor.download_lark_image(image_key)
    if not image_data:
        print("Failed to download image from Lark.")
        return
    
    print("Successfully downloaded image, generating flashcard...")
    image_base64 = base64.b64encode(image_data).decode('utf-8')
    flashcard = ai_processor.generate_flashcard_from_image(image_base64)
    
    if flashcard:
        save_flashcard(flashcard, source_url=f"lark_image://{image_key}")
    else:
        print("Failed to generate flashcard from image.")

@router.post("/lark/webhook")
async def lark_webhook(request: Request, background_tasks: BackgroundTasks):
    try:
        data = await request.json()

        if "challenge" in data:
            return {"challenge": data["challenge"]}

        background_tasks.add_task(handle_event, data)
        return {"status": "success"}

    except Exception as e:
        print(f"Error processing Lark webhook: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

async def handle_event(data: dict):
    print("Handling event in the background...")
    try:
        event = data.get("event", {})
        message = event.get("message", {})
        msg_type = message.get("message_type")
        
        if msg_type == "text":
            content = json.loads(message.get("content", "{}"))
            text_content = content.get("text", "")
            print(f"Received text message: {text_content}")
            process_text_task(text_content)
            
        elif msg_type == "image":
            image_key = json.loads(message.get("content", "{}")).get("image_key")
            print(f"Received image with key: {image_key}")
            process_image_task(image_key)
            
    except Exception as e:
        print(f"Error in background task: {e}")
