import { motion } from "motion/react";
import { Link as LinkIcon, Zap } from "lucide-react";

export default function AddLinkButton({ onClick }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="w-full relative group"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 opacity-50 blur-2xl group-active:opacity-70 transition-opacity" />
      <div
        className="relative h-14 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-700 flex items-center justify-center gap-3 overflow-hidden border border-white/20"
        style={{
          boxShadow: "0 12px 32px -8px rgba(16, 185, 129, 0.45), inset 0 2px 0 rgba(255, 255, 255, 0.2), inset 0 -2px 0 rgba(0, 0, 0, 0.2)",
        }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ["-100%", "200%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <LinkIcon className="w-5 h-5 text-white relative z-10 drop-shadow-lg" />
        <span className="text-base font-bold text-white relative z-10 drop-shadow-lg tracking-tight">
          生成新卡片
        </span>
        <Zap className="w-4 h-4 text-yellow-300 relative z-10 drop-shadow-lg" />
      </div>
    </motion.button>
  );
}
