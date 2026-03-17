import { motion } from "motion/react";
import BrandLogo from "./BrandLogo";

export default function Header({ mode, onModeChange }) {
  const modes = [
    { key: "mixed", label: "混合" },
    { key: "new", label: "新卡" },
    { key: "review", label: "复习" },
  ];

  return (
    <header className="px-6 pt-5 pb-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <BrandLogo size="md" />
          <h1 className="text-2xl font-bold tracking-tight text-white">
            LazyGenius
          </h1>
        </div>

        <div className="flex gap-2 bg-black/40 backdrop-blur-xl rounded-2xl p-1.5 border border-white/10 shadow-lg shadow-black/50">
          {modes.map((m) => (
            <button
              key={m.key}
              onClick={() => onModeChange(m.key)}
              className="relative flex-1 py-2 text-sm font-semibold transition-all rounded-xl"
            >
              {mode === m.key && (
                <motion.div
                  layoutId="mode-indicator"
                  className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 rounded-xl shadow-lg shadow-emerald-500/40"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  style={{
                    boxShadow: "0 8px 24px -4px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                  }}
                />
              )}
              <span
                className={`relative z-10 ${
                  mode === m.key ? "text-white" : "text-white/70"
                }`}
              >
                {m.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
