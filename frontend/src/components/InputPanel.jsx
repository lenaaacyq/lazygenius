import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Link as LinkIcon, Sparkles, Github, Archive, ChevronRight, FileText, Image } from "lucide-react";
import { toast } from "sonner";

export default function InputPanel({
  isOpen,
  onClose,
  onGenerate,
  apiBase,
}) {
  const [step, setStep] = useState("select");
  const [selectedSourceId, setSelectedSourceId] = useState(null);
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const sources = useMemo(
    () => [
      {
        id: "github",
        type: "url",
        name: "GitHub",
        icon: Github,
        iconBg: "bg-gradient-to-br from-gray-700 to-gray-800",
        borderColor: "border-gray-500/30",
        hoverBg: "hover:bg-gradient-to-br hover:from-gray-500/10 hover:to-gray-600/10",
        iconColor: "text-white",
        description: "支持仓库、Issue、PR 等",
        placeholder: "粘贴 GitHub 链接...",
        helper: "支持链接：GitHub、Archive 等公开网页",
      },
      {
        id: "archive",
        type: "url",
        name: "Archive",
        icon: Archive,
        iconBg: "bg-gradient-to-br from-blue-500 to-cyan-600",
        borderColor: "border-blue-500/30",
        hoverBg: "hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-cyan-500/10",
        iconColor: "text-white",
        description: "支持一线前沿论文",
        placeholder: "粘贴 Archive 链接...",
        helper: "支持链接：GitHub、Archive 等公开网页",
      },
      {
        id: "text",
        type: "text",
        name: "长文本",
        icon: FileText,
        iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
        borderColor: "border-emerald-500/30",
        hoverBg: "hover:bg-gradient-to-br hover:from-emerald-500/10 hover:to-teal-500/10",
        iconColor: "text-white",
        description: "粘贴长文本生成卡片",
        placeholder: "粘贴或输入长文本...",
        helper: "适合长文章、会议纪要、学习笔记",
      },
      {
        id: "image",
        type: "image",
        name: "图片",
        icon: Image,
        iconBg: "bg-gradient-to-br from-amber-500 to-orange-500",
        borderColor: "border-amber-500/30",
        hoverBg: "hover:bg-gradient-to-br hover:from-amber-500/10 hover:to-orange-500/10",
        iconColor: "text-white",
        description: "上传图片提取信息",
        helper: "支持截图、海报、图文等图片内容",
      },
    ],
    []
  );

  const selectedSource = useMemo(
    () => sources.find((p) => p.id === selectedSourceId) || null,
    [sources, selectedSourceId]
  );

  useEffect(() => {
    if (!isOpen) return;
    setStep("select");
    setSelectedSourceId(null);
    setUrl("");
    setText("");
    setImageFile(null);
  }, [isOpen]);

  const handleSelectSource = (sourceId) => {
    const source = sources.find((p) => p.id === sourceId) || null;
    if (!source) {
      toast("暂不支持该类型");
      return;
    }
    setSelectedSourceId(sourceId);
    setStep("input");
  };

  const handleBackToSelect = () => {
    setStep("select");
    setSelectedSourceId(null);
    setUrl("");
    setText("");
    setImageFile(null);
  };

  const handleClose = () => {
    setStep("select");
    setSelectedSourceId(null);
    setUrl("");
    setText("");
    setImageFile(null);
    onClose();
  };

  const handleGenerate = () => {
    if (!selectedSource) return;
    if (selectedSource.type === "url" && url.trim()) {
      onGenerate({ type: "url", url: url.trim() });
      setUrl("");
      handleClose();
      return;
    }
    if (selectedSource.type === "text" && text.trim()) {
      onGenerate({ type: "text", text: text.trim() });
      setText("");
      handleClose();
      return;
    }
    if (selectedSource.type === "image" && imageFile) {
      onGenerate({ type: "image", file: imageFile });
      setImageFile(null);
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed md:absolute inset-0 bg-black/70 backdrop-blur-sm z-40"
          />

          {step === "select" ? (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed md:absolute bottom-0 left-0 right-0 bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-t-3xl z-50 max-w-2xl mx-auto border-t border-white/10 backdrop-blur-xl md:max-w-none"
              style={{
                boxShadow: "0 -20px 60px -12px rgba(0, 0, 0, 0.8), 0 -8px 24px -8px rgba(168, 85, 247, 0.2)",
              }}
            >
              <div className="px-6 pt-6 pb-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      选择内容类型
                    </h3>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 transition-colors border border-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {sources.map((source) => {
                    const Icon = source.icon;
                    return (
                      <motion.button
                        key={source.id}
                        onClick={() => handleSelectSource(source.id)}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border ${source.borderColor} ${source.hoverBg} transition-all bg-white/5`}
                        style={{
                          boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                        }}
                      >
                        <div className={`w-12 h-12 rounded-xl ${source.iconBg} flex items-center justify-center shadow-lg flex-shrink-0`}>
                          <Icon className={`w-6 h-6 ${source.iconColor}`} />
                        </div>
                        <div className="flex-1 text-left">
                          <h4 className="text-base font-bold text-white mb-1">
                            {source.name}
                          </h4>
                          <p className="text-xs text-gray-400">
                            {source.description}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      </motion.button>
                    );
                  })}
                </div>

                <div className="mt-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
                  <p className="text-xs text-purple-300 text-center">
                    选择类型后开始添加内容
                  </p>
                </div>
              </div>
            </motion.div>
          ) : null}

          {step === "input" && selectedSource ? (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed md:absolute bottom-0 left-0 right-0 bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-t-3xl z-50 max-w-2xl mx-auto border-t border-white/10 backdrop-blur-xl md:max-w-none"
              style={{
                boxShadow: "0 -20px 60px -12px rgba(0, 0, 0, 0.8), 0 -8px 24px -8px rgba(168, 85, 247, 0.2)",
              }}
            >
              <div className="px-6 pt-6 pb-8">
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={handleBackToSelect}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 transition-colors border border-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-2 flex-1">
                    <div className={`w-10 h-10 rounded-xl ${selectedSource.iconBg} flex items-center justify-center`}>
                      <selectedSource.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {selectedSource.name}
                    </h3>
                  </div>
                </div>

                {selectedSource.type === "url" ? (
                  <div className="relative mb-2">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      <LinkIcon className="w-5 h-5" />
                    </div>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                      placeholder={selectedSource.placeholder}
                      className="w-full h-14 pl-12 pr-4 rounded-2xl bg-black/40 backdrop-blur-xl border-2 border-white/10 focus:border-purple-500 focus:bg-black/60 outline-none transition-all text-white placeholder:text-gray-500 font-medium"
                      style={{
                        boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.3)",
                      }}
                      autoFocus
                    />
                  </div>
                ) : null}

                {selectedSource.type === "text" ? (
                  <div className="mb-2">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder={selectedSource.placeholder}
                      rows={6}
                      className="w-full rounded-2xl bg-black/40 backdrop-blur-xl border-2 border-white/10 focus:border-purple-500 focus:bg-black/60 outline-none transition-all text-white placeholder:text-gray-500 font-medium p-4 resize-none"
                      autoFocus
                    />
                  </div>
                ) : null}

                {selectedSource.type === "image" ? (
                  <div className="mb-2">
                    <label className="w-full h-32 rounded-2xl border-2 border-dashed border-white/15 bg-black/30 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-purple-500/50 hover:text-gray-200 transition-colors cursor-pointer">
                      <Image className="w-6 h-6" />
                      <span className="text-sm font-medium">{imageFile ? imageFile.name : "点击选择图片"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : null}

                <p className="mb-6 text-xs text-gray-500">
                  {selectedSource.helper}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={handleBackToSelect}
                    className="flex-1 h-12 rounded-xl bg-white/5 text-gray-300 font-semibold hover:bg-white/10 transition-colors border border-white/10"
                    style={{
                      boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    返回
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={
                      (selectedSource.type === "url" && !url.trim())
                      || (selectedSource.type === "text" && !text.trim())
                      || (selectedSource.type === "image" && !imageFile)
                    }
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/50 transition-all border border-white/20"
                    style={{
                      boxShadow: "0 8px 24px -8px rgba(168, 85, 247, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    生成卡片
                  </button>
                </div>
              </div>
            </motion.div>
          ) : null}
        </>
      )}
    </AnimatePresence>
  );
}
