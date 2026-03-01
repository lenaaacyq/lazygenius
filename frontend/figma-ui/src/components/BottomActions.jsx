import { motion } from "motion/react";
import { Archive, Heart } from "lucide-react";

export default function BottomActions({ onSave, onArchive }) {
  return (
    <div className="px-8 pb-4 pt-4">
      {/* Swipe hint */}
      <div className="text-center mb-4">
        <p className="text-xs text-gray-500 font-medium">← 左滑归档 · 右滑保留 →</p>
      </div>
      
      <div className="flex gap-4 max-w-md mx-auto">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onArchive}
          className="flex-1 h-12 rounded-2xl bg-gray-800/90 backdrop-blur-xl text-gray-300 font-semibold flex items-center justify-center gap-2 active:bg-gray-700 transition-colors border border-white/10"
          style={{
            boxShadow: '0 8px 24px -8px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          <Archive className="w-4 h-4" />
          <span className="text-sm">归档</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onSave}
          className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-700 text-white font-semibold flex items-center justify-center gap-2 border border-white/20"
          style={{
            boxShadow: '0 12px 32px -8px rgba(168, 85, 247, 0.6), inset 0 2px 0 rgba(255, 255, 255, 0.2), inset 0 -2px 0 rgba(0, 0, 0, 0.2)'
          }}
        >
          <Heart className="w-4 h-4" />
          <span className="text-sm">保留</span>
        </motion.button>
      </div>
    </div>
  );
}
