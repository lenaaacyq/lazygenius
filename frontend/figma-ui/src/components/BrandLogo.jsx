import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

export default function BrandLogo({ size = "md" }) {
  const sizes = {
    sm: { container: "w-8 h-8", sparkle: "w-4 h-4" },
    md: { container: "w-10 h-10", sparkle: "w-5 h-5" },
    lg: { container: "w-12 h-12", sparkle: "w-6 h-6" },
  };

  return (
    <div className={`${sizes[size].container} relative`}>
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <div className="absolute inset-0.5 rounded-2xl bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <Sparkles className={`${sizes[size].sparkle} text-purple-400`} />
      </div>
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-purple-500/30 blur-xl"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
