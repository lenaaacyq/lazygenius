import Flashcard from './Flashcard'
import { Toaster } from 'sonner'

function App() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-6 md:px-8 md:py-10">
      <div className="relative w-full max-w-[480px]">
        <div className="hidden md:block absolute inset-0 rounded-[48px] bg-black/60 border border-white/10 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.8)]" />
        <div className="hidden md:block absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 rounded-full bg-black/80 border border-white/10" />
        <div className="relative p-0 md:p-4">
          <div className="w-full md:h-[calc(100vh-120px)] md:rounded-[32px] md:overflow-hidden md:border md:border-white/10 md:shadow-2xl md:bg-gray-950">
            <Flashcard />
          </div>
        </div>
      </div>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(15, 15, 35, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
            backdropFilter: 'blur(10px)',
          },
        }}
      />
    </div>
  )
}

export default App
