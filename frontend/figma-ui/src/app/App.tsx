import { useState } from "react";
import { Toaster } from "sonner";
import Home from "./pages/Home";
import CardDetail from "./pages/CardDetail";

export default function App() {
  const [currentView, setCurrentView] = useState<{ type: "home" } | { type: "detail", id: string }>({ type: "home" });

  const navigate = (path: string) => {
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
          <Home onNavigate={navigate} />
        ) : (
          <CardDetail cardId={currentView.id} onBack={goBack} />
        )}
      </div>
      <Toaster position="top-center" richColors />
    </div>
  );
}