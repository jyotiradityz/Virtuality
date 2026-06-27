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
    <div className="h-screen w-screen flex flex-col lg:flex-row overflow-hidden relative text-[#27160c]">
      
      {/* LEFT SIDE: Sunset Cover Art */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full lg:w-1/2 h-[45vh] lg:h-full bg-cover bg-center relative border-b-8 lg:border-b-0 lg:border-r-8 border-amber-900"
        style={{ backgroundImage: `url(${hexoSunsetWithText})` }}
      >
        {/* Soft Shadow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-transparent via-black/10 to-black/30 pointer-events-none" />
      </motion.div>

      {/* RIGHT SIDE: Game Setup Panel (Western / Parchment theme) */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full lg:w-1/2 h-[55vh] lg:h-full bg-[var(--color-background)] flex flex-col justify-between p-6 md:p-10 lg:p-14 relative z-10 overflow-y-auto"
      >
        
        {/* Header - Back Button */}
        <div className="flex justify-between items-center w-full mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-xs font-bold text-amber-900 hover:opacity-80 transition-opacity bg-white/80 border-2 border-amber-900/30 px-4 py-2 rounded-full shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Hub
          </button>
          
          <div className="flex items-center gap-2 font-black text-xs md:text-sm tracking-wider text-amber-950 uppercase">
            <span className="w-5 h-5 bg-amber-900 rounded-sm flex items-center justify-center text-white text-[10px]">H</span>
            Hexo Setup
          </div>
        </div>

        {/* Setup Card (Old West Parchment Poster) */}
        <div className="my-auto w-full max-w-md mx-auto bg-[#fcfaf7] border-4 border-double border-amber-900 rounded-2xl p-6 md:p-8 shadow-xl relative">
          
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-900/40" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber-900/40" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber-900/40" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-900/40" />

          {/* Heading */}
          <div className="text-center mb-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-800/80 border-b-2 border-amber-800 pb-1 mb-2 inline-block">
              WANTED: 2 TO 8 SETTLERS
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-amber-950 mt-1 uppercase">
              STAKE YOUR CLAIM
            </h2>
          </div>

          {/* Switch Options (Create vs Join tabs) */}
          <div className="flex bg-stone-200/50 border border-stone-300/60 p-1 rounded-xl mb-6 font-bold text-xs">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-2.5 rounded-lg transition-all ${
                activeTab === 'create' 
                  ? 'bg-amber-900 text-white shadow-sm' 
                  : 'text-amber-900/80 hover:bg-stone-200/30'
              }`}
            >
              Create Lobby
            </button>
            <button
              onClick={() => setActiveTab('join')}
              className={`flex-1 py-2.5 rounded-lg transition-all ${
                activeTab === 'join' 
                  ? 'bg-amber-900 text-white shadow-sm' 
                  : 'text-amber-900/80 hover:bg-stone-200/30'
              }`}
            >
              Join Friend's Game
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
                  <label className="block text-[10px] font-black uppercase tracking-wider text-amber-900 mb-1.5 text-center">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sheriff_Joe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2.5 text-center font-semibold border-2 border-amber-900/25 bg-stone-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-900 text-amber-955 placeholder-amber-950/20 text-sm"
                  />
                </div>



                <button
                  type="submit"
                  disabled={!username.trim()}
                  className={`w-full py-3 bg-amber-800 hover:bg-amber-900 text-white font-black text-base rounded-xl transition-all shadow-md border-b-4 border-amber-950 active:border-b-0 active:translate-y-0.5 ${
                    !username.trim() ? 'opacity-50 cursor-not-allowed border-b-0 translate-y-0.5' : ''
                  }`}
                >
                  CREATE LOBBY
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
                  <label className="block text-[10px] font-black uppercase tracking-wider text-amber-900 mb-1.5 text-center">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Calamity_Jane"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2.5 text-center font-semibold border-2 border-amber-900/25 bg-stone-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-900 text-amber-955 placeholder-amber-950/20 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-amber-900 mb-1.5 text-center">
                    Enter Lobby Room Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={9}
                    placeholder="HEX-A3B9"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="w-full p-2.5 text-center text-sm font-black uppercase tracking-wider border-2 border-amber-900/25 bg-stone-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-900 text-amber-950 placeholder-amber-950/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!username.trim() || !joinCode.trim()}
                  className={`w-full py-3 font-black text-base rounded-xl transition-all shadow-md border-b-4 border-amber-950 active:border-b-0 active:translate-y-0.5 text-white ${
                    username.trim() && joinCode.trim() 
                      ? 'bg-amber-800 hover:bg-amber-900' 
                      : 'bg-stone-300 border-stone-400 text-stone-500 cursor-not-allowed border-b-0 translate-y-0.5 shadow-none'
                  }`}
                >
                  JOIN GAME
                </button>
              </motion.form>
            )}
          </AnimatePresence>

        </div>

        {/* Resource Badges */}
        <div className="flex flex-wrap gap-2 justify-center mt-6">
          <span className="text-[10px] font-extrabold text-amber-900 bg-amber-900/10 px-2.5 py-1 rounded">wood 🌲</span>
          <span className="text-[10px] font-extrabold text-amber-900 bg-amber-900/10 px-2.5 py-1 rounded">sheep 🐑</span>
          <span className="text-[10px] font-extrabold text-amber-900 bg-amber-900/10 px-2.5 py-1 rounded">brick 🧱</span>
          <span className="text-[10px] font-extrabold text-amber-900 bg-amber-900/10 px-2.5 py-1 rounded">wheat 🌾</span>
          <span className="text-[10px] font-extrabold text-amber-900 bg-amber-900/10 px-2.5 py-1 rounded">ore 🏔️</span>
        </div>

      </motion.div>

      {/* Map Generating Loader */}
      <AnimatePresence>
        {isLaunching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#2c1a04]/97 z-[60] flex flex-col items-center justify-center text-white"
          >
            <div className="flex gap-3 mb-8">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-12 h-14 bg-amber-700 shadow-md"
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
            <h3 className="text-2xl md:text-3xl font-black tracking-widest text-amber-500 animate-pulse">GENERATING LAND GRID...</h3>
            <p className="text-amber-100/50 text-xs md:text-sm mt-3 font-semibold">Distributing wood, brick, sheep, wheat, ore, and desert hexes...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
