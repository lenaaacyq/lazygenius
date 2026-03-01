import { motion } from "motion/react";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function CardDetail({ card, onBack }) {
  const cleanExcerpt = (text = "") => {
    const noiseContains = [
      "ICP备", "ICP", "营业执照", "公网安备", "增值电信业务", "许可证", "违法不良信息",
      "举报", "用户协议", "隐私政策", "登录", "注册", "扫码", "客服", "APP", "下载",
      "互联网举报中心", "网络文化经营许可证", "药品", "医疗器械"
    ];
    const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
    const cleaned = lines.filter((line) => {
      if (line.length <= 2) return false;
      if (noiseContains.some((token) => line.includes(token))) return false;
      return true;
    });
    return cleaned.length ? cleaned.join("\n") : text;
  };

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">卡片未找到</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-6"
      >
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white leading-tight mb-2">
            {card.hook_title}
          </h2>
        </div>

        {card.source_excerpt && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-white/10 mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              原文节选
            </h3>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
              {cleanExcerpt(card.source_excerpt)}
            </p>
          </div>
        )}

        {card.source_url && (
          <a
            href={card.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-white/10 active:bg-gray-800 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                原文链接
              </h3>
              <p className="text-purple-400 font-medium truncate">
                {card.source_url}
              </p>
            </div>
            <ExternalLink className="w-5 h-5 text-gray-500 flex-shrink-0 ml-4" />
          </a>
        )}
      </motion.div>
    </div>
  );
}
