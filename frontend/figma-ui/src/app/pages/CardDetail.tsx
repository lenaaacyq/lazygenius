import { motion } from "motion/react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { mockCards } from "../data/mockCards";

interface CardDetailProps {
  cardId: string;
  onBack: () => void;
}

export default function CardDetail({ cardId, onBack }: CardDetailProps) {
  const card = mockCards.find((c) => c.id === cardId);

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">卡片未找到</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-gray-950/80 backdrop-blur-lg border-b border-white/10 z-10">
        <div className="px-6 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-300 active:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-white">卡片详情</h1>
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-6"
      >
        {/* Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white leading-tight mb-2">
            {card.title}
          </h2>
          <p className="text-sm text-gray-500">
            {card.createdAt.toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Excerpt */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-white/10 mb-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            原文节选
          </h3>
          <p className="text-gray-300 leading-relaxed">{card.excerpt}</p>
        </div>

        {/* Source Link */}
        <a
          href={card.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-white/10 active:bg-gray-800 transition-colors"
        >
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
              原文链接
            </h3>
            <p className="text-purple-400 font-medium truncate">
              {card.sourceUrl}
            </p>
          </div>
          <ExternalLink className="w-5 h-5 text-gray-500 flex-shrink-0 ml-4" />
        </a>
      </motion.div>
    </div>
  );
}