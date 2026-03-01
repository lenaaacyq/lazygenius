import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function SwipeHint() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="flex items-center justify-center gap-8 py-4"
    >
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ x: [-5, 0, -5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronLeft className="w-5 h-5 text-gray-500" />
        </motion.div>
        <span className="text-sm text-gray-500">左滑归档</span>
      </div>

      <div className="w-px h-4 bg-gray-700" />

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">右滑保留</span>
        <motion.div
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronRight className="w-5 h-5 text-gray-500" />
        </motion.div>
      </div>
    </motion.div>
  );
}
