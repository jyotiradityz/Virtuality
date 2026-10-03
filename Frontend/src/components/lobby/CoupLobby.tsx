import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface CoupLobbyProps {
  onStartSinglePlayer: (name: string, botCount: number) => void;
  onJoinRoom: (roomCode: string, name: string) => void;
  onCreateRoom: (name: string) => void;
}

export const CoupLobby: React.FC<CoupLobbyProps> = ({
  onStartSinglePlayer,
  onJoinRoom,
  onCreateRoom,
}) => {
  const [playerName, setPlayerName] = useState('Jyot');
  const [roomCode, setRoomCode] = useState('');
  const [botCount, setBotCount] = useState(3);
  const [mode, setMode] = useState<'SELECT' | 'JOIN'>('SELECT');

  return (
    <div className="w-full h-screen flex items-center justify-center select-none" style={{ backgroundColor: '#ece7dc' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="coup-modal-panel p-8 max-w-md w-full space-y-6 shadow-2xl text-center"
      >
        {/* Title Watermark */}
        <div>
          <h1 className="text-amber-800 text-4xl font-black tracking-[0.25em] uppercase mb-1" style={{ fontFamily: "'Cinzel', serif" }}>
            COUP
          </h1>
          <p className="text-stone-600 text-xs font-bold tracking-widest uppercase">
            Real-Time Tactical Bluffing Board Game
          </p>
        </div>

        {/* Player Name Input */}
        <div className="space-y-1 text-left">
          <label className="text-amber-900 text-[10px] font-black uppercase tracking-widest pl-1">
            PLAYER NAME
          </label>
          <div className="neu-concave p-2.5 rounded-xl">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-transparent text-stone-900 font-extrabold text-sm outline-none px-2"
            />
          </div>
        </div>

        {mode === 'SELECT' ? (
          <div className="space-y-3 pt-2">
            {/* Quick Play vs Bots */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onStartSinglePlayer(playerName || 'Player', botCount)}
              className="action-btn primary w-full py-3.5 flex items-center justify-center gap-2 font-black text-xs tracking-wider"
            >
              <span>⚔️ QUICK PLAY (BOTS)</span>
            </motion.button>

            {/* Bot count selector */}
            <div className="flex items-center justify-between neu-pressed p-2 rounded-xl px-4">
              <span className="text-stone-600 text-[10px] font-extrabold uppercase">BOT OPPONENTS</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((count) => (
                  <button
                    key={count}
                    onClick={() => setBotCount(count)}
                    className={`w-7 h-7 rounded-lg text-xs font-black transition-all ${
                      botCount === count ? 'bg-amber-500 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative my-4 flex items-center justify-center">
              <div className="w-full border-t border-stone-300" />
              <span className="absolute bg-[#ece7dc] px-3 text-[10px] font-black text-stone-500 tracking-widest uppercase">OR MULTIPLAYER</span>
            </div>

            {/* Create Room */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onCreateRoom(playerName || 'Player')}
              className="action-btn w-full py-3.5 font-black text-xs tracking-wider text-amber-900"
            >
              👑 CREATE MULTIPLAYER ROOM
            </motion.button>

            {/* Join Room */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMode('JOIN')}
              className="action-btn w-full py-3.5 font-bold text-xs tracking-wider text-stone-700"
            >
              🤝 JOIN WITH ROOM CODE
            </motion.button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="space-y-1 text-left">
              <label className="text-amber-900 text-[10px] font-black uppercase tracking-widest pl-1">
                ENTER ROOM CODE
              </label>
              <div className="neu-concave p-2.5 rounded-xl">
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="e.g. COUP-4X89"
                  className="w-full bg-transparent text-stone-900 font-black text-center text-lg tracking-widest uppercase outline-none"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!roomCode.trim()}
              onClick={() => onJoinRoom(roomCode, playerName || 'Player')}
              className={`action-btn primary w-full py-3.5 font-black text-xs tracking-wider ${
                !roomCode.trim() ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              JOIN GAME
            </motion.button>

            <button
              onClick={() => setMode('SELECT')}
              className="text-stone-500 text-xs font-bold hover:text-stone-800 transition-colors mt-2"
            >
              ← Back to mode select
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
