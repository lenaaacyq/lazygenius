import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Link as LinkIcon, Sparkles } from "lucide-react";

interface InputPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (url: string) => void;
}

export default function InputPanel({
  isOpen,
  onClose,
  onGenerate,
}: InputPanelProps) {
  const [url, setUrl] = useState("");

  const handleGenerate = () => {
    if (url.trim()) {
      onGenerate(url);
      setUrl("");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-t-3xl z-50 max-w-2xl mx-auto border-t border-white/10 backdrop-blur-xl"
            style={{
              boxShadow: '0 -20px 60px -12px rgba(0, 0, 0, 0.8), 0 -8px 24px -8px rgba(168, 85, 247, 0.2)'
            }}
          >
            <div className="px-6 pt-6 pb-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    添加新链接
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 transition-colors border border-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Input */}
              <div className="relative mb-6">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  placeholder="粘贴文章链接..."
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-black/40 backdrop-blur-xl border-2 border-white/10 focus:border-purple-500 focus:bg-black/60 outline-none transition-all text-white placeholder:text-gray-500 font-medium"
                  style={{
                    boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)'
                  }}
                  autoFocus
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 h-12 rounded-xl bg-white/5 text-gray-300 font-semibold hover:bg-white/10 transition-colors border border-white/10"
                  style={{
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                  }}
                >
                  取消
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!url.trim()}
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/50 transition-all border border-white/20"
                  style={{
                    boxShadow: '0 8px 24px -8px rgba(168, 85, 247, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  }}
                >
                  生成卡片
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}