import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Link as LinkIcon, Sparkles, QrCode, Github, Archive, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function InputPanel({
  isOpen,
  onClose,
  onGenerate,
  apiBase,
}) {
  const [step, setStep] = useState("select");
  const [selectedPlatformId, setSelectedPlatformId] = useState(null);
  const [url, setUrl] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginImage, setLoginImage] = useState("");
  const [loginReady, setLoginReady] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [sessionId, setSessionId] = useState("");

  const platforms = useMemo(
    () => [
      {
        id: "github",
        name: "GitHub",
        icon: Github,
        iconBg: "bg-gradient-to-br from-gray-700 to-gray-800",
        borderColor: "border-gray-500/30",
        hoverBg: "hover:bg-gradient-to-br hover:from-gray-500/10 hover:to-gray-600/10",
        iconColor: "text-white",
        description: "支持仓库、Issue、PR 等",
        placeholder: "粘贴 GitHub 链接...",
        needQR: false,
      },
      {
        id: "archive",
        name: "Archive",
        icon: Archive,
        iconBg: "bg-gradient-to-br from-blue-500 to-cyan-600",
        borderColor: "border-blue-500/30",
        hoverBg: "hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-cyan-500/10",
        iconColor: "text-white",
        description: "支持一线前沿论文",
        placeholder: "粘贴 Archive 链接...",
        needQR: false,
      },
      {
        id: "xiaohongshu",
        name: "小红书",
        icon: QrCode,
        iconBg: "bg-gradient-to-br from-red-500 to-pink-600",
        borderColor: "border-white/10",
        hoverBg: "hover:bg-white/5",
        iconColor: "text-white",
        description: "未上线，敬请期待～",
        placeholder: "粘贴小红书链接...",
        needQR: true,
        enabled: false,
      },
    ],
    []
  );

  const selectedPlatform = useMemo(
    () => platforms.find((p) => p.id === selectedPlatformId) || null,
    [platforms, selectedPlatformId]
  );

  useEffect(() => {
    if (!isOpen) return;
    const stored = localStorage.getItem("xhs_login_session") || "";
    setSessionId(stored);
    setLoginReady(false);
    setLoginError("");
    setLoginImage("");
    setIsStarting(false);
    setStep("select");
    setSelectedPlatformId(null);
    setUrl("");
  }, [isOpen]);

  const fetchStatus = useCallback(async (currentSessionId) => {
    if (!currentSessionId) return;
    try {
      const res = await fetch(`${apiBase}/auth/xhs/status?session_id=${currentSessionId}`);
      if (!res.ok) {
        throw new Error("status_failed");
      }
      const data = await res.json();
      setLoginImage(data.screenshot_base64 || "");
      const ready = Boolean(data.logged_in);
      setLoginReady(ready);
    } catch (e) {
      setLoginError("获取二维码失败，请重试");
    }
  }, [apiBase]);

  useEffect(() => {
    if (!isOpen || !sessionId) return;
    fetchStatus(sessionId);
  }, [isOpen, sessionId, fetchStatus]);

  useEffect(() => {
    if (!isOpen || step !== "qrcode" || selectedPlatformId !== "xiaohongshu" || !sessionId) return;
    const timer = setInterval(() => fetchStatus(sessionId), 3000);
    return () => clearInterval(timer);
  }, [isOpen, step, selectedPlatformId, sessionId, fetchStatus]);

  const startLogin = async () => {
    if (isStarting) return;
    setIsStarting(true);
    setLoginError("");
    try {
      const res = await fetch(`${apiBase}/auth/xhs/start`, { method: "POST" });
      if (!res.ok) {
        let detail = "";
        try {
          const data = await res.json();
          detail = data?.detail || "";
        } catch (err) {
          detail = "";
        }
        throw new Error(detail || "start_failed");
      }
      const data = await res.json();
      const nextSessionId = data.session_id || "";
      if (!nextSessionId) {
        throw new Error("missing_session");
      }
      localStorage.setItem("xhs_login_session", nextSessionId);
      setSessionId(nextSessionId);
      setLoginReady(false);
      setLoginImage("");
      await fetchStatus(nextSessionId);
    } catch (e) {
      const message = e instanceof Error ? e.message : "";
      setLoginError(message === "服务繁忙，请稍后再试" ? message : "启动登录失败，请稍后重试");
    } finally {
      setIsStarting(false);
    }
  };

  const closeLogin = async () => {
    if (!sessionId) return;
    try {
      await fetch(`${apiBase}/auth/xhs/close?session_id=${sessionId}`, { method: "POST" });
    } catch (e) {
    } finally {
      localStorage.removeItem("xhs_login_session");
      setSessionId("");
      setLoginReady(false);
      setLoginImage("");
      setLoginError("");
    }
  };

  const handleSelectPlatform = async (platformId) => {
    const platform = platforms.find((p) => p.id === platformId) || null;
    if (platform && platform.enabled === false) {
      toast("未上线，敬请期待～");
      return;
    }
    setSelectedPlatformId(platformId);
    setLoginError("");
    if (platformId === "xiaohongshu") {
      setStep("qrcode");
      if (sessionId) {
        await fetchStatus(sessionId);
      }
      return;
    }
    setStep("input");
  };

  const handleBackToSelect = () => {
    setStep("select");
    setSelectedPlatformId(null);
    setUrl("");
    setLoginError("");
  };

  const handleClose = () => {
    setStep("select");
    setSelectedPlatformId(null);
    setUrl("");
    setLoginError("");
    onClose();
  };

  const handleGenerate = () => {
    if (url.trim()) {
      onGenerate(url, sessionId);
      setUrl("");
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />

          {step === "select" ? (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-t-3xl z-50 max-w-2xl mx-auto border-t border-white/10 backdrop-blur-xl"
              style={{
                boxShadow: "0 -20px 60px -12px rgba(0, 0, 0, 0.8), 0 -8px 24px -8px rgba(168, 85, 247, 0.2)",
              }}
            >
              <div className="px-6 pt-6 pb-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      选择平台
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
                  {platforms.map((platform) => {
                    const Icon = platform.icon;
                    const disabled = platform.enabled === false;
                    return (
                      <motion.button
                        key={platform.id}
                        onClick={() => handleSelectPlatform(platform.id)}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border ${platform.borderColor} ${platform.hoverBg} transition-all bg-white/5 ${disabled ? "opacity-60" : ""}`}
                        style={{
                          boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                        }}
                      >
                        <div className={`w-12 h-12 rounded-xl ${platform.iconBg} flex items-center justify-center shadow-lg flex-shrink-0`}>
                          <Icon className={`w-6 h-6 ${platform.iconColor}`} />
                        </div>
                        <div className="flex-1 text-left">
                          <h4 className="text-base font-bold text-white mb-1">
                            {platform.name}
                          </h4>
                          <p className="text-xs text-gray-400">
                            {platform.description}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      </motion.button>
                    );
                  })}
                </div>

                <div className="mt-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
                  <p className="text-xs text-purple-300 text-center">
                    点击上方平台开始添加内容
                  </p>
                </div>
              </div>
            </motion.div>
          ) : null}

          {step === "input" && selectedPlatform ? (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-t-3xl z-50 max-w-2xl mx-auto border-t border-white/10 backdrop-blur-xl"
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
                    <div className={`w-10 h-10 rounded-xl ${selectedPlatform.iconBg} flex items-center justify-center`}>
                      <selectedPlatform.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {selectedPlatform.name}
                    </h3>
                  </div>
                </div>

                <div className="relative mb-2">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    <LinkIcon className="w-5 h-5" />
                  </div>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                    placeholder={selectedPlatform.placeholder}
                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-black/40 backdrop-blur-xl border-2 border-white/10 focus:border-purple-500 focus:bg-black/60 outline-none transition-all text-white placeholder:text-gray-500 font-medium"
                    style={{
                      boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.3)",
                    }}
                    autoFocus
                  />
                </div>
                <p className="mb-6 text-xs text-gray-500">
                  支持链接：小红书（需扫码）、GitHub、Archive（前沿论文）等公开网页
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
                    disabled={!url.trim()}
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

          <AnimatePresence>
            {step === "qrcode" && selectedPlatformId === "xiaohongshu" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 flex items-center justify-center z-[60] px-6"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/80 backdrop-blur-md"
                  onClick={handleBackToSelect}
                />

                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                  className="relative bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-3xl p-8 max-w-sm w-full border border-white/10 shadow-2xl"
                  style={{
                    boxShadow: "0 20px 60px -12px rgba(0, 0, 0, 0.8), 0 8px 24px -8px rgba(239, 68, 68, 0.3)",
                  }}
                >
                  <button
                    onClick={handleBackToSelect}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                      <QrCode className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">小红书扫码</h3>
                      <p className="text-xs text-gray-400">
                        {loginReady ? "已登录，可继续添加链接" : sessionId ? "等待扫码确认" : "未登录"}
                      </p>
                    </div>
                  </div>

                  {loginError ? (
                    <div className="text-xs text-rose-400 mb-3">{loginError}</div>
                  ) : null}

                  <div className="mb-6 p-4 rounded-2xl bg-black/30 border border-white/10 overflow-hidden flex items-center justify-center min-h-[220px]">
                    {loginImage ? (
                      <img
                        src={`data:image/jpeg;base64,${loginImage}`}
                        alt="小红书扫码登录"
                        className="w-full h-auto"
                      />
                    ) : (
                      <div className="text-xs text-gray-500">二维码加载中...</div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    {loginReady ? (
                      <>
                        <button
                          onClick={handleBackToSelect}
                          className="flex-1 h-11 rounded-xl bg-white/5 text-gray-300 font-semibold hover:bg-white/10 transition-colors border border-white/10 text-sm"
                        >
                          返回
                        </button>
                        <button
                          onClick={() => setStep("input")}
                          className="flex-1 h-11 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all border border-white/20 text-sm"
                          style={{
                            boxShadow: "0 8px 24px -8px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                          }}
                        >
                          继续添加链接
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleBackToSelect}
                          className="flex-1 h-11 rounded-xl bg-white/5 text-gray-300 font-semibold hover:bg-white/10 transition-colors border border-white/10 text-sm"
                        >
                          返回
                        </button>
                        <button
                          onClick={sessionId ? () => fetchStatus(sessionId) : startLogin}
                          disabled={isStarting}
                          className="flex-1 h-11 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-red-500/50 transition-all border border-white/20 text-sm"
                          style={{
                            boxShadow: "0 8px 24px -8px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                          }}
                        >
                          {isStarting ? "启动中..." : sessionId ? "刷新二维码" : "打开扫码"}
                        </button>
                      </>
                    )}
                  </div>
                  {!loginReady && sessionId ? (
                    <button
                      onClick={closeLogin}
                      className="mt-3 w-full h-10 rounded-xl bg-white/5 text-gray-300 font-semibold hover:bg-white/10 transition-colors border border-white/10 text-sm"
                    >
                      关闭本次扫码
                    </button>
                  ) : null}
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
