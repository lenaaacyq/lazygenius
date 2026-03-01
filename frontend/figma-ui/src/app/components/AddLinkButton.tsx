import { motion } from "motion/react";
import { Link as LinkIcon, Zap } from "lucide-react";

interface AddLinkButtonProps {
  onClick: () => void;
}

export default function AddLinkButton({ onClick }: AddLinkButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="w-full relative group"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 opacity-50 blur-2xl group-active:opacity-70 transition-opacity" />
      
      {/* Button */}
      <div 
        className="relative h-14 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-700 flex items-center justify-center gap-3 overflow-hidden border border-white/20"
        style={{
          boxShadow: '0 12px 32px -8px rgba(168, 85, 247, 0.6), inset 0 2px 0 rgba(255, 255, 255, 0.2), inset 0 -2px 0 rgba(0, 0, 0, 0.2)'
        }}
      >
        {/* Animated background */}
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
          添加新链接
        </span>
        <Zap className="w-4 h-4 text-yellow-300 relative z-10 drop-shadow-lg" />
      </div>
    </motion.button>
  );
}