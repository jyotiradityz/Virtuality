import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DukeIcon,
  AssassinIcon,
  CaptainIcon,
  AmbassadorIcon,
  ContessaIcon,
  CoupSwordsIcon,
  DevicesIcon,
} from '../components/shared/CoupIcons';
import '../styles/coup.css';

export default function CoupSetup() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [maxPlayers, setMaxPlayers] = useState<number>(6);
  const [username, setUsername] = useState<string>('');
  const [joinCode, setJoinCode] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [gameType, setGameType] = useState<'multiplayer' | 'singleplayer'>('multiplayer');

  const handleCreateLobby = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = username.trim();
    if (!trimmedName) return;

    setErrorMessage(null);

    if (gameType === 'singleplayer') {
      const code = 'LOCAL' + Math.floor(1000 + Math.random() * 9000);
      navigate(
        `/coup/${code}/game?name=${encodeURIComponent(trimmedName)}&mode=singleplayer&bots=${maxPlayers - 1}`
      );
      return;
    }

    // Multiplayer: Route directly to chamber creation without premature socket disconnect
    navigate(
      `/coup/create?name=${encodeURIComponent(trimmedName)}&maxPlayers=${maxPlayers}&isHost=true`
    );
  };

  const handleJoinLobby = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = username.trim();
    const trimmedCode = joinCode.trim().toUpperCase();
    if (!trimmedName || !trimmedCode) return;

    setErrorMessage(null);
    navigate(`/coup/${trimmedCode}?name=${encodeURIComponent(trimmedName)}`);
  };

  return (
    <div className="coup-cream-room min-h-screen w-full flex flex-col lg:flex-row items-center justify-center p-4 sm:p-6 lg:p-12 overflow-x-hidden font-sans">
      
      {/* 3D Neumorphic Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl neu-flat-lg rounded-3xl grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative"
      >
        {/* LEFT PANEL: Game Lore & Roles */}
        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-stone-200/80 bg-white/40">
          <div>
            <button
              onClick={() => navigate('/')}
              className="neu-btn px-3.5 py-1.5 rounded-xl text-xs font-bold text-stone-700 flex items-center gap-2 mb-6 cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Virtuality Hub
            </button>

            <div className="space-y-3.5">
              <div className="w-12 h-12 rounded-2xl neu-flat flex items-center justify-center text-amber-600">
                <CoupSwordsIcon className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">
                  Tactical Bluffing Game
                </span>
                <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-wider uppercase leading-tight mt-0.5">
                  COUP
                </h1>
              </div>

              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                In a royal court of deception and bluffing, manipulate influence, claim roles you do not hold, and eliminate your rivals to take the crown.
              </p>

              {/* Roles Badges (Clean SVG Vector Badges) */}
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="neu-flat-sm px-2.5 py-1 rounded-lg text-[10px] font-black text-stone-800 flex items-center gap-1.5">
                  <DukeIcon className="w-3.5 h-3.5 text-amber-600" />
                  Duke
                </span>
                <span className="neu-flat-sm px-2.5 py-1 rounded-lg text-[10px] font-black text-stone-800 flex items-center gap-1.5">
                  <AssassinIcon className="w-3.5 h-3.5 text-red-600" />
                  Assassin
                </span>
                <span className="neu-flat-sm px-2.5 py-1 rounded-lg text-[10px] font-black text-stone-800 flex items-center gap-1.5">
                  <CaptainIcon className="w-3.5 h-3.5 text-sky-600" />
                  Captain
                </span>
                <span className="neu-flat-sm px-2.5 py-1 rounded-lg text-[10px] font-black text-stone-800 flex items-center gap-1.5">
                  <AmbassadorIcon className="w-3.5 h-3.5 text-emerald-600" />
                  Ambassador
                </span>
                <span className="neu-flat-sm px-2.5 py-1 rounded-lg text-[10px] font-black text-stone-800 flex items-center gap-1.5">
                  <ContessaIcon className="w-3.5 h-3.5 text-pink-600" />
                  Contessa
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 text-[11px] font-bold text-stone-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>2 to 6 Players • Bluffing & Strategy</span>
          </div>
        </div>

        {/* RIGHT PANEL: 3D Neumorphic Setup Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto space-y-5">
            
            {/* Header */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">
                Table Setup
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 uppercase tracking-wide mt-0.5">
                Game Chamber
              </h2>
            </div>

            {/* Tab Switcher */}
            <div className="flex p-1 rounded-2xl neu-inset-sm gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className={`flex-1 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'create'
                    ? 'neu-btn bg-white text-stone-900 shadow-md'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Create Room
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('join')}
                className={`flex-1 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'join'
                    ? 'neu-btn bg-white text-stone-900 shadow-md'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Join by Code
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Forms */}
            <AnimatePresence mode="wait">
              {activeTab === 'create' ? (
                <motion.form
                  key="create-tab"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  onSubmit={handleCreateLobby}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-stone-700 mb-1.5">
                      Your Player Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Duke_Jyot"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full py-2.5 px-3.5 rounded-xl neu-inset text-stone-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/50 placeholder:text-stone-400 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-stone-700 mb-1.5">
                      Game Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setGameType('multiplayer')}
                        className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          gameType === 'multiplayer'
                            ? 'neu-btn bg-amber-100/60 border border-amber-300 text-amber-900 shadow-sm'
                            : 'neu-inset text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        <DevicesIcon className="w-3.5 h-3.5" />
                        <span>Multiplayer</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setGameType('singleplayer')}
                        className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          gameType === 'singleplayer'
                            ? 'neu-btn bg-amber-100/60 border border-amber-300 text-amber-900 shadow-sm'
                            : 'neu-inset text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        <CoupSwordsIcon className="w-3.5 h-3.5" />
                        <span>Practice Bots</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-stone-700 mb-1.5">
                      Number of Players
                    </label>
                    <div className="flex p-1 rounded-xl neu-inset-sm gap-1">
                      {[2, 3, 4, 5, 6].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setMaxPlayers(num)}
                          className={`flex-1 py-1.5 rounded-lg font-black text-xs transition-all cursor-pointer ${
                            maxPlayers === num
                              ? 'neu-btn bg-amber-500 text-white font-black shadow-sm'
                              : 'text-stone-500 hover:text-stone-900'
                          }`}
                        >
                          {num}P
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl neu-btn bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer mt-2"
                  >
                    Enter Chamber
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="join-tab"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  onSubmit={handleJoinLobby}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-stone-700 mb-1.5">
                      Your Player Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Duke_Jyot"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full py-2.5 px-3.5 rounded-xl neu-inset text-stone-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/50 placeholder:text-stone-400 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-stone-700 mb-1.5">
                      Room Access Code
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TEST01"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      className="w-full py-2.5 px-3.5 rounded-xl neu-inset text-stone-900 text-base font-mono font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500/50 placeholder:text-stone-400 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl neu-btn bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer mt-2"
                  >
                    Join Chamber
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

          </div>
        </div>

      </motion.div>

    </div>
  );
}
