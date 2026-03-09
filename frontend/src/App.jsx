import Flashcard from './Flashcard'
import { Toaster } from 'sonner'

function App() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Flashcard />
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
