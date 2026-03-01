import { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";
import Header from "./components/Header";
import CardView from "./components/CardView";
import BottomActions from "./components/BottomActions";
import InputPanel from "./components/InputPanel";
import LoadingState from "./components/LoadingState";
import AddLinkButton from "./components/AddLinkButton";
import SwipeHint from "./components/SwipeHint";
import CardDetail from "./components/CardDetail";
import { mockCards } from "./data/mockCards";

export default function Flashcard() {
  const [mode, setMode] = useState("mixed");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cards, setCards] = useState(mockCards);
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [currentView, setCurrentView] = useState({ type: "home" });

  useEffect(() => {
    // Show onboarding toast on first load
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding) {
      setTimeout(() => {
        toast.info("💡 小提示：左滑归档，右滑保留", {
          duration: 4000,
        });
        localStorage.setItem("hasSeenOnboarding", "true");
      }, 1000);
      
      // Hide the hint after a while
      setTimeout(() => {
        setShowOnboarding(false);
      }, 6000);
    } else {
      setShowOnboarding(false);
    }
  }, []);

  const navigate = (path) => {
    if (path === "/") {
      setCurrentView({ type: "home" });
    } else if (path.startsWith("/card/")) {
      const id = path.split("/card/")[1];
      setCurrentView({ type: "detail", id });
    }
  };

  const goBack = () => {
    setCurrentView({ type: "home" });
  };

  const filteredCards = cards.filter((card) => {
    if (mode === "new") return card.status === "new";
    if (mode === "review") return card.status === "saved";
    return true;
  });

  const currentCard = filteredCards[currentCardIndex];

  const handleSave = () => {
    if (!currentCard) return;

    const updatedCards = cards.map((c) =>
      c.id === currentCard.id ? { ...c, status: "saved" } : c
    );
    setCards(updatedCards);
    
    // Delay to show animation before switching card
    setTimeout(() => {
      nextCard();
    }, 400);
  };

  const handleArchive = () => {
    if (!currentCard) return;

    const updatedCards = cards.map((c) =>
      c.id === currentCard.id ? { ...c, status: "archived" } : c
    );
    setCards(updatedCards);
    
    // Delay to show animation before switching card
    setTimeout(() => {
      nextCard();
    }, 400);
  };

  const nextCard = () => {
    if (currentCardIndex < filteredCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setCurrentCardIndex(0);
    }
  };

  const handleGenerate = (url) => {
    setIsInputOpen(false);
    setIsLoading(true);

    // Simulate card generation
    setTimeout(() => {
      const newCard = {
        id: `${Date.now()}`,
        title: "新生成的知识卡片",
        keyPoints: [
          "这是从链接中提取的第一个要点",
          "AI 正在学习理解内容的精髓",
          "未来会有更准确的内容提取",
        ],
        quote: "每一次学习都是对未来的投资",
        excerpt: "这是从原文中提取的核心段落...",
        sourceUrl: url,
        status: "new",
        createdAt: new Date(),
      };

      setCards([newCard, ...cards]);
      setCurrentCardIndex(0);
      setIsLoading(false);
      toast.success("✨ 卡片生成成功！");
    }, 2500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 relative overflow-hidden">
        {/* Memory Palace Grid Pattern */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `
                linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px'
            }}
          />
        </div>
        
        {/* Subtle corner glow */}
        <div className="fixed top-0 left-0 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
        
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Memory Palace Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `
              linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
      </div>
      
      {/* Subtle corner glow */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10">
        {currentView.type === "home" ? (
          <div className="min-h-screen pb-8">
            <Header mode={mode} onModeChange={setMode} />

            {/* Add Link Button - Primary CTA */}
            <div className="px-8 mb-4">
              <div className="max-w-md mx-auto">
                <AddLinkButton onClick={() => setIsInputOpen(true)} />
              </div>
            </div>

            {/* Swipe Hint */}
            {showOnboarding && currentCard && <SwipeHint />}

            {currentCard ? (
              <>
                <CardView
                  card={currentCard}
                  onCardClick={() => navigate(`/card/${currentCard.id}`)}
                  onSwipeLeft={handleArchive}
                  onSwipeRight={handleSave}
                />
                <BottomActions onSave={handleSave} onArchive={handleArchive} />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
                <p className="text-lg text-gray-400 mb-2 font-medium">没有更多卡片了</p>
                <p className="text-sm text-gray-600">添加新链接继续学习</p>
              </div>
            )}

            <InputPanel
              isOpen={isInputOpen}
              onClose={() => setIsInputOpen(false)}
              onGenerate={handleGenerate}
            />
          </div>
        ) : (
          <CardDetail cardId={currentView.id} onBack={goBack} />
        )}
      </div>
      <Toaster position="top-center" richColors />
    </div>
  );
}
