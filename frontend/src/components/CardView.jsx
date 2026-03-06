import { motion, useMotionValue, useTransform } from "motion/react";
import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

export default function CardView({
  card,
  enterFrom,
  isPlaceholder = false,
  onCardClick,
  onSwipeLeft,
  onSwipeRight,
}) {
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [pointerMeta, setPointerMeta] = useState({ x: 0, y: 0, moved: false });
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const saveGlowOpacity = useTransform(x, [0, 150], [0, 0.9]);
  const archiveOverlayOpacity = useTransform(x, [-150, 0], [0.85, 0]);

  const handleDragEnd = (_event, info) => {
    if (isPlaceholder) return;
    if (info.offset.x > 100) {
      setSwipeDirection("right");
      setTimeout(() => {
        onSwipeRight();
      }, 220);
    } else if (info.offset.x < -100) {
      setSwipeDirection("left");
      setTimeout(() => {
        onSwipeLeft();
      }, 220);
    }
  };

  const normalizePoint = (text = "") => {
    const cleaned = text.replace(/\*\*/g, "").trim();
    const parts = cleaned.split(/[:：]/);
    if (parts.length > 1 && parts[0].length <= 6) {
      return parts.slice(1).join("：").trim();
    }
    return cleaned;
  };

  const keyPoints = Array.isArray(card?.logic_breakdown)
    ? card.logic_breakdown.map((point) => normalizePoint(point)).slice(0, 3)
    : [];

  useEffect(() => {
    setSwipeDirection(null);
  }, [card?.id]);

  const swipeAnimation = swipeDirection === "right"
    ? { x: 420, y: -10, rotate: 14, opacity: 0, scale: 0.92 }
    : swipeDirection === "left"
      ? { x: -420, y: 10, rotate: -14, opacity: 0, scale: 0.92 }
      : {};

  const enterInitial = enterFrom === "right"
    ? { x: 120, opacity: 0, scale: 0.96 }
    : enterFrom === "left"
      ? { x: -120, opacity: 0, scale: 0.96 }
      : { x: 0, opacity: 1, scale: 1 };

  return (
    <div className="flex flex-col items-center justify-center px-8 py-1">
      <motion.div
        initial={enterInitial}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full flex justify-center"
      >
      <motion.div
        drag={swipeDirection || isPlaceholder ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        style={{
          x,
          rotate,
          opacity,
          touchAction: "pan-y",
          filter: useTransform(x, [-150, 0, 150], [
            "brightness(0.35) saturate(0.3) contrast(0.8)",
            "brightness(1) saturate(1) contrast(1)",
            "brightness(1.05) saturate(1.1) contrast(1)",
          ]),
        }}
        onPointerDown={(e) => {
          setPointerMeta({ x: e.clientX, y: e.clientY, moved: false });
        }}
        onPointerMove={(e) => {
          if (pointerMeta.moved) return;
          const dx = Math.abs(e.clientX - pointerMeta.x);
          const dy = Math.abs(e.clientY - pointerMeta.y);
          if (dx > 8 || dy > 8) {
            setPointerMeta((prev) => ({ ...prev, moved: true }));
          }
        }}
        onPointerUp={(e) => {
          if (isPlaceholder) return;
          if (e?.target?.closest?.('[data-detail="1"]')) return;
          if (!pointerMeta.moved) {
            onCardClick?.();
          }
        }}
        animate={swipeDirection ? swipeAnimation : undefined}
        transition={swipeDirection ? { duration: 0.35, ease: "easeIn" } : {
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.98 }}
        className="cursor-grab active:cursor-grabbing w-full max-w-md"
      >
        <div
          className="bg-gradient-to-br from-gray-800/90 via-gray-800/95 to-gray-900 rounded-3xl overflow-hidden border border-white/10 relative backdrop-blur-xl"
          style={{
            boxShadow: "0 20px 60px -12px rgba(0, 0, 0, 0.8), 0 8px 24px -8px rgba(168, 85, 247, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-green-500/20 to-emerald-500/30 pointer-events-none rounded-3xl"
            style={{
              opacity: swipeDirection === "right" ? 1 : saveGlowOpacity,
            }}
          />
          <motion.div
            className="absolute inset-0 bg-black/50 pointer-events-none rounded-3xl"
            style={{
              opacity: swipeDirection === "left" ? 0.9 : archiveOverlayOpacity,
            }}
          />
          {swipeDirection === "right" && (
            <motion.div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 1, 0] }}
              transition={{ duration: 0.4 }}
              style={{
                background: "radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.6), rgba(99, 102, 241, 0.3), transparent 70%)",
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5 pointer-events-none" />

          <div className="card-scroll">
            <div className="px-6 pt-6 pb-3 text-center">
              <p className="text-xs text-gray-500 font-medium">
                {isPlaceholder ? "示例卡片 · 粘贴链接生成" : "← 左滑归档 · 右滑保留 →"}
              </p>
            </div>
            <div className="px-6 pt-3 pb-5">
              <h2 className="text-[20px] font-bold text-white leading-snug tracking-tight clamp-1">
                {card?.hook_title}
              </h2>
            </div>

            <div className="px-6 pb-5 space-y-3">
              {keyPoints.map((point, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5"
                  style={{
                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mt-0.5 shadow-lg shadow-purple-500/30">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <p className="flex-1 text-gray-200 leading-relaxed font-medium text-[13px] clamp-3">
                    {point}
                  </p>
                </div>
              ))}
            </div>

            <div
              className="mx-6 mb-6 p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 border border-amber-500/30 backdrop-blur-sm"
              style={{
                boxShadow: "0 8px 24px -8px rgba(251, 191, 36, 0.3), inset 0 1px 0 rgba(251, 191, 36, 0.1)",
              }}
            >
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-100 leading-relaxed italic font-semibold text-[13px] clamp-2">
                  {card?.golden_quote}
                </p>
              </div>
            </div>

            <div className="px-6 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-3">
              {isPlaceholder ? (
                <p className="text-xs text-gray-500 font-medium text-center">
                  粘贴链接生成你的第一张卡
                </p>
              ) : (
                <button
                  data-detail="1"
                  onClick={onCardClick}
                  className="w-full h-11 rounded-xl bg-white/5 text-gray-200 font-semibold border border-white/10 hover:bg-white/10 transition-colors"
                >
                  查看详情
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
      </motion.div>
    </div>
  );
}
