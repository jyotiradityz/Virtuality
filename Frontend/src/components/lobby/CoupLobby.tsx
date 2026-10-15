import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DukeIcon, AssassinIcon } from '../shared/CoupIcons';

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
  const [playerName, setPlayerName] = useState('Player');
  const [roomCode, setRoomCode] = useState('');
  const [botCount, setBotCount] = useState(3);
  const [mode, setMode] = useState<'SELECT' | 'JOIN'>('SELECT');

  return (
    <div className="w-full h-screen coup-cream-room flex items-center justify-center select-none p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="coup-modal-panel p-8 max-w-md w-full space-y-6 text-center"
      >
        {/* Title */}
        <div>
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <span className="w-8 h-8 rounded-xl neu-flat flex items-center justify-center text-amber-800">
              <DukeIcon className="w-5 h-5" />
            </span>
            <h1 className="text-stone-900 text-3xl font-black tracking-widest uppercase">
              COUP
            </h1>
          </div>
          <p className="text-stone-500 text-xs font-semibold tracking-wider uppercase">
            Tactical Bluffing Board Game
          </p>
        </div>

        {/* Player Name Input */}
        <div className="space-y-1.5 text-left">
          <label className="text-stone-600 text-[11px] font-black uppercase tracking-wider pl-1">
            Player Name
          </label>
          <div className="neu-inset-sm px-3.5 py-2.5 rounded-xl">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-transparent text-stone-900 font-bold text-sm outline-none placeholder:text-stone-400"
            />
          </div>
        </div>

        {mode === 'SELECT' ? (
          <div className="space-y-3.5 pt-2">
            {/* Quick Play vs Bots */}
            <button
              onClick={() => onStartSinglePlayer(playerName.trim() || 'Player', botCount)}
              className="neu-btn neu-btn-gold w-full py-3.5 flex items-center justify-center gap-2 font-black text-xs tracking-wider cursor-pointer shadow-md rounded-xl"
            >
              <AssassinIcon className="w-4 h-4" />
              <span>QUICK PLAY (BOTS)</span>
            </button>

            {/* Bot count selector */}
            <div className="flex items-center justify-between neu-inset-sm p-2.5 rounded-xl px-4">
              <span className="text-stone-600 text-[11px] font-bold uppercase tracking-wider">
                Bot Opponents
              </span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((count) => (
                  <button
                    key={count}
                    onClick={() => setBotCount(count)}
                    className={`w-7 h-7 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      botCount === count
                        ? 'neu-flat bg-amber-500 text-white font-extrabold shadow-sm'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative my-3 flex items-center justify-center">
              <div className="w-full border-t border-stone-300/60" />
              <span className="absolute bg-[#ece7dc] px-3 text-[10px] font-bold text-stone-500 tracking-wider uppercase">
                OR MULTIPLAYER
              </span>
            </div>

            {/* Create Room */}
            <button
              onClick={() => onCreateRoom(playerName.trim() || 'Player')}
              className="neu-btn w-full py-3.5 font-black text-xs tracking-wider text-stone-800 cursor-pointer rounded-xl flex items-center justify-center gap-2"
            >
              <DukeIcon className="w-4 h-4 text-amber-700" />
              <span>CREATE MULTIPLAYER ROOM</span>
            </button>

            {/* Join Room */}
            <button
              onClick={() => setMode('JOIN')}
              className="neu-btn w-full py-3.5 font-bold text-xs tracking-wider text-stone-700 cursor-pointer rounded-xl"
            >
              JOIN WITH ROOM CODE
            </button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5 text-left">
              <label className="text-stone-600 text-[11px] font-black uppercase tracking-wider pl-1">
                Enter Room Code
              </label>
              <div className="neu-inset-sm p-2.5 rounded-xl">
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="e.g. COUP-4X89"
                  className="w-full bg-transparent text-stone-900 font-black text-center text-lg tracking-widest uppercase outline-none placeholder:text-stone-400"
                />
              </div>
            </div>

            <button
              disabled={!roomCode.trim()}
              onClick={() => onJoinRoom(roomCode.trim(), playerName.trim() || 'Player')}
              className={`neu-btn neu-btn-gold w-full py-3.5 font-black text-xs tracking-wider rounded-xl cursor-pointer ${
                !roomCode.trim() ? 'opacity-40 cursor-not-allowed neu-inset-sm' : 'shadow-md'
              }`}
            >
              JOIN GAME
            </button>

            <button
              onClick={() => setMode('SELECT')}
              className="text-stone-600 text-xs font-bold hover:text-stone-900 transition-colors mt-2 cursor-pointer"
            >
              ← Back to Mode Select
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
