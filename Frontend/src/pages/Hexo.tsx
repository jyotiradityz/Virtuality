import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import hexoSunsetWithText from '../assets/hexo_sunset_with_text.png';

export default function Hexo() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [username, setUsername] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isLaunching, setIsLaunching] = useState(false);

  // Apply Hexo theme on mount and cleanup on unmount
  useEffect(() => {
    document.body.className = 'theme-hexo';
    return () => {
      document.body.className = '';
    };
  }, []);

  // Helper to determine board size dynamically
  const getBoardExpansion = (players: number): string => {
    if (players <= 4) return 'Normal Board';
    if (players <= 6) return 'Normal Expansion';
    return 'Extreme Expansion';
  };

  // Generate random 6-char alphanumeric lobby code (e.g. HEX-A3B9)
  const generateLobbyCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `HEX-${code}`;
  };

  const handleCreateLobby = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setIsLaunching(true);
    
    // Simulate game transition
    setTimeout(() => {
      setIsLaunching(false);
      const code = generateLobbyCode();
      navigate(`/hexo/${code}?name=${encodeURIComponent(username.trim())}&players=${maxPlayers}`);
    }, 1500);
  };

  const handleJoinLobby = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !joinCode.trim()) return;
    
    // Format input (convert to uppercase, ensure it matches HEX-XXXX style or standard string)
    let formattedCode = joinCode.trim().toUpperCase();
    if (!formattedCode.startsWith('HEX-') && formattedCode.length === 4) {
      formattedCode = `HEX-${formattedCode}`;
    }
    
    setIsLaunching(true);
    setTimeout(() => {
      setIsLaunching(false);
      navigate(`/hexo/${formattedCode}?name=${encodeURIComponent(username.trim())}`);
    }, 1200);
  };

  return (
    <div className="h-screen w-screen flex flex-col lg:flex-row overflow-hidden relative text-[#f1f5f9] bg-slate-950 bg-[radial-gradient(ellipse_at_top,_#0f172a_0%,_#020617_80%)] font-sans">
      
      {/* LEFT SIDE: Sunset Cover Art */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full lg:w-1/2 h-[45vh] lg:h-full bg-cover bg-center relative border-b-8 lg:border-b-0 lg:border-r-8 border-slate-800"
        style={{ backgroundImage: `url(${hexoSunsetWithText})` }}
      >
        {/* Soft Shadow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-transparent via-[#020617]/40 to-[#020617]/80 pointer-events-none" />
      </motion.div>

      {/* RIGHT SIDE: Game Setup Panel (Dark Starry / Glassmorphic Navy theme) */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full lg:w-1/2 h-[55vh] lg:h-full bg-slate-950 bg-[radial-gradient(ellipse_at_top,_#0f172a_0%,_#020617_80%)] flex flex-col justify-between p-6 md:p-10 lg:p-14 relative z-10 overflow-y-auto"
      >
        
        {/* Header - Back Button */}
        <div className="flex justify-between items-center w-full mb-6 shrink-0">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:brightness-110 bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-full shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5 text-[#d4af37]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Hub
          </button>
          
          <div className="flex items-center gap-2 font-black text-xs md:text-sm tracking-wider text-[#d4af37] font-medieval uppercase">
            <span className="w-5 h-5 bg-[#1e3a8a] rounded-sm flex items-center justify-center text-[#f1f5f9] text-[10px] shadow-sm border border-slate-700">H</span>
            Hexo Setup
          </div>
        </div>

        {/* Setup Card (Translucent Dark Navy card with gold border details) */}
        <div className="my-auto w-full max-w-md mx-auto bg-[#0c1220]/95 border-2 border-[#d4af37]/60 rounded-2xl p-6 md:p-8 shadow-2xl relative text-slate-100">
          
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#d4af37]/45" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#d4af37]/45" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#d4af37]/45" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#d4af37]/45" />

          {/* Heading */}
          <div className="text-center mb-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#d4af37] border-b border-[#d4af37]/20 pb-1 mb-2 inline-block">
              WANTED: 2 TO 8 KINGDOM SETTLERS
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[#d4af37] mt-1 font-medieval uppercase">
              STAKE YOUR CLAIM
            </h2>
          </div>

          {/* Switch Options (Create vs Join tabs) */}
          <div className="flex bg-slate-950/60 border border-slate-800 p-1 rounded-xl mb-6 font-bold text-xs text-slate-300">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-2 rounded-lg transition-all font-bold cursor-pointer ${
                activeTab === 'create' 
                  ? 'bg-[#1e3a8a] text-white shadow border border-blue-500/20' 
                  : 'hover:bg-slate-900/40 text-slate-400'
              }`}
            >
              Create Kingdom
            </button>
            <button
              onClick={() => setActiveTab('join')}
              className={`flex-1 py-2 rounded-lg transition-all font-bold cursor-pointer ${
                activeTab === 'join' 
                  ? 'bg-[#1e3a8a] text-white shadow border border-blue-500/20' 
                  : 'hover:bg-slate-900/40 text-slate-400'
              }`}
            >
              Join Match
            </button>
          </div>

          {/* Tab Contents */}
          <AnimatePresence mode="wait">
            {activeTab === 'create' ? (
              <motion.form
                key="create-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleCreateLobby}
                className="space-y-5"
              >
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#d4af37] mb-1.5 text-center">
                    Your Settler Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sheriff_Joe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2.5 text-center font-bold border border-slate-800 bg-slate-950/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af37] text-slate-100 placeholder-slate-600 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#d4af37] text-center">
                    Match Competitors ({maxPlayers} Players)
                  </label>
                  <div className="flex bg-slate-950/40 border border-slate-850 p-1 rounded-xl font-bold text-xs">
                    {[4, 6, 8].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setMaxPlayers(num)}
                        className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                          maxPlayers === num 
                            ? 'bg-[#d4af37] text-slate-950 shadow font-black' 
                            : 'hover:bg-slate-900/40 text-slate-400'
                        }`}
                      >
                        {num} Settlers
                      </button>
                    ))}
                  </div>
                  <div className="text-center text-[9px] font-bold text-amber-500/80 uppercase tracking-widest">
                    🎯 Map scale: {getBoardExpansion(maxPlayers)}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!username.trim()}
                  className={`w-full py-3 bg-[#b91c1c] hover:bg-[#991b1b] text-white font-black text-base rounded-xl transition-all shadow-md border-b-4 border-[#7f1d1d] active:border-b-0 active:translate-y-0.5 cursor-pointer font-medieval tracking-widest ${
                    !username.trim() ? 'opacity-50 cursor-not-allowed border-b-0 translate-y-0.5' : ''
                  }`}
                >
                  FOUND LOBBY
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="join-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleJoinLobby}
                className="space-y-5"
              >
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#d4af37] mb-1.5 text-center">
                    Your Settler Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Calamity_Jane"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2.5 text-center font-bold border border-slate-800 bg-slate-950/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af37] text-slate-100 placeholder-slate-600 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#d4af37] mb-1.5 text-center">
                    Enter Kingdom Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={9}
                    placeholder="HEX-A3B9"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="w-full p-2.5 text-center text-sm font-black uppercase tracking-wider border border-slate-800 bg-slate-950/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4af37] text-slate-100 placeholder-slate-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!username.trim() || !joinCode.trim()}
                  className={`w-full py-3 font-black text-base rounded-xl transition-all shadow-md border-b-4 active:border-b-0 active:translate-y-0.5 text-white font-medieval tracking-widest cursor-pointer ${
                    username.trim() && joinCode.trim() 
                      ? 'bg-[#b91c1c] hover:bg-[#991b1b] border-[#7f1d1d]' 
                      : 'bg-slate-800 border-slate-900 text-slate-600 cursor-not-allowed border-b-0 translate-y-0.5 shadow-none'
                  }`}
                >
                  ENTER KINGDOM
                </button>
              </motion.form>
            )}
          </AnimatePresence>

        </div>

        {/* Resource Badges */}
        <div className="flex flex-wrap gap-2 justify-center mt-6">
          <span className="text-[10px] font-extrabold text-amber-400 bg-slate-900/60 border border-slate-800 px-2.5 py-1 rounded">wood 🌲</span>
          <span className="text-[10px] font-extrabold text-amber-400 bg-slate-900/60 border border-slate-800 px-2.5 py-1 rounded">sheep 🐑</span>
          <span className="text-[10px] font-extrabold text-amber-400 bg-slate-900/60 border border-slate-800 px-2.5 py-1 rounded">brick 🧱</span>
          <span className="text-[10px] font-extrabold text-amber-400 bg-slate-900/60 border border-slate-800 px-2.5 py-1 rounded">wheat 🌾</span>
          <span className="text-[10px] font-extrabold text-amber-400 bg-slate-900/60 border border-slate-800 px-2.5 py-1 rounded">ore 🏔️</span>
        </div>

      </motion.div>

      {/* Map Generating Loader */}
      <AnimatePresence>
        {isLaunching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#060a12]/97 z-[60] flex flex-col items-center justify-center text-white"
          >
            <div className="flex gap-3 mb-8">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-12 h-14 bg-amber-500 shadow-md"
                  style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}
                  animate={{ 
                    y: [0, -20, 0],
                    scale: [1, 1.15, 1],
                  }}
                  transition={{ 
                    duration: 1.2, 
                    repeat: Infinity, 
                    delay: i * 0.15,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
            <h3 className="text-2xl md:text-3xl font-black tracking-widest text-amber-500 animate-pulse font-medieval">GENERATING LAND GRID...</h3>
            <p className="text-slate-400 text-xs md:text-sm mt-3 font-semibold">Distributing wood, brick, sheep, wheat, ore, and desert hexes...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
