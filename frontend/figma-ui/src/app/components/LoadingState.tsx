import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Circle } from "lucide-react";
import { encouragingMessages } from "../data/mockCards";

export default function LoadingState() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % encouragingMessages.length);
    }, 2000);
    
    const stageInterval = setInterval(() => {
      setStage((prev) => (prev + 1) % 4);
    }, 800);
    
    return () => {
      clearInterval(messageInterval);
      clearInterval(stageInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      {/* Stage label - moved to top */}
      <motion.div
        key={`stage-${stage}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
          <p className="text-sm text-purple-400 font-bold tracking-wide">
            {stage === 0 && "构建标题..."}
            {stage === 1 && "提取要点..."}
            {stage === 2 && "生成金句..."}
            {stage === 3 && "组装卡片..."}
          </p>
        </div>
      </motion.div>

      {/* Building animation - now centered and larger */}
      <div className="relative w-[340px] h-[440px] mb-12">
        {/* Card frame being built */}
        <motion.div
          className="absolute inset-8 rounded-3xl border-2 border-purple-500/40"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            boxShadow: '0 0 40px rgba(168, 85, 247, 0.3)'
          }}
        />

        {/* Title block */}
        <motion.div
          className="absolute top-12 left-12 right-12 h-16"
          initial={{ opacity: 0, y: -50, scale: 0.5 }}
          animate={{ 
            opacity: stage >= 0 ? 1 : 0,
            y: stage >= 0 ? 0 : -50,
            scale: stage >= 0 ? 1 : 0.5,
          }}
          transition={{ type: "spring", damping: 12, stiffness: 200 }}
        >
          <div 
            className="w-full h-full rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/50 flex items-center justify-center backdrop-blur-sm"
            style={{
              boxShadow: '0 4px 16px rgba(168, 85, 247, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="flex gap-2">
              <motion.div
                className="w-3 h-3 rounded-full bg-purple-400"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <motion.div
                className="w-16 h-3 rounded-full bg-purple-400/60"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.1 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Key points blocks */}
        {[0, 1, 2].map((index) => (
          <motion.div
            key={`point-${index}`}
            className="absolute left-12 right-12 h-10"
            style={{ top: 100 + index * 52 }}
            initial={{ opacity: 0, x: -100, scale: 0.5 }}
            animate={{
              opacity: stage >= 1 ? 1 : 0,
              x: stage >= 1 ? 0 : -100,
              scale: stage >= 1 ? 1 : 0.5,
            }}
            transition={{
              type: "spring",
              damping: 12,
              stiffness: 200,
              delay: index * 0.1,
            }}
          >
            <div 
              className="flex items-center gap-3 h-full px-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
              style={{
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
              }}
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                <Circle className="w-3 h-3 text-white fill-white" />
              </div>
              <div className="flex-1 h-2 rounded-full bg-blue-400/40" />
            </div>
          </motion.div>
        ))}

        {/* Quote block */}
        <motion.div
          className="absolute bottom-12 left-12 right-12 h-20"
          initial={{ opacity: 0, y: 50, scale: 0.5 }}
          animate={{
            opacity: stage >= 2 ? 1 : 0,
            y: stage >= 2 ? 0 : 50,
            scale: stage >= 2 ? 1 : 0.5,
          }}
          transition={{ type: "spring", damping: 12, stiffness: 200 }}
        >
          <div 
            className="w-full h-full rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/50 flex items-center justify-center gap-2 backdrop-blur-sm"
            style={{
              boxShadow: '0 4px 16px rgba(251, 191, 36, 0.3), inset 0 1px 0 rgba(251, 191, 36, 0.1)'
            }}
          >
            <Sparkles className="w-5 h-5 text-amber-400" />
            <motion.div
              className="w-32 h-2 rounded-full bg-amber-400/60"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>

        {/* Assembly particles */}
        <AnimatePresence mode="wait">
          {stage === 3 && (
            <>
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={`assembly-particle-${i}`}
                  className="absolute w-1.5 h-1.5 rounded-full bg-purple-400"
                  style={{
                    left: "50%",
                    top: "50%",
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: Math.cos((i * Math.PI * 2) / 12) * 100,
                    y: Math.sin((i * Math.PI * 2) / 12) * 100,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.05,
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Center glow */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-48 h-48 rounded-full bg-purple-500/20 blur-3xl" />
        </motion.div>

        {/* Connecting lines */}
        {stage >= 2 && (
          <>
            <motion.svg
              className="absolute inset-0 w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ duration: 0.5 }}
            >
              <motion.line
                x1="50%"
                y1="25%"
                x2="50%"
                y2="75%"
                stroke="url(#gradient)"
                strokeWidth="2"
                strokeDasharray="4 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.5" />
                </linearGradient>
              </defs>
            </motion.svg>
          </>
        )}
      </div>

      {/* Progress bar - positioned below the animation */}
      <div className="w-80 h-1.5 bg-white/10 rounded-full overflow-hidden mb-6">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-indigo-600"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{
            duration: 2.5,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Message - moved to bottom as secondary info */}
      <motion.div
        key={`message-${messageIndex}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <p className="text-sm text-gray-400 font-medium">
          {encouragingMessages[messageIndex]}
        </p>
      </motion.div>
    </div>
  );
}