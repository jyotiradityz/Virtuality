import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

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
  const [robberActive, setRobberActive] = useState(true);
  const [boardType, setBoardType] = useState<string>('');

  // Roster lists. Put the actual username in the host spot dynamically
  const joinedPlayers = [
    `${userName} (Host)`,
    'Wild_West_Steve',
    'Calamity_Jane'
  ];

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
      alert('Lobby Code copied to clipboard!');
    }
  };

  const handleStartGame = () => {
    alert(`Launching match ${lobbyCode}!\nHost: ${userName}\nTerritory: ${boardType}\nRules:\n- Roll: ${rollTime}\n- Play: ${playTime}\n- Robber: ${robberActive ? 'On' : 'Off'}`);
  };

  return (
    <div className="h-screen w-screen bg-[var(--color-background)] text-[#27160c] flex flex-col justify-between p-4 md:p-6 lg:p-8 overflow-hidden relative">
      
      {/* Header (Compact) */}
      <header className="w-full max-w-5xl mx-auto flex justify-between items-center z-10">
        <button
          onClick={() => navigate('/hexo')}
          className="flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:opacity-80 transition-opacity bg-white/90 border border-amber-900/20 px-3 py-1.5 rounded-full shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Leave Lobby
        </button>

        <div className="flex items-center gap-1.5 font-black text-xs tracking-wider text-amber-955 uppercase">
          <span className="w-4 h-4 bg-amber-900 rounded-sm flex items-center justify-center text-white text-[9px]">H</span>
          LOBBY ROOM
        </div>
      </header>

      {/* Main Saloon Table Layout */}
      <main className="w-full max-w-5xl mx-auto flex flex-col justify-center flex-grow py-3 z-10 overflow-hidden">
        
        {/* Banner: Room Code Info */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#fcfaf7] border border-amber-900/30 rounded-2xl p-4 shadow-sm mb-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-center sm:text-left relative"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-900/10 border border-amber-900/20 flex items-center justify-center text-xl">
              🤠
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-800/80 block">
                SHARE ROOM CODE
              </span>
              <div className="flex items-center justify-center sm:justify-start gap-2.5 mt-0.5">
                <h2 className="text-xl md:text-2xl font-black tracking-widest text-amber-955 uppercase select-all">
                  {lobbyCode}
                </h2>
                <button 
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 bg-amber-900/10 border border-amber-900/20 hover:bg-amber-900/20 text-amber-950 rounded-lg transition-colors text-[10px] font-bold"
                >
                  Copy Code
                </button>
              </div>
            </div>
          </div>
          
          <div className="text-center sm:text-right flex flex-col items-center sm:items-end">
            <span className="text-[9px] font-black uppercase tracking-wider text-amber-800/80 block mb-0.5">
              ROOM CAPACITY
            </span>
            <span className="text-amber-950 font-black text-sm">
              {joinedPlayers.length} / {maxPlayers} Players
            </span>
          </div>
        </motion.div>

        {/* Double-Poster Rules and Players layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch overflow-hidden h-full max-h-[72vh]">
          
          {/* LEFT POSTER: Player Roster (Scroll-locked and compressed) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-5 bg-[#fcfaf7] border-2 border-amber-900/30 rounded-2xl p-4 shadow-sm relative flex flex-col justify-between"
          >
            {/* Corner Ornaments */}
            <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-amber-900/20" />
            <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-amber-900/20" />
            <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-amber-900/20" />
            <div className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-amber-900/20" />

            <div>
              <h3 className="text-sm font-black text-amber-950 uppercase border-b border-amber-900/20 pb-1.5 mb-3 text-center">
                Joined settlers
              </h3>

              {/* List of Players */}
              <div className="space-y-2 max-h-[42vh] overflow-y-auto pr-1">
                {joinedPlayers.map((player, i) => (
                  <div 
                    key={i} 
                    className="flex justify-between items-center p-2.5 rounded-lg border border-amber-900/10 bg-amber-50/20 font-bold text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-amber-800 text-sm">🤠</span>
                      <span className="truncate max-w-[120px] lg:max-w-[160px]">{player}</span>
                    </div>
                    <span className="text-[9px] text-amber-800/60 uppercase">Ready</span>
                  </div>
                ))}

                {/* Waiting spots */}
                {[...Array(Math.max(0, maxPlayers - joinedPlayers.length))].map((_, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-dashed border-amber-900/20 text-stone-400 font-bold text-[10px]"
                  >
                    <span>🐎</span>
                    <span className="truncate">Waiting spot {joinedPlayers.length + i + 1}...</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 text-center text-[10px] text-amber-800/80 font-bold bg-amber-50/40 p-2 rounded-lg border border-amber-900/10">
              📌 Minimum 2 players required to begin
            </div>
          </motion.div>

          {/* RIGHT POSTER: Custom Rules & Board Config */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-7 bg-[#fcfaf7] border-2 border-amber-900/30 rounded-2xl p-4 shadow-sm relative flex flex-col justify-between"
          >
            {/* Corner Ornaments */}
            <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-amber-900/20" />
            <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-amber-900/20" />
            <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-amber-900/20" />
            <div className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-amber-900/20" />

            <div>
              <h3 className="text-sm font-black text-amber-950 uppercase border-b border-amber-900/20 pb-1.5 mb-4 text-center">
                TERRITORY & RULES
              </h3>

              <div className="space-y-4 text-left">
                
                {/* Max Players (Horizontal Flex to prevent vertical stacking) */}
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-wider text-amber-950 mb-1.5">Max Players</label>
                  <div className="flex flex-row justify-between gap-1 border border-amber-900/10 p-0.5 rounded-lg bg-stone-50">
                    {[2, 3, 4, 5, 6, 7, 8].map(num => (
                      <button
                        key={num}
                        onClick={() => setMaxPlayers(num)}
                        className={`flex-1 py-1 rounded-md font-black text-xs transition-all ${
                          maxPlayers === num 
                            ? 'bg-amber-900 text-white shadow-sm' 
                            : 'text-amber-900/70 hover:bg-stone-200/50'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Territory settings */}
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-wider text-amber-950 mb-1.5">Target Territory (Expansion Settings)</label>
                  <div className="flex flex-row gap-2 font-bold text-xs">
                    {['Normal Board', 'Normal Expansion', 'Extreme Expansion'].map(type => (
                      <button
                        key={type}
                        onClick={() => {
                          setBoardType(type);
                          if (type === 'Normal Board' && maxPlayers > 4) setMaxPlayers(4);
                          if (type === 'Normal Expansion' && (maxPlayers <= 4 || maxPlayers > 6)) setMaxPlayers(6);
                          if (type === 'Extreme Expansion' && maxPlayers <= 6) setMaxPlayers(8);
                        }}
                        className={`flex-1 p-2 rounded-xl border-2 transition-all flex flex-col items-center gap-0.5 ${
                          boardType === type 
                            ? 'bg-amber-900 border-amber-950 text-white shadow-sm' 
                            : 'bg-white border-amber-900/25 text-amber-900 hover:bg-stone-50'
                        }`}
                      >
                        <span className="text-sm">{type === 'Normal Board' ? '🗺️' : type === 'Normal Expansion' ? '📜' : '👑'}</span>
                        <span className="text-[8px] uppercase font-black tracking-wide text-center">{type.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Limits: Roll Time & Play Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-wider text-amber-950 mb-1.5">Roll Time limit</label>
                    <div className="flex flex-row justify-between gap-1 border border-stone-200 p-0.5 rounded-lg bg-stone-50">
                      {['15s', '30s', '60s', '∞'].map(time => (
                        <button
                          key={time}
                          onClick={() => setRollTime(time)}
                          className={`flex-1 py-1 rounded-md font-black text-[9px] uppercase transition-all ${
                            rollTime === time 
                              ? 'bg-amber-900 text-white' 
                              : 'text-stone-600 hover:bg-stone-200/50'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-wider text-amber-950 mb-1.5">Play Time limit</label>
                    <div className="flex flex-row justify-between gap-1 border border-stone-200 p-0.5 rounded-lg bg-stone-50">
                      {['1m', '2m', '3m', '∞'].map(time => (
                        <button
                          key={time}
                          onClick={() => setPlayTime(time)}
                          className={`flex-1 py-1 rounded-md font-black text-[9px] uppercase transition-all ${
                            playTime === time 
                              ? 'bg-amber-900 text-white' 
                              : 'text-stone-600 hover:bg-stone-200/50'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Robber rule switch */}
                <div className="flex items-center justify-between py-2 border-t border-amber-900/10">
                  <div>
                    <h5 className="font-black text-xs text-amber-950 uppercase">Active Robber</h5>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRobberActive(!robberActive)}
                    className={`w-10 h-5 rounded-full transition-colors relative focus:outline-none ${
                      robberActive ? 'bg-amber-900' : 'bg-stone-300'
                    }`}
                  >
                    <motion.div
                      layout
                      className="w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 left-0.5"
                      animate={{ x: robberActive ? 20 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

              </div>
            </div>

            {/* Launch CTA Button */}
            <button
              onClick={handleStartGame}
              className="w-full py-2.5 bg-amber-800 hover:bg-amber-900 text-white font-black text-xs tracking-wider rounded-xl transition-all shadow border-b-4 border-amber-950 active:border-b-0 active:translate-y-0.5 mt-3 uppercase"
            >
              START MATCH NOW
            </button>

          </motion.div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center text-[9px] text-amber-900/40 py-2 z-10">
        &copy; {new Date().getFullYear()} Hexo Board Game. All rights reserved.
      </footer>
    </div>
  );
}
