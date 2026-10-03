import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface Player {
  name: string;
  isYou: boolean;
  isReady: boolean;
}

export default function HexoLobby() {
  const { lobbyCode } = useParams<{ lobbyCode: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Extract display name from query parameters
  const userName = searchParams.get('name') || 'Guest Player';
  const initialPlayers = parseInt(searchParams.get('players') || '4');

  // Lobby states
  const [maxPlayers, setMaxPlayers] = useState(initialPlayers);
  const [rollTime, setRollTime] = useState<string>('30s');
  const [playTime, setPlayTime] = useState<string>('2m');
  const [boardType, setBoardType] = useState<string>('Normal Board');
  const [isCopied, setIsCopied] = useState(false);

  // Fully interactive state-driven player list
  const [players, setPlayers] = useState<Player[]>([
    { name: `${userName} (Host)`, isYou: true, isReady: true },
    { name: 'Wild_West_Steve', isYou: false, isReady: true },
    { name: 'Calamity_Jane', isYou: false, isReady: false }
  ]);

  // Apply Hexo theme variables on mount
  useEffect(() => {
    document.body.className = 'theme-hexo';
    return () => {
      document.body.className = '';
    };
  }, []);

  // Update board type automatically when max players changes
  useEffect(() => {
    if (maxPlayers <= 4) {
      setBoardType('Normal Board');
    } else if (maxPlayers <= 6) {
      setBoardType('Normal Expansion');
    } else {
      setBoardType('Extreme Expansion');
    }
  }, [maxPlayers]);

  const handleCopyCode = () => {
    if (lobbyCode) {
      navigator.clipboard.writeText(lobbyCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const togglePlayerReady = (index: number) => {
    setPlayers(prev => prev.map((player, idx) => 
      idx === index ? { ...player, isReady: !player.isReady } : player
    ));
  };

  const handleStartGame = () => {
    const readyCount = players.filter(p => p.isReady).length;
    if (readyCount < players.length) {
      alert('Cannot start match yet. All joined settlers must be READY!');
      return;
    }
    navigate(`/hexo/${lobbyCode}/game?name=${encodeURIComponent(userName)}&players=${maxPlayers}&boardType=${encodeURIComponent(boardType)}`);
  };

  // Helper to rename board size to clean readable names
  const getShortName = (type: string) => {
    if (type === 'Normal Board') return 'Standard (2-4p)';
    if (type === 'Normal Expansion') return '5-6 Expansion';
    return '7-8 Expansion';
  };

  return (
    <div className="h-screen w-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_#0f172a_0%,_#020617_80%)] text-[#f1f5f9] flex flex-col justify-between p-4 md:p-6 lg:p-8 overflow-hidden relative font-sans select-none">
      
      {/* Header */}
      <header className="w-full max-w-5xl mx-auto flex justify-between items-center z-10 shrink-0">
        <button
          onClick={() => navigate('/hexo')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:brightness-110 bg-slate-900 border border-slate-800 px-4 py-2 rounded-full shadow-sm active:translate-y-0.5 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5 text-[#d4af37]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Leave Lobby
        </button>

        <div className="flex items-center gap-2 font-black text-xs tracking-wider text-[#d4af37] font-medieval uppercase">
          <span className="w-5 h-5 bg-[#b45309] rounded-sm flex items-center justify-center text-white text-[10px] border border-amber-800 shadow">H</span>
          LOBBY ROOM
        </div>
      </header>

      {/* Main Layout */}
      <main className="w-full max-w-5xl mx-auto flex flex-col justify-center flex-grow py-4 z-10 overflow-hidden min-h-0">
        
        {/* Banner: Room Code Info (Dark translucent panel) */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0c1220]/95 border border-slate-850 rounded-2xl p-4 shadow-md mb-4 flex flex-col sm:flex-row justify-between items-center gap-3 relative shrink-0"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#1e3a8a]/20 border border-[#d4af37]/20 flex items-center justify-center text-xl shadow-inner animate-pulse">
              🤠
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#d4af37]/80 block">
                SHARE ROOM CODE
              </span>
              <div className="flex items-center justify-center sm:justify-start gap-2.5 mt-0.5">
                <h2 className="text-xl md:text-2xl font-black tracking-widest text-[#d4af37] uppercase select-all font-mono">
                  {lobbyCode}
                </h2>
                <button 
                  onClick={handleCopyCode}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    isCopied 
                      ? 'bg-green-600 text-white border border-green-700 shadow-sm' 
                      : 'bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 shadow-sm'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    'Copy Code'
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="text-center sm:text-right flex flex-col items-center sm:items-end">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">
              ROOM CAPACITY
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-200 font-black text-base">
                {players.length} / {maxPlayers} Players
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
            </div>
          </div>
        </motion.div>

        {/* Double-Card Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start overflow-hidden flex-grow min-h-0">
          
          {/* LEFT POSTER: Player Roster */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-5 bg-[#0c1220]/95 border border-slate-850 rounded-2xl p-5 shadow-md relative flex flex-col gap-4 h-full overflow-hidden"
          >
            <div className="flex flex-col h-full overflow-hidden">
              <h3 className="text-sm font-black text-[#d4af37] uppercase border-b border-slate-850 pb-2.5 mb-3 text-center tracking-wider font-medieval">
                JOINED SETTLERS
              </h3>

              {/* Roster Container */}
              <div className="space-y-2.5 overflow-y-auto pr-1 flex-grow">
                <AnimatePresence initial={false}>
                  {players.map((player, i) => (
                    <motion.div 
                      key={player.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`flex justify-between items-center p-3 rounded-xl border transition-all ${
                        player.isYou 
                          ? 'bg-[#1e3a8a] border-blue-900 text-white shadow-md' 
                          : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:bg-slate-900/30'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className={player.isYou ? 'text-amber-200 text-base' : 'text-amber-500 text-base animate-bounce'}>🤠</span>
                        <span className="truncate font-bold text-sm tracking-wide font-medieval">
                          {player.name} {player.isYou && <span className="text-[9px] text-blue-200 font-black ml-1 bg-blue-950/60 px-1.5 py-0.5 rounded-md uppercase">You</span>}
                        </span>
                      </div>
                      
                      {/* Ready Action Toggle Button */}
                      <button
                        onClick={() => togglePlayerReady(i)}
                        className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border-b-2 shadow-sm transition-all cursor-pointer ${
                          player.isReady 
                            ? 'bg-green-600 hover:bg-green-700 text-white border-green-800 active:border-b-0 active:translate-y-0.5' 
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-900 active:border-b-0 active:translate-y-0.5'
                        }`}
                      >
                        {player.isReady ? 'READY ✓' : 'NOT READY ✗'}
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Waiting Spots */}
                {[...Array(Math.max(0, maxPlayers - players.length))].map((_, i) => (
                  <motion.div 
                    key={i} 
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }}
                    className="flex items-center justify-between p-3 rounded-xl border border-dashed border-slate-800 bg-slate-950/20 text-slate-500 font-bold text-[10px] shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="animate-spin text-slate-700">⚙️</span>
                      <span className="truncate">Waiting spot {players.length + i + 1}...</span>
                    </div>
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Searching</span>
                  </motion.div>
                ))}
              </div>

              <div className="text-center text-[10px] text-slate-400 font-bold bg-slate-950 border border-slate-850 p-2.5 rounded-xl shadow-inner mt-4 shrink-0">
                📌 Minimum 2 players required to begin
              </div>
            </div>
          </motion.div>

          {/* RIGHT POSTER: Settings & Config */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-7 bg-[#0c1220]/95 border border-slate-850 rounded-2xl p-5 shadow-md relative flex flex-col gap-4 h-full overflow-hidden"
          >
            <div className="flex flex-col h-full justify-between overflow-hidden">
              <h3 className="text-sm font-black text-[#d4af37] uppercase border-b border-slate-850 pb-2.5 mb-3 text-center tracking-wider font-medieval">
                TERRITORY & RULES
              </h3>

              <div className="space-y-4 text-left overflow-y-auto pr-1 flex-grow">
                
                {/* Max Players selection */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#d4af37] mb-1.5">Max Players</label>
                  <div className="flex flex-row justify-between gap-1.5 border border-slate-800 p-1 rounded-xl bg-slate-950/40 shadow-inner">
                    {[2, 3, 4, 5, 6, 7, 8].map(num => (
                      <button
                        key={num}
                        onClick={() => setMaxPlayers(num)}
                        className={`flex-1 py-1.5 rounded-lg font-black text-xs transition-all cursor-pointer ${
                          maxPlayers === num 
                            ? 'bg-[#d4af37] text-slate-950 shadow-md font-black' 
                            : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Territory size */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#d4af37] mb-1.5">Target Territory (Expansion Settings)</label>
                  <div className="flex flex-row gap-2.5 font-bold text-xs">
                    {['Normal Board', 'Normal Expansion', 'Extreme Expansion'].map(type => (
                      <button
                        key={type}
                        onClick={() => {
                          setBoardType(type);
                          if (type === 'Normal Board' && maxPlayers > 4) setMaxPlayers(4);
                          if (type === 'Normal Expansion' && (maxPlayers <= 4 || maxPlayers > 6)) setMaxPlayers(6);
                          if (type === 'Extreme Expansion' && maxPlayers <= 6) setMaxPlayers(8);
                        }}
                        className={`flex-1 p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 shadow-sm cursor-pointer ${
                          boardType === type 
                            ? 'bg-[#1e3a8a] border-blue-900 text-white shadow-md' 
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-base">{type === 'Normal Board' ? '🗺️' : type === 'Normal Expansion' ? '📜' : '👑'}</span>
                        <span className="text-[9px] uppercase font-black tracking-wide text-center mt-1">{getShortName(type)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Limits configuration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-[#d4af37] mb-1.5">Roll Time limit</label>
                    <div className="flex flex-row justify-between gap-1.5 border border-slate-800 p-1 rounded-xl bg-slate-950 shadow-inner">
                      {['15s', '30s', '60s', '∞'].map(time => (
                        <button
                          key={time}
                          onClick={() => setRollTime(time)}
                          className={`flex-1 py-1.5 rounded-lg font-black text-[9px] uppercase transition-all cursor-pointer ${
                            rollTime === time 
                              ? 'bg-[#1e3a8a] text-white shadow-sm border border-blue-500/20' 
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-[#d4af37] mb-1.5">Play Time limit</label>
                    <div className="flex flex-row justify-between gap-1.5 border border-slate-800 p-1 rounded-xl bg-slate-950 shadow-inner">
                      {['1m', '2m', '3m', '∞'].map(time => (
                        <button
                          key={time}
                          onClick={() => setPlayTime(time)}
                          className={`flex-1 py-1.5 rounded-lg font-black text-[9px] uppercase transition-all cursor-pointer ${
                            playTime === time 
                              ? 'bg-[#1e3a8a] text-white shadow-sm border border-blue-500/20' 
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Start Match Button */}
              <motion.button
                onClick={handleStartGame}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3.5 bg-[#b91c1c] hover:bg-[#991b1b] text-white font-black text-xs tracking-widest rounded-xl transition-all shadow-md border-b-4 border-[#7f1d1d] active:border-b-0 active:translate-y-0.5 mt-4 uppercase flex items-center justify-center gap-2 hover:shadow-lg font-medieval cursor-pointer shrink-0"
              >
                <span>START MATCH NOW</span>
                <span className="text-sm">➔</span>
              </motion.button>
            </div>
          </motion.div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center text-[9px] text-slate-600 py-1.5 shrink-0">
        &copy; {new Date().getFullYear()} Hexo Board Game. All rights reserved.
      </footer>
    </div>
  );
}
