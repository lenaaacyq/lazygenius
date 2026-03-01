import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import Header from "../components/Header";
import CardView from "../components/CardView";
import BottomActions from "../components/BottomActions";
import InputPanel from "../components/InputPanel";
import LoadingState from "../components/LoadingState";
import AddLinkButton from "../components/AddLinkButton";
import SwipeHint from "../components/SwipeHint";
import { mockCards, Card } from "../data/mockCards";

interface HomeProps {
  onNavigate: (path: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const [mode, setMode] = useState<"mixed" | "new" | "review">("mixed");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cards, setCards] = useState<Card[]>(mockCards);
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);

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

  const filteredCards = cards.filter((card) => {
    if (mode === "new") return card.status === "new";
    if (mode === "review") return card.status === "saved";
    return true;
  });

  const currentCard = filteredCards[currentCardIndex];

  const handleSave = () => {
    if (!currentCard) return;

    const updatedCards = cards.map((c) =>
      c.id === currentCard.id ? { ...c, status: "saved" as const } : c
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
      c.id === currentCard.id ? { ...c, status: "archived" as const } : c
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

  const handleGenerate = (url: string) => {
    setIsInputOpen(false);
    setIsLoading(true);

    // Simulate card generation
    setTimeout(() => {
      const newCard: Card = {
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
    return <LoadingState />;
  }

  return (
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
            onCardClick={() => onNavigate(`/card/${currentCard.id}`)}
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
  );
}