import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Hexo from './pages/Hexo';
import HexoLobby from './pages/HexoLobby';
import HexoGame from './pages/HexoGame';
import CoupSetup from './pages/CoupSetup';
import CoupLobbyPage from './pages/CoupLobbyPage';
import CoupGame from './pages/CoupGame';

// Lazy: keeps three.js / R3F out of the main bundle.
const Coup3DSandbox = lazy(() => import('./pages/Coup3DSandbox'));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hexo" element={<Hexo />} />
        <Route path="/hexo/:lobbyCode" element={<HexoLobby />} />
        <Route path="/hexo/:lobbyCode/game" element={<HexoGame />} />
        <Route path="/coup" element={<CoupSetup />} />
        <Route path="/coup/:lobbyCode" element={<CoupLobbyPage />} />
        <Route path="/coup/:lobbyCode/game" element={<CoupGame />} />
        <Route
          path="/coup/3d"
          element={
            <Suspense
              fallback={
                <div className="flex h-screen w-full items-center justify-center bg-[#07080d] text-xs font-bold uppercase tracking-widest text-amber-300/80">
                  Loading 3D world...
                </div>
              }
            >
              <Coup3DSandbox />
            </Suspense>
          }
        />
        <Route
          path="/mafia"
          element={
            <div className="min-h-screen theme-mafia bg-[var(--color-background)] text-[var(--color-text)] flex flex-col items-center justify-center px-4">
              <div className="absolute inset-0 bg-radial from-red-950/20 via-black to-black -z-10" />
              <h1 className="text-5xl font-black mb-4 tracking-wider text-red-600">MAFIA</h1>
              <p className="text-stone-400 mb-8 max-w-sm text-center text-sm leading-relaxed">
                A thrilling game of social deduction, secret roles, and betrayal. Uncover the mafia members before they eliminate the townspeople.
              </p>
              <div className="flex gap-4">
                <a
                  href="/"
                  className="px-6 py-3 bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 font-bold text-sm rounded-xl transition-all shadow hover:shadow-red-950/20"
                >
                  Back to Hub
                </a>
                <button
                  disabled
                  className="px-6 py-3 bg-red-600/50 text-red-100/50 cursor-not-allowed font-bold text-sm rounded-xl"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
