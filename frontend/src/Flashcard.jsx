import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import Header from "./components/Header";
import CardView from "./components/CardView";
import InputPanel from "./components/InputPanel";
import LoadingState from "./components/LoadingState";
import AddLinkButton from "./components/AddLinkButton";
import CardDetail from "./components/CardDetail";
import BottomActions from "./components/BottomActions";

const API_BASE = import.meta.env.VITE_API_BASE || (typeof window !== "undefined" && window.location.hostname !== "localhost"
  ? `http://${window.location.hostname}:8000`
  : "http://localhost:8000");
const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY;

export default function Flashcard() {
  const [mode, setMode] = useState("mixed");
  const [card, setCard] = useState(null);
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState({ type: "home" });
  const [error, setError] = useState(false);
  const [enterFrom, setEnterFrom] = useState(null);
  const isPlaceholder = card?.status === "placeholder";

  const resolveStrategy = (value) => {
    if (value === "new") return "new";
    if (value === "review") return "review";
    return "hybrid";
  };

  const fetchWithTimeout = useCallback(async (input, options = {}, timeoutMs = 15000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const isAdminPath = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");
      const headers = {
        ...(options.headers || {}),
        ...(isAdminPath && ADMIN_KEY ? { "x-admin-key": ADMIN_KEY } : {}),
      };
      return await fetch(input, { ...options, headers, signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
  }, []);

  const fetchCard = useCallback(async (nextMode = mode) => {
    setError(false);
    try {
      const strategy = resolveStrategy(nextMode);
      const res = await fetchWithTimeout(`${API_BASE}/cards/next?strategy=${strategy}`);
      if (!res.ok) {
        setCard(null);
        if (res.status !== 404) setError(true);
        return;
      }
      const data = await res.json();
      setCard(data);
    } catch (e) {
      console.error("Failed to fetch card:", e);
      setCard(null);
      setError(true);
    }
  }, [fetchWithTimeout, mode]);

  useEffect(() => {
    fetchCard(mode);
  }, [mode, fetchCard]);

  useEffect(() => {
    if (card) {
      setEnterFrom(null);
    }
  }, [card?.id]);

  const navigate = (path) => {
    if (path === "/") {
      setCurrentView({ type: "home" });
    } else if (path === "/detail") {
      setCurrentView({ type: "detail" });
    }
  };

  const handleSave = async () => {
    if (!card || isPlaceholder) {
      toast("示例卡片不可操作，请先生成内容");
      return;
    }
    setEnterFrom("left");
    try {
      const isAdminPath = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");
      await fetch(`${API_BASE}/cards/${card.id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(isAdminPath && ADMIN_KEY ? { "x-admin-key": ADMIN_KEY } : {}),
        },
        body: JSON.stringify({ action: "keep" }),
      });
      toast.success("已保留");
    } catch (e) {
      console.error("Failed to submit review:", e);
      toast.error("保留失败，请重试");
    }
    setTimeout(() => {
      fetchCard(mode);
    }, 400);
  };

  const handleArchive = async () => {
    if (!card || isPlaceholder) {
      toast("示例卡片不可操作，请先生成内容");
      return;
    }
    setEnterFrom("right");
    try {
      const isAdminPath = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");
      await fetch(`${API_BASE}/cards/${card.id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(isAdminPath && ADMIN_KEY ? { "x-admin-key": ADMIN_KEY } : {}),
        },
        body: JSON.stringify({ action: "archive" }),
      });
      toast("已归档");
    } catch (e) {
      console.error("Failed to submit review:", e);
      toast.error("归档失败，请重试");
    }
    setTimeout(() => {
      fetchCard(mode);
    }, 400);
  };

  const handleGenerate = async (payload) => {
    setIsInputOpen(false);
    setIsLoading(true);
    try {
      if (typeof payload === "string") {
        payload = { type: "url", url: payload };
      }
      if (payload?.type === "image" && payload.file) {
        const formData = new FormData();
        formData.append("file", payload.file);
        const res = await fetchWithTimeout(`${API_BASE}/cards/generate-image`, {
          method: "POST",
          body: formData,
        }, 60000);
        if (!res.ok) {
          throw new Error("Failed to generate");
        }
        const data = await res.json();
        setCard(data);
        setCurrentView({ type: "home" });
        toast.success("✨ 卡片生成成功！");
        return;
      }
      const body = payload?.type === "text"
        ? { text: payload.text }
        : { url: payload?.url || "" };
      const res = await fetchWithTimeout(`${API_BASE}/cards/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }, 60000);
      if (!res.ok) {
        throw new Error("Failed to generate");
      }
      const data = await res.json();
      setCard(data);
      setCurrentView({ type: "home" });
      toast.success("✨ 卡片生成成功！");
    } catch (e) {
      console.error("Failed to generate:", e);
      toast.error("生成失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
          />
        </div>
        <div className="fixed top-0 left-0 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>
      <div className="fixed top-0 left-0 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {currentView.type === "home" ? (
          <div className="min-h-screen pb-8">
            <Header mode={mode} onModeChange={setMode} />

            <div className="px-8 mb-4">
              <div className="max-w-md mx-auto">
                <AddLinkButton onClick={() => setIsInputOpen(true)} />
              </div>
            </div>

            {card ? (
              <>
                <CardView
                  key={card.id}
                  card={card}
                  enterFrom={enterFrom}
                  isPlaceholder={isPlaceholder}
                  onCardClick={() => {
                    if (isPlaceholder) {
                      toast("示例卡片不可查看详情，请先生成内容");
                      return;
                    }
                    navigate("/detail");
                  }}
                  onSwipeLeft={handleArchive}
                  onSwipeRight={handleSave}
                />
                <div className="hidden md:block">
                  <BottomActions onSave={handleSave} onArchive={handleArchive} />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
                <p className="text-lg text-gray-400 mb-2 font-medium">
                  {error ? "加载失败，请重试" : "没有更多卡片了"}
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  {error ? "网络或服务暂时不可用" : "粘贴链接即可生成新卡片"}
                </p>
                <button
                  onClick={() => fetchCard(mode)}
                  className="px-6 py-3 rounded-xl bg-white/5 text-gray-200 font-semibold border border-white/10 hover:bg-white/10 transition-colors"
                >
                  刷新
                </button>
              </div>
            )}
          </div>
        ) : (
          <CardDetail card={card} onBack={() => navigate("/")} />
        )}
      </div>

            <InputPanel
        isOpen={isInputOpen}
        onClose={() => setIsInputOpen(false)}
        onGenerate={handleGenerate}
              apiBase={API_BASE}
      />
    </div>
  );
}
