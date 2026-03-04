import os
import json
import base64
import time
import re
from urllib.parse import urlparse
import openai
import requests
from bs4 import BeautifulSoup
from readability import Document
from dotenv import load_dotenv
from typing import Optional, Dict, Any, cast
from services import xhs_login
from services import ocr

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"), override=True)

raw_kimi_key = os.getenv("KIMI_API_KEY")
raw_openai_key = os.getenv("OPENAI_API_KEY")
KIMI_API_KEY = raw_kimi_key.strip().strip("`'\"") if raw_kimi_key else None
OPENAI_API_KEY = raw_openai_key.strip().strip("`'\"") if raw_openai_key else None
API_KEY = KIMI_API_KEY or OPENAI_API_KEY
key_len = len(API_KEY) if API_KEY else 0
key_prefix = API_KEY[:3] if API_KEY else ""
DEFAULT_BASE_URL = "https://api.moonshot.cn/v1"
raw_base_url = os.getenv("API_BASE_URL", DEFAULT_BASE_URL)
_base_url_match = re.search(r"https?://[^\s'\"`]+", raw_base_url)
BASE_URL = _base_url_match.group(0) if _base_url_match else DEFAULT_BASE_URL
BASE_URL = BASE_URL.strip().strip("'\"").rstrip(",")
MODEL_NAME = os.getenv("MODEL_NAME", "moonshot-v1-8k")
ACTIVE_PROVIDER = "kimi" if KIMI_API_KEY else ("openai" if OPENAI_API_KEY else "none")
print(f"AI config: provider={ACTIVE_PROVIDER}, raw_base_url={raw_base_url!r}, base_url={BASE_URL!r}, model={MODEL_NAME}")
print(f"AI auth: key_len={key_len}, key_prefix={key_prefix!r}")

try:
    client = openai.OpenAI(api_key=API_KEY, base_url=BASE_URL)
except Exception as e:
    print(f"Failed to initialize AI client: {e}")
    client = None

LARK_APP_ID = os.getenv("LARK_APP_ID")
LARK_APP_SECRET = os.getenv("LARK_APP_SECRET")
AUTH_COOKIE = os.getenv("AUTH_COOKIE", "")
AUTH_COOKIE_DOMAINS = os.getenv("AUTH_COOKIE_DOMAINS", "xhslink.com,xiaohongshu.com")
AUTH_COOKIE_COOLDOWN = int(os.getenv("AUTH_COOKIE_COOLDOWN", "60"))
_last_auth_fetch_ts = 0.0
PLAYWRIGHT_ENABLED = os.getenv("PLAYWRIGHT_ENABLED", "false").lower() in {"1", "true", "yes"}
PLAYWRIGHT_DOMAINS = os.getenv("PLAYWRIGHT_DOMAINS", "xhslink.com,xiaohongshu.com")
PLAYWRIGHT_COOLDOWN = int(os.getenv("PLAYWRIGHT_COOLDOWN", "120"))
PLAYWRIGHT_USER_DATA_DIR = os.getenv("PLAYWRIGHT_USER_DATA_DIR", os.path.join(BASE_DIR, ".playwright"))
PLAYWRIGHT_HEADLESS = os.getenv("PLAYWRIGHT_HEADLESS", "true").lower() in {"1", "true", "yes"}
CONTENT_MIN_CHARS = int(os.getenv("CONTENT_MIN_CHARS", "300"))
IMAGE_OCR_ENABLED = os.getenv("IMAGE_OCR_ENABLED", "false").lower() in {"1", "true", "yes"}
IMAGE_OCR_MAX_IMAGES = int(os.getenv("IMAGE_OCR_MAX_IMAGES", "20"))
_last_playwright_fetch_ts = 0.0

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

def _extract_meta_summary(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    title = (soup.title.get_text(strip=True) if soup.title else "") or ""
    def pick_meta(attr: str, value: str) -> str:
        tag = soup.find("meta", attrs={attr: value})
        if not tag:
            return ""
        content = tag.get("content")
        if content is None:
            return ""
        if isinstance(content, list):
            return " ".join(str(x) for x in content).strip()
        return str(content).strip()

    description = pick_meta("name", "description") or pick_meta("property", "og:description")
    citation_title = pick_meta("name", "citation_title")
    citation_abstract = pick_meta("name", "citation_abstract")
    citation_doi = pick_meta("name", "citation_doi")

    parts = []
    if citation_title:
        parts.append(f"Title: {citation_title}")
    elif title:
        parts.append(f"Title: {title}")
    if description:
        parts.append(f"Description: {description}")
    if citation_doi:
        parts.append(f"DOI: {citation_doi}")
    if citation_abstract:
        parts.append(f"Abstract: {citation_abstract}")
    return "\n".join(parts).strip()

def _parse_arxiv_id(url: str) -> str:
    path = urlparse(url).path or ""
    path = path.strip("/")
    if path.startswith("abs/"):
        arxiv_id = path.split("/", 1)[1]
    elif path.startswith("pdf/"):
        arxiv_id = path.split("/", 1)[1]
        if arxiv_id.endswith(".pdf"):
            arxiv_id = arxiv_id[:-4]
    else:
        arxiv_id = path.split("/", 1)[-1]
    arxiv_id = arxiv_id.strip()
    return arxiv_id

def _fetch_arxiv_abstract(url: str, headers: Dict[str, str]) -> Optional[str]:
    arxiv_id = _parse_arxiv_id(url)
    if not arxiv_id:
        return None
    try:
        resp = requests.get(
            "https://export.arxiv.org/api/query",
            params={"id_list": arxiv_id},
            headers=headers,
            timeout=15,
            allow_redirects=True,
        )
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "xml")
        entry = soup.find("entry")
        if not entry:
            return None
        title_tag = entry.find("title")
        summary_tag = entry.find("summary")
        title = (title_tag.get_text(" ", strip=True) if title_tag else "") or ""
        summary = (summary_tag.get_text(" ", strip=True) if summary_tag else "") or ""
        authors = [a.get_text(" ", strip=True) for a in entry.find_all("name")]
        lines = []
        if title:
            lines.append(f"Title: {title}")
        if authors:
            lines.append(f"Authors: {', '.join(authors[:15])}")
        if summary:
            lines.append(f"Abstract: {summary}")
        text = "\n".join(lines).strip()
        return text or None
    except Exception:
        return None

def _github_api_headers(base_headers: Dict[str, str]) -> Dict[str, str]:
    headers = dict(base_headers)
    headers["Accept"] = "application/vnd.github+json"
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"
    return headers

def _fetch_github_text(url: str, headers: Dict[str, str]) -> Optional[str]:
    parsed = urlparse(url)
    parts = [p for p in (parsed.path or "").split("/") if p]
    if len(parts) < 2:
        return None
    owner, repo = parts[0], parts[1]
    api_headers = _github_api_headers(headers)

    try:
        if len(parts) >= 4 and parts[2] in {"issues", "pull"} and parts[3].isdigit():
            number = int(parts[3])
            issue_resp = requests.get(
                f"https://api.github.com/repos/{owner}/{repo}/issues/{number}",
                headers=api_headers,
                timeout=15,
                allow_redirects=True,
            )
            issue_resp.raise_for_status()
            issue = issue_resp.json()
            title = (issue.get("title") or "").strip()
            body = (issue.get("body") or "").strip()
            lines = [f"GitHub: {owner}/{repo} #{number}"]
            if title:
                lines.append(f"Title: {title}")
            if body:
                lines.append(body)
            text = "\n\n".join([l for l in lines if l]).strip()
            return text or None

        repo_resp = requests.get(
            f"https://api.github.com/repos/{owner}/{repo}",
            headers=api_headers,
            timeout=15,
            allow_redirects=True,
        )
        if repo_resp.ok:
            repo_data = repo_resp.json()
            repo_desc = (repo_data.get("description") or "").strip()
        else:
            repo_desc = ""

        readme_resp = requests.get(
            f"https://api.github.com/repos/{owner}/{repo}/readme",
            headers=api_headers,
            timeout=15,
            allow_redirects=True,
        )
        readme = ""
        if readme_resp.ok:
            data = readme_resp.json()
            content_b64 = (data.get("content") or "").strip()
            if content_b64:
                try:
                    readme = base64.b64decode(content_b64.encode("utf-8")).decode("utf-8", errors="ignore").strip()
                except Exception:
                    readme = ""

        lines = [f"GitHub Repo: {owner}/{repo}"]
        if repo_desc:
            lines.append(f"Description: {repo_desc}")
        if readme:
            lines.append(readme)
        text = "\n\n".join([l for l in lines if l]).strip()
        return text or None
    except Exception:
        return None

def extract_text_from_html(html: str) -> str:
    doc = Document(html)
    summary_html = doc.summary(html_partial=True)
    summary_text = BeautifulSoup(summary_html, 'html.parser').get_text(separator='\n', strip=True)
    if summary_text:
        return summary_text
    soup = BeautifulSoup(html, 'html.parser')
    for script in soup(["script", "style", "nav", "footer", "header", "aside"]):
        script.extract()
    return soup.get_text(separator='\n', strip=True)

def looks_like_login_wall(text: str) -> bool:
    if not text:
        return True
    signals = ["扫码", "获取验证码", "手机号登录", "我已阅读并同意", "登录后推荐", "用户协议", "隐私政策"]
    return any(s in text for s in signals)

def get_html_and_ocr_with_playwright(url: str) -> Optional[Dict[str, Any]]:
    try:
        from playwright.sync_api import sync_playwright
    except Exception as e:
        print(f"Playwright not available: {e}")
        return None
    try:
        with sync_playwright() as p:
            context = p.chromium.launch_persistent_context(
                PLAYWRIGHT_USER_DATA_DIR,
                headless=PLAYWRIGHT_HEADLESS,
                viewport={"width": 1280, "height": 720},
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            )
            page = context.new_page()
            page.goto(url, wait_until="networkidle", timeout=30000)
            page.wait_for_timeout(1500)
            for _ in range(4):
                page.evaluate("window.scrollBy(0, document.body.scrollHeight)")
                page.wait_for_timeout(800)
            html = page.content()
            ocr_texts = []
            if IMAGE_OCR_ENABLED:
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
                print(f"Playwright images: {len(image_urls)}")
                for image_url in image_urls[: IMAGE_OCR_MAX_IMAGES * 2]:
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
                    if len(ocr_texts) >= IMAGE_OCR_MAX_IMAGES:
                        break
                print(f"Playwright OCR blocks: {len(ocr_texts)}")
            else:
                print("Playwright OCR disabled")
            context.close()
            ocr_text = "\n".join(ocr_texts).strip()
            print(f"Playwright OCR length: {len(ocr_text)}")
            return {"html": html, "ocr_text": ocr_text}
    except Exception as e:
        print(f"Playwright fetch failed: {e}")
        return None

SYSTEM_PROMPT = """
你是一位兼具“顶流爆款网感”与“深度认知架构”的专业内容主理人（对标小红书高赞专业干货、即刻高密度动态）。
你的专长是将复杂冗长的文章、带有大量噪音的网页爬取文本（如水印、备案号）或无序的聊天记录，解构并重塑为高信息密度、极具洞察力的"结构化知识卡片"。

你的目标是：
1. 自动过滤所有网页噪音（如 ICP 备案号、营业执照、广告链接、导航菜单等无意义文本）。
2. 拒绝干瘪的机器总结与水文废话。让用户在 15 秒内获得 "Aha Moment"（顿悟），掌握底层逻辑。
3. 保持“说人话”的温度，兼具锋利的专业含金量与极强的内容吸引力。

请额外严格遵守“长度与符号约束”（重要，必须满足，否则会导致前端展示异常）：
1. "hook_title" 必须短，尽量 20 个中文以内（或 40 个英文字符以内），不要换行。
2. "logic_breakdown" 最多 3 条；每条尽量 60 个中文以内（或 120 个英文字符以内），不要使用省略号（… 或 ...）。
3. "golden_quote" 必须短，尽量 45 个中文以内（或 100 个英文字符以内），不要使用省略号（… 或 ...）。
4. 避免输出超长英文原句，必要时改写为更短、更好读的中文表达。

请严格输出 JSON 格式，包含以下字段：
1. "hook_title": (字符串) 极具社交传播力的吸睛标题，采用"反直觉/制造认知差 + 抛出核心价值"的句式，可包含 1 个契合主题的 Emoji，不超过 25 字。
2. "logic_breakdown": (数组) 知识骨架拆解。用 3-4 个极其精炼且带有递进关系的短句支撑核心观点。
   **强制格式要求**：每条必须是完整句子，不允许冒号前的小标题格式，不使用 Markdown 加粗。需包含原文中的具体场景、数据或因果关系，每条 20-40 字。
3. "golden_quote": (字符串) 原文中认知密度最高、最适合被截图转发为“金句”的一句话。
4. "visual_vibe": (字符串) 建议的视觉设计基调（需给出颜色搭配与风格，如：Tech Minimalism: 深邃黑底色 + 荧光绿提亮，突出极客感）。
注意：绝对不要包含任何 AI 助手的开场白或解释说明（如"为您生成如下内容"），严格校验 JSON 的合法性再输出。
"""

IMAGE_SYSTEM_PROMPT = """
你是一位多模态数据分析师和专业知识主理人（对标 Reddit 硬核版块、即刻高密度动态、小红书专业图文）。
你的专长是从各类截图、信息流帖子、图表或聊天记录中，精准提取有效信息，并转化为高密度的"结构化知识卡片"。
你的目标是：穿透表面的视觉噪音，提炼出图片背后的核心信息增量、数据逻辑或深度认知。

图片可能是截图、小红书帖子、聊天记录、数据图表或其他内容。

请深入分析图片内容，并严格输出 JSON 格式，包含以下字段：
1. "content_type": (字符串) 判断图片的内容类型（如：数据图表、知识干货分享、聊天记录、产品截图、无意义广告）。
2. "hook_title": (字符串) 吸引眼球但具专业内核的标题，提炼图片的最核心价值，不超过 20 字。
3. "core_insight": (字符串) 核心洞察，对图片信息进行升维总结，指出其背后的规律、痛点或趋势，不超过 80 字。
4. "information_extraction": (数组) 关键信息提取，用 3-4 个要点罗列图片中最有价值的数据、事实或步骤。若是图表请指出趋势，若是对话请提炼分歧/共识。
5. "golden_quote": (字符串) 图片中最精彩/最关键的一句话（如果没有，则根据内容总结一句金句）。
6. "tags": (数组) 3-5个精准的专业标签。
7. "visual_vibe": (字符串) 建议的视觉设计基调（如：Data Driven Cold, Warm Storytelling, Sharp Contrast）。
8. "ocr_text": (字符串) 图片中识别出的完整核心文字内容（忽略无意义的 UI 元素和边角乱码）。

注意：去除一切客套话，直击重点。如果判断图片是纯广告、无意义自拍或信息量极低的内容，请在 "core_insight" 中明确输出"信息熵过低，无收录价值"，并可简化其他字段的生成。
"""

def get_content_from_url(url: str, auth_cookie: Optional[str] = None, xhs_session_id: Optional[str] = None) -> Optional[str]:
    try:
        global _last_auth_fetch_ts
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        domain = (urlparse(url).hostname or "").lower()
        if domain.endswith("arxiv.org"):
            arxiv_text = _fetch_arxiv_abstract(url, headers)
            if arxiv_text:
                return arxiv_text
        if domain.endswith("github.com"):
            github_text = _fetch_github_text(url, headers)
            if github_text:
                return github_text
        allow_domains = {d.strip().lower() for d in AUTH_COOKIE_DOMAINS.split(",") if d.strip()}
        if xhs_session_id and domain and any(domain.endswith(d) for d in allow_domains):
            result = xhs_login.get_html_and_ocr_with_session(url, xhs_session_id, IMAGE_OCR_ENABLED, IMAGE_OCR_MAX_IMAGES)
            if result:
                html = result.get("html", "")
                text = extract_text_from_html(html)
                ocr_text = result.get("ocr_text", "")
                if ocr_text:
                    text = f"{text}\n{ocr_text}" if text else ocr_text
                if text:
                    return text
        if auth_cookie and domain and any(domain.endswith(d) for d in allow_domains):
            headers["Cookie"] = auth_cookie
        elif AUTH_COOKIE and domain and any(domain.endswith(d) for d in allow_domains):
            now = time.time()
            if now - _last_auth_fetch_ts >= AUTH_COOKIE_COOLDOWN:
                headers["Cookie"] = AUTH_COOKIE
                _last_auth_fetch_ts = now
        response = requests.get(url, headers=headers, timeout=15, allow_redirects=True)
        response.raise_for_status()
        html = response.text
        text = extract_text_from_html(html)
        meta = _extract_meta_summary(html)
        if meta and (not text or len(text) < CONTENT_MIN_CHARS):
            text = f"{meta}\n\n{text}".strip() if text else meta
        needs_playwright = not text or len(text) < CONTENT_MIN_CHARS or looks_like_login_wall(text)
        allow_domains = {d.strip().lower() for d in PLAYWRIGHT_DOMAINS.split(",") if d.strip()}
        if PLAYWRIGHT_ENABLED and domain and any(domain.endswith(d) for d in allow_domains) and (needs_playwright or IMAGE_OCR_ENABLED):
            global _last_playwright_fetch_ts
            now = time.time()
            if now - _last_playwright_fetch_ts >= PLAYWRIGHT_COOLDOWN:
                _last_playwright_fetch_ts = now
                result = get_html_and_ocr_with_playwright(url)
                if result:
                    html = result.get("html", "")
                    if needs_playwright:
                        text = extract_text_from_html(html)
                    ocr_text = result.get("ocr_text", "")
                    if ocr_text:
                        text = f"{text}\n{ocr_text}" if text else ocr_text
        return text
    except requests.RequestException as e:
        print(f"Error fetching URL {url}: {e}")
        return None

def generate_flashcard_from_text(text: str) -> Optional[Dict[str, Any]]:
    if not client:
        raise ValueError("AI client is not initialized. Check API_KEY.")

    max_input_chars = int(os.getenv("MODEL_MAX_INPUT_CHARS", "16000"))

    def shrink_input(s: str, target: int) -> str:
        s = (s or "").strip()
        if len(s) <= target:
            return s
        head = max(0, int(target * 0.75))
        tail = max(0, target - head)
        return (s[:head] + "\n...\n" + (s[-tail:] if tail else "")).strip()

    user_text = shrink_input(text, max_input_chars)

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_text}
    ]
    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=cast(Any, messages),
            response_format={"type": "json_object"}
        )
        flashcard_data = response.choices[0].message.content
        if flashcard_data:
            return json.loads(flashcard_data)
        return None
    except Exception as e:
        print(f"Error generating flashcard: {e}")
        try:
            url = f"{BASE_URL}/chat/completions"
            headers = {
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": MODEL_NAME,
                "messages": messages,
                "response_format": {"type": "json_object"}
            }
            resp = requests.post(url, headers=headers, json=payload, timeout=30)
            print(f"AI debug: url={url!r}, status={resp.status_code}, auth_len={len(API_KEY) if API_KEY else 0}, auth_prefix={(API_KEY[:3] if API_KEY else '')!r}")
            if resp.status_code >= 400:
                print(f"AI debug error: {resp.text[:300]}")
                data = None
                try:
                    data = resp.json()
                except Exception:
                    data = None
                token_limit = (
                    resp.status_code == 400
                    and isinstance(data, dict)
                    and isinstance(data.get("error"), dict)
                    and "token limit" in str(data["error"].get("message", "")).lower()
                )
                if token_limit:
                    tighter = max(4000, int(max_input_chars * 0.6))
                    retry_messages = [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": shrink_input(text, tighter)},
                    ]
                    payload["messages"] = retry_messages
                    resp2 = requests.post(url, headers=headers, json=payload, timeout=30)
                    print(f"AI debug: url={url!r}, status={resp2.status_code}, auth_len={len(API_KEY) if API_KEY else 0}, auth_prefix={(API_KEY[:3] if API_KEY else '')!r}")
                    if resp2.status_code >= 400:
                        print(f"AI debug error: {resp2.text[:300]}")
                        return None
                    flashcard_data = resp2.json().get("choices", [{}])[0].get("message", {}).get("content", "")
                    if flashcard_data:
                        return json.loads(flashcard_data)
                return None
            flashcard_data = resp.json().get("choices", [{}])[0].get("message", {}).get("content", "")
            if flashcard_data:
                return json.loads(flashcard_data)
        except Exception as debug_error:
            print(f"AI debug request failed: {debug_error}")
        return None

def generate_flashcard_from_image(image_base64: str) -> Optional[Dict[str, Any]]:
    if not client:
        raise ValueError("AI client is not initialized. Check API_KEY.")

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": IMAGE_SYSTEM_PROMPT},
                {
                    "role": "user", 
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}"
                            }
                        }
                    ]
                }
            ],
            response_format={"type": "json_object"},
            max_tokens=1000
        )
        flashcard_data = response.choices[0].message.content
        if flashcard_data:
            return json.loads(flashcard_data)
        return None
    except Exception as e:
        print(f"Error generating flashcard from image: {e}")
        return None

def get_lark_tenant_token() -> Optional[str]:
    if not LARK_APP_ID or not LARK_APP_SECRET:
        return None
    try:
        response = requests.post(
            "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
            json={"app_id": LARK_APP_ID, "app_secret": LARK_APP_SECRET}
        )
        data = response.json()
        return data.get("tenant_access_token")
    except Exception as e:
        print(f"Error getting Lark token: {e}")
        return None

def download_lark_image(image_key: str) -> Optional[bytes]:
    token = get_lark_tenant_token()
    if not token:
        print("Failed to get Lark tenant token")
        return None
    
    try:
        response = requests.get(
            f"https://open.feishu.cn/open-apis/im/v1/messages/{image_key}/resources/image",
            headers={"Authorization": f"Bearer {token}"},
            params={"type": "image"}
        )
        if response.status_code == 200:
            return response.content
        print(f"Failed to download image: {response.status_code}")
        return None
    except Exception as e:
        print(f"Error downloading Lark image: {e}")
        return None
