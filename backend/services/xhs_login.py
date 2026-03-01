import os
import time
import uuid
import base64
import shutil
import threading
from typing import Optional, Dict, Any
from bs4 import BeautifulSoup
from readability import Document
from playwright.sync_api import sync_playwright
from services import ocr

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOGIN_URL = os.getenv("PLAYWRIGHT_LOGIN_URL", "https://www.xiaohongshu.com")
SESSION_BASE_DIR = os.getenv("PLAYWRIGHT_SESSIONS_DIR", os.path.join(BASE_DIR, ".playwright_sessions"))
SESSION_TTL = int(os.getenv("PLAYWRIGHT_SESSION_TTL", "1800"))
MAX_SESSIONS = int(os.getenv("PLAYWRIGHT_MAX_SESSIONS", "5"))
HEADLESS = os.getenv("PLAYWRIGHT_HEADLESS", "true").lower() in {"1", "true", "yes"}

_sessions: Dict[str, Dict[str, Any]] = {}
_lock = threading.Lock()

def extract_text_from_html(html: str) -> str:
    doc = Document(html)
    summary_html = doc.summary(html_partial=True)
    summary_text = BeautifulSoup(summary_html, "html.parser").get_text(separator="\n", strip=True)
    if summary_text:
        return summary_text
    soup = BeautifulSoup(html, "html.parser")
    for script in soup(["script", "style", "nav", "footer", "header", "aside"]):
        script.extract()
    return soup.get_text(separator="\n", strip=True)

def looks_like_login_wall(text: str) -> bool:
    if not text:
        return True
    signals = ["扫码", "获取验证码", "手机号登录", "我已阅读并同意", "登录后推荐", "用户协议", "隐私政策"]
    return any(s in text for s in signals)

def _cleanup_expired():
    now = time.time()
    expired = []
    for session_id, session in _sessions.items():
        if now - session["created_at"] > SESSION_TTL:
            expired.append(session_id)
    for session_id in expired:
        _close_session(session_id)

def _close_session(session_id: str) -> bool:
    session = _sessions.pop(session_id, None)
    if not session:
        return False
    try:
        session["context"].close()
    except Exception:
        pass
    try:
        session["playwright"].stop()
    except Exception:
        pass
    user_data_dir = session.get("user_data_dir")
    if user_data_dir and os.path.exists(user_data_dir):
        shutil.rmtree(user_data_dir, ignore_errors=True)
    return True

def start_session() -> Optional[str]:
    with _lock:
        _cleanup_expired()
        if len(_sessions) >= MAX_SESSIONS:
            return None
        session_id = uuid.uuid4().hex
        user_data_dir = os.path.join(SESSION_BASE_DIR, session_id)
        os.makedirs(user_data_dir, exist_ok=True)
        playwright = sync_playwright().start()
        context = playwright.chromium.launch_persistent_context(
            user_data_dir,
            headless=HEADLESS,
            viewport={"width": 1280, "height": 720},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        )
        page = context.new_page()
        try:
            page.goto(LOGIN_URL, wait_until="domcontentloaded", timeout=30000)
        except Exception:
            pass
        _sessions[session_id] = {
            "id": session_id,
            "created_at": time.time(),
            "user_data_dir": user_data_dir,
            "playwright": playwright,
            "context": context,
            "page": page,
            "lock": threading.Lock(),
        }
        return session_id

def get_status(session_id: str) -> Optional[Dict[str, Any]]:
    with _lock:
        _cleanup_expired()
        session = _sessions.get(session_id)
    if not session:
        return None
    with session["lock"]:
        page = session.get("page")
        if page is None or page.is_closed():
            page = session["context"].new_page()
            try:
                page.goto(LOGIN_URL, wait_until="domcontentloaded", timeout=30000)
            except Exception:
                pass
            session["page"] = page
        try:
            screenshot_bytes = page.screenshot(type="jpeg", quality=60, full_page=True)
            screenshot_base64 = base64.b64encode(screenshot_bytes).decode("utf-8")
        except Exception:
            screenshot_base64 = ""
        try:
            html = page.content()
            text = extract_text_from_html(html)
            logged_in = not looks_like_login_wall(text)
        except Exception:
            logged_in = False
        return {
            "session_id": session_id,
            "logged_in": logged_in,
            "screenshot_base64": screenshot_base64,
        }

def close_session(session_id: str) -> bool:
    with _lock:
        return _close_session(session_id)

def get_html_and_ocr_with_session(url: str, session_id: str, image_ocr_enabled: bool, image_ocr_max_images: int) -> Optional[Dict[str, Any]]:
    with _lock:
        _cleanup_expired()
        session = _sessions.get(session_id)
    if not session:
        return None
    with session["lock"]:
        context = session["context"]
        page = context.new_page()
        try:
            page.goto(url, wait_until="networkidle", timeout=30000)
            page.wait_for_timeout(1500)
            for _ in range(4):
                page.evaluate("window.scrollBy(0, document.body.scrollHeight)")
                page.wait_for_timeout(800)
            html = page.content()
            ocr_texts = []
            if image_ocr_enabled:
                image_urls = page.evaluate(
                    """
                    () => {
                        const urls = [];
                        const pickFirstSrcset = (srcset) => {
                            if (!srcset) return '';
                            const first = srcset.split(',')[0] || '';
                            return first.trim().split(' ')[0] || '';
                        };
                        document.querySelectorAll('img').forEach((img) => {
                            const candidates = [
                                img.currentSrc,
                                img.src,
                                img.getAttribute('data-src'),
                                img.getAttribute('data-origin-src'),
                                img.getAttribute('data-lazy-src'),
                                pickFirstSrcset(img.getAttribute('srcset'))
                            ];
                            candidates.filter(Boolean).forEach((u) => urls.push(u));
                        });
                        document.querySelectorAll('source').forEach((source) => {
                            const candidate = pickFirstSrcset(source.getAttribute('srcset'));
                            if (candidate) urls.push(candidate);
                        });
                        return urls.filter(u => u.startsWith('http') || u.startsWith('data:image/'));
                    }
                    """
                )
                seen = set()
                image_urls = [u for u in image_urls if not (u in seen or seen.add(u))]
                for image_url in image_urls[: image_ocr_max_images * 2]:
                    if image_url.startswith("data:image/"):
                        try:
                            b64_data = image_url.split(",", 1)[1]
                            image_bytes = base64.b64decode(b64_data)
                        except Exception:
                            continue
                    else:
                        try:
                            resp = context.request.get(image_url, timeout=15000, headers={"referer": url})
                            if not resp.ok:
                                continue
                            image_bytes = resp.body()
                        except Exception:
                            continue
                    text = ocr.extract_text_from_image_bytes(image_bytes)
                    if text:
                        ocr_texts.append(text)
                    if len(ocr_texts) >= image_ocr_max_images:
                        break
            ocr_text = "\n".join(ocr_texts).strip()
            return {"html": html, "ocr_text": ocr_text}
        except Exception:
            return None
        finally:
            try:
                page.close()
            except Exception:
                pass
