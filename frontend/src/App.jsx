import Flashcard from './Flashcard'
import { Toaster } from 'sonner'

function App() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-6 md:px-8 md:py-10">
      <div className="w-full max-w-[430px] md:h-[calc(100vh-80px)] md:rounded-[32px] md:overflow-hidden md:border md:border-white/10 md:shadow-2xl md:bg-gray-950">
        <Flashcard />
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
