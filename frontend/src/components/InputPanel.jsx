import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Link as LinkIcon, Sparkles } from "lucide-react";

export default function InputPanel({
  isOpen,
  onClose,
  onGenerate,
  apiBase,
}) {
  const [url, setUrl] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginImage, setLoginImage] = useState("");
  const [loginReady, setLoginReady] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const stored = localStorage.getItem("xhs_login_session") || "";
    setSessionId(stored);
    setLoginReady(false);
    setLoginError("");
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
      if (ready) {
        setLoginOpen(false);
      }
    } catch (e) {
      setLoginError("获取二维码失败，请重试");
    }
  }, [apiBase]);

  useEffect(() => {
    if (!isOpen || !sessionId) return;
    fetchStatus(sessionId);
  }, [isOpen, sessionId, fetchStatus]);

  useEffect(() => {
    if (!loginOpen || !sessionId) return;
    fetchStatus(sessionId);
    const timer = setInterval(() => fetchStatus(sessionId), 3000);
    return () => clearInterval(timer);
  }, [loginOpen, sessionId, fetchStatus]);

  const startLogin = async () => {
    if (isStarting) return;
    setIsStarting(true);
    setLoginError("");
    try {
      const res = await fetch(`${apiBase}/auth/xhs/start`, { method: "POST" });
      if (!res.ok) {
        throw new Error("start_failed");
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
      setLoginOpen(true);
      await fetchStatus(nextSessionId);
    } catch (e) {
      setLoginError("启动登录失败，请稍后重试");
    } finally {
      setIsStarting(false);
    }
  };

  const handleGenerate = () => {
    if (url.trim()) {
      onGenerate(url, sessionId);
      setUrl("");
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
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />

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
                    boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.3)",
                  }}
                  autoFocus
                />
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-300 font-semibold">小红书扫码登录</p>
                    <p className="text-xs text-gray-500">
                      {loginReady ? "已登录，可直接生成" : sessionId ? "等待扫码确认" : "未登录"}
                    </p>
                  </div>
                  <button
                    onClick={startLogin}
                    className="h-9 px-4 rounded-xl bg-white/5 text-gray-200 font-semibold hover:bg-white/10 transition-colors border border-white/10 disabled:opacity-50"
                    disabled={isStarting}
                  >
                    {isStarting ? "启动中..." : "打开扫码"}
                  </button>
                </div>
                {loginError ? (
                  <div className="text-xs text-rose-400 mb-3">{loginError}</div>
                ) : null}
                {loginOpen ? (
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-gray-300">请使用小红书扫码登录</p>
                      <button
                        onClick={() => setLoginOpen(false)}
                        className="text-xs text-gray-400 hover:text-gray-200"
                      >
                        收起
                      </button>
                    </div>
                    <div className="rounded-xl bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center min-h-[220px]">
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
                    <div className="mt-3 flex gap-3">
                      <button
                        onClick={() => fetchStatus(sessionId)}
                        className="flex-1 h-10 rounded-xl bg-white/5 text-gray-300 font-semibold hover:bg-white/10 transition-colors border border-white/10"
                      >
                        刷新二维码
                      </button>
                      <button
                        onClick={startLogin}
                        className="flex-1 h-10 rounded-xl bg-white/5 text-gray-300 font-semibold hover:bg-white/10 transition-colors border border-white/10"
                      >
                        重新开启
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 h-12 rounded-xl bg-white/5 text-gray-300 font-semibold hover:bg-white/10 transition-colors border border-white/10"
                  style={{
                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                  }}
                >
                  取消
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
        </>
      )}
    </AnimatePresence>
  );
}
