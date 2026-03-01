import { motion, useMotionValue, useTransform } from "motion/react";
import { Sparkles } from "lucide-react";

export default function CardView({
  card,
  onCardClick,
  onSwipeLeft,
  onSwipeRight,
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  
  // Enhanced darken effect for archive
  const saveGlowOpacity = useTransform(x, [0, 150], [0, 0.9]);
  const archiveOverlayOpacity = useTransform(x, [-150, 0], [0.85, 0]);

  const handleDragEnd = (_event, info) => {
    if (info.offset.x > 100) {
      // Right swipe - Save
      onSwipeRight();
    } else if (info.offset.x < -100) {
      // Left swipe - Archive
      onSwipeLeft();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-8 py-1">
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        style={{ 
          x, 
          rotate, 
          opacity,
          filter: useTransform(x, [-150, 0, 150], [
            "brightness(0.35) saturate(0.3) contrast(0.8)",
            "brightness(1) saturate(1) contrast(1)",
            "brightness(1.05) saturate(1.1) contrast(1)"
          ])
        }}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.98 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
        className="cursor-grab active:cursor-grabbing w-full max-w-md"
      >
        <div
          onClick={onCardClick}
          className="bg-gradient-to-br from-gray-800/90 via-gray-800/95 to-gray-900 rounded-3xl overflow-hidden border border-white/10 relative backdrop-blur-xl"
          style={{
            boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.8), 0 8px 24px -8px rgba(168, 85, 247, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Swipe indicators */}
          <motion.div
            className="absolute top-6 right-6 z-10"
            style={{
              opacity: useTransform(x, [0, 100], [0, 1]),
            }}
          >
            <div className="px-3 py-1.5 rounded-lg bg-green-500/20 border-2 border-green-500 backdrop-blur-sm shadow-lg shadow-green-500/50">
              <span className="text-green-400 font-bold text-sm">保留</span>
            </div>
          </motion.div>
          <motion.div
            className="absolute top-6 left-6 z-10"
            style={{
              opacity: useTransform(x, [-100, 0], [1, 0]),
            }}
          >
            <div className="px-3 py-1.5 rounded-lg bg-gray-500/20 border-2 border-gray-400 backdrop-blur-sm shadow-lg shadow-gray-500/50">
              <span className="text-gray-300 font-bold text-sm">归档</span>
            </div>
          </motion.div>

          {/* Glow overlay for save action */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-green-500/20 to-emerald-500/30 pointer-events-none rounded-3xl"
            style={{
              opacity: saveGlowOpacity,
            }}
          />

          {/* Darken overlay for archive action */}
          <motion.div 
            className="absolute inset-0 bg-black/50 pointer-events-none rounded-3xl"
            style={{
              opacity: archiveOverlayOpacity,
            }}
          />

          {/* Inner glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5 pointer-events-none" />

          {/* Title */}
          <div className="px-6 pt-7 pb-5">
            <h2 className="text-xl font-bold text-white leading-tight tracking-tight">
              {card.title}
            </h2>
          </div>

          {/* Key Points */}
          <div className="px-6 pb-5 space-y-3">
            {card.keyPoints.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5"
                style={{
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                }}
              >
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mt-0.5 shadow-lg shadow-purple-500/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
                <p className="flex-1 text-gray-200 leading-relaxed font-medium text-sm">{point}</p>
              </motion.div>
            ))}
          </div>

          {/* Quote */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mx-6 mb-6 p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 border border-amber-500/30 backdrop-blur-sm"
            style={{
              boxShadow: '0 8px 24px -8px rgba(251, 191, 36, 0.3), inset 0 1px 0 rgba(251, 191, 36, 0.1)'
            }}
          >
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-100 leading-relaxed italic font-semibold text-sm">
                {card.quote}
              </p>
            </div>
          </motion.div>

          {/* Click hint */}
          <div className="px-6 pb-5 text-center">
            <p className="text-xs text-gray-500 font-medium">点击查看详情</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
