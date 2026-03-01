import json
from database import SessionLocal
from models import Flashcard
from services import ai_processor

samples = [
    {
        "url": "https://example.com/market-structure",
        "content": "市场结构决定竞争边界。完全竞争强调同质商品与价格接受者，垄断竞争强调差异化与品牌溢价，寡头市场强调策略互动与进入壁垒。理解结构不是背概念，而是识别利润池：当产品差异化足够强，企业可以通过定价权与渠道控制获取超额收益；当进入壁垒足够高，竞争的核心是资源与能力的长期积累。真正有效的策略不是“跟随行业”，而是针对结构寻找破局点，改变规则或重写供需关系。",
    },
    {
        "url": "https://example.com/decision-making",
        "content": "决策失误常来自信息噪音，而不是信息不足。高质量决策的关键是建立可验证的假设链：先定义结果标准，再列出影响结果的关键变量，最后为每个变量匹配最小验证方式。这样做的价值在于把“拍脑袋”变成“可复盘”。如果你无法说清楚“失败会是什么样”，你也很难评估“成功是否发生”。建立假设链并不是复杂化，而是让行动更具方向性。",
    },
    {
        "url": "https://example.com/attention-economy",
        "content": "注意力不是无限资源，而是可交易资产。平台通过算法把用户的短期反馈放大为长期行为习惯，形成注意力闭环。个体想要恢复主动权，必须把注意力从“被动获取信息”转为“主动筛选任务”。最有效的方式不是断网，而是设置明确的任务边界与完成标准，让注意力被目标牵引而非被内容牵引。",
    }
]

def normalize_list(value):
    if isinstance(value, list):
        return value
    if value is None:
        return []
    return [str(value)]

def regenerate():
    db = SessionLocal()
    try:
        db.query(Flashcard).delete()
        db.commit()
        for sample in samples:
            flashcard = ai_processor.generate_flashcard_from_text(sample["content"])
            if not flashcard:
                continue
            tags = normalize_list(flashcard.get("tags"))
            logic_breakdown = normalize_list(flashcard.get("logic_breakdown"))
            information_extraction = normalize_list(flashcard.get("information_extraction"))
            excerpt = sample["content"][:150] + "..." if len(sample["content"]) > 150 else sample["content"]
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
                source_excerpt=excerpt,
                source_url=sample["url"],
                status="new",
                weight=1.0
            )
            db.add(card)
        db.commit()
        print("成功插入测试数据！")
    finally:
        db.close()

if __name__ == "__main__":
    regenerate()
