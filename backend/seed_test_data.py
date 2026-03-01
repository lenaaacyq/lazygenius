import json
from database import SessionLocal
from models import Flashcard

test_cards = [
    {
        "hook_title": "费曼学习法：最强学习法",
        "core_insight": "用简单语言解释复杂概念，教别人是最好的学习方式。",
        "source_excerpt": "费曼学习法强调把复杂概念讲清楚给初学者听，这迫使你真正理解原理，并找出自己理解中的漏洞与盲点。",
        "golden_quote": "如果你不能简单地解释它，你就没有真正理解它。",
        "tags": ["学习方法", "费曼", "知识管理"],
        "visual_vibe": "Warm",
        "source_url": "https://example.com/feynman",
        "status": "new",
        "weight": 1.0
    },
    {
        "hook_title": "帕累托法则：80/20定律",
        "core_insight": "80%的结果来自20%的努力，聚焦关键少数。",
        "source_excerpt": "帕累托法则揭示了资源分配中的极端不均衡，少数关键因素往往决定大多数结果与产出。",
        "golden_quote": "把精力集中在最重要的20%上。",
        "tags": ["效率", "时间管理", "方法论"],
        "visual_vibe": "Cold",
        "source_url": "https://example.com/pareto",
        "status": "new",
        "weight": 1.0
    },
    {
        "hook_title": "心流状态：巅峰体验",
        "core_insight": "挑战与能力匹配时，人会进入忘我的专注状态。",
        "source_excerpt": "心流是一种高度专注的心理状态，当挑战难度与技能水平匹配时，人会忘记时间并进入巅峰表现。",
        "golden_quote": "心流是人生最美好的体验之一。",
        "tags": ["心理学", "专注", "效率"],
        "visual_vibe": "Energetic",
        "source_url": "https://example.com/flow",
        "status": "new",
        "weight": 1.0
    },
]

def seed_database():
    db = SessionLocal()
    try:
        Flashcard.__table__.create(bind=db.get_bind(), checkfirst=True)
        db.query(Flashcard).delete()
        db.commit()
        for card_data in test_cards:
            card = Flashcard(
                hook_title=card_data["hook_title"],
                core_insight=card_data["core_insight"],
                golden_quote=card_data["golden_quote"],
                tags=json.dumps(card_data["tags"], ensure_ascii=False),
                visual_vibe=card_data["visual_vibe"],
                source_excerpt=card_data["source_excerpt"],
                source_url=card_data["source_url"],
                status=card_data["status"],
                weight=card_data["weight"]
            )
            db.add(card)
        db.commit()
        print(f"成功插入 {len(test_cards)} 条测试数据！")
    except Exception as e:
        print(f"插入失败: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
