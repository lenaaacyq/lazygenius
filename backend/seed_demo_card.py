import json
import os

db_path = os.path.join(os.path.dirname(__file__), "flashcards.db")
os.environ.setdefault("DATABASE_URL", f"sqlite:///{db_path}")

from database import SessionLocal, ensure_flashcards_schema
from models import Flashcard

demo_card = {
    "hook_title": "🚀飞书秒变智能助手，效率翻倍！",
    "core_insight": "",
    "logic_breakdown": [
        "配置简单，几行命令即可完成，适合小白。",
        "功能强大，支持消息推送、群管理、审批流等多种办公自动化。",
        "官方文档详尽，跟随步骤操作，几乎不会遇到问题。"
    ],
    "actionable_takeaway": "",
    "golden_quote": "OpenClaw + 飞书 = 你的专属智能工作助手。",
    "xiaohongshu_copy": "",
    "tags": [],
    "visual_vibe": "Tech Minimalism: 深邃黑底色 + 荧光绿提亮，突出极客感。",
    "content_type": "",
    "information_extraction": [],
    "ocr_text": "",
    "source_excerpt": "飞书变成智能助手｜OpenClaw接入保姆级教程\nOpenClaw + 飞书 = 你的专属智能工作助手 （自动回复、数据同步、智能提醒全能搞定✨）\n🚀 我实测的三大亮点：\n1️⃣ 配置超简单 - 几行命令就完成，小白友好\n2️⃣ 功能超强大 - 消息推送、群管理、审批流都能接\n3️⃣ 文档超详细 -...",
    "source_url": "https://www.xiaohongshu.com/discovery/item/69877f24000000000a033d79?app_platform=ios&app_version=9.19.4&share_from_user_hidden=true&xsec_source=app_share&type=normal&xsec_token=CBmToD0QdoPdracN-rz_daF8OtyePPCB583seLKML5Dn4=&author_share=1&xhsshare=WeixinSession&shareRedId=ODs2Mjk8Sjk2NzUyOTgwNjY1OTg2R0dO&apptime=1772136762&share_id=ea572070972943f8be5cbee40f8e9de3",
    "status": "new",
    "weight": 1.0
}

def seed_database():
    ensure_flashcards_schema()
    db = SessionLocal()
    try:
        Flashcard.__table__.create(bind=db.get_bind(), checkfirst=True)
        db.query(Flashcard).delete()
        db.commit()
        card = Flashcard(
            hook_title=demo_card["hook_title"],
            core_insight=demo_card["core_insight"],
            logic_breakdown=json.dumps(demo_card["logic_breakdown"], ensure_ascii=False),
            actionable_takeaway=demo_card["actionable_takeaway"],
            golden_quote=demo_card["golden_quote"],
            xiaohongshu_copy=demo_card["xiaohongshu_copy"],
            tags=json.dumps(demo_card["tags"], ensure_ascii=False),
            visual_vibe=demo_card["visual_vibe"],
            content_type=demo_card["content_type"],
            information_extraction=json.dumps(demo_card["information_extraction"], ensure_ascii=False),
            ocr_text=demo_card["ocr_text"],
            source_excerpt=demo_card["source_excerpt"],
            source_url=demo_card["source_url"],
            status=demo_card["status"],
            weight=demo_card["weight"]
        )
        db.add(card)
        db.commit()
        print("成功插入 1 条示范卡片！")
    except Exception as e:
        print(f"插入失败: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
