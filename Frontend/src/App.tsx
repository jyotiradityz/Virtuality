import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Hexo from './pages/Hexo'
import HexoLobby from './pages/HexoLobby'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hexo" element={<Hexo />} />
        <Route path="/hexo/:lobbyCode" element={<HexoLobby />} />
        <Route path="/mafia" element={
          <div className="min-h-screen theme-mafia bg-[var(--color-background)] text-[var(--color-text)] flex flex-col items-center justify-center px-4">
            <div className="absolute inset-0 bg-radial from-red-950/20 via-black to-black -z-10" />
            <h1 className="text-5xl font-black mb-4 tracking-wider text-red-600">MAFIA</h1>
            <p className="text-stone-400 mb-8 max-w-sm text-center text-sm leading-relaxed">
              A thrilling game of social deduction, secret roles, and betrayal. Uncover the mafia members before they eliminate the townspeople.
            </p>
            <div className="flex gap-4">
              <a href="/" className="px-6 py-3 bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 font-bold text-sm rounded-xl transition-all shadow hover:shadow-red-950/20">
                Back to Hub
              </a>
              <button disabled className="px-6 py-3 bg-red-600/50 text-red-100/50 cursor-not-allowed font-bold text-sm rounded-xl">
                Coming Soon
              </button>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
