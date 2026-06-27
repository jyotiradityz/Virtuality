import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GAMES, type GameConfig } from '../config/games';

export default function Home() {
  const navigate = useNavigate();

  // Reset theme to platform default on mount
  useEffect(() => {
    document.body.className = '';
  }, []);

  return (
    <div className="min-h-screen bg-radial from-[#0f172a] via-[#090d16] to-[#020617] text-slate-100 flex flex-col items-center px-4 md:px-8 py-12">
      {/* Header */}
      <header className="w-full max-w-6xl flex justify-between items-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center glow-primary">
            <span className="font-extrabold text-xl text-white">V</span>
          </div>
          <h1 className="text-2xl font-black tracking-wider text-white">VIRTUALITY</h1>
        </motion.div>
        <div className="text-xs text-indigo-400 font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5">
          V1.0.0 Stable
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-5xl flex-grow flex flex-col justify-center items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
            Enter the <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-accent">Virtuality Arena</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
            A next-generation, real-time multiplayer gaming hub. Play with friends, create custom rooms, and dominate the leaderboard from a single profile.
          </p>
        </motion.div>

        {/* Responsive Grid for Games */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-2">
          {GAMES.map((game: GameConfig, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => navigate(game.path)}
              className="group cursor-pointer glass rounded-2xl overflow-hidden p-6 md:p-8 flex flex-col text-left relative transition-all duration-300 hover:border-slate-700/50 hover:bg-slate-900/40"
            >
              {/* Card Accent Glow */}
              <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${game.accentColor} opacity-5 group-hover:opacity-10 blur-3xl transition-opacity duration-500 rounded-full -mr-16 -mt-16`} />

              <div className="flex justify-between items-start mb-6">
                {/* Game Title Tag */}
                <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded">
                  {game.tagline}
                </span>

                {/* Player count badge */}
                <span className="text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700/50">
                  {game.minPlayers}-{game.maxPlayers} Players
                </span>
              </div>

              {/* Game Name */}
              <h3 className="text-3xl font-extrabold text-white mb-3 group-hover:text-indigo-400 transition-colors duration-300">
                {game.name}
              </h3>

              {/* Description */}
              <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-grow">
                {game.description}
              </p>

              {/* Action Button */}
              <div className="flex items-center gap-2 text-sm font-bold text-white group-hover:text-indigo-400 transition-all duration-300">
                <span>Play Now</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 text-slate-600 text-xs">
        &copy; {new Date().getFullYear()} Virtuality. All rights reserved.
      </footer>
    </div>
  );
}
