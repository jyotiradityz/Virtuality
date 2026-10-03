import React, { useRef, useEffect, useState } from 'react';
import type { GameLogEntry } from '../../types/game';
import { motion, AnimatePresence } from 'framer-motion';

interface GameLogProps {
  entries: GameLogEntry[];
}

const LOG_TYPE_STYLES: Record<GameLogEntry['type'], { bg: string; text: string; label: string }> = {
  ACTION: { bg: 'bg-amber-100 border-amber-300', text: 'text-amber-800', label: 'ACT' },
  CHALLENGE: { bg: 'bg-red-100 border-red-300', text: 'text-red-800', label: 'CHL' },
  BLOCK: { bg: 'bg-purple-100 border-purple-300', text: 'text-purple-800', label: 'BLK' },
  RESOLUTION: { bg: 'bg-emerald-100 border-emerald-300', text: 'text-emerald-800', label: 'RES' },
  INFO: { bg: 'bg-stone-200 border-stone-300', text: 'text-stone-700', label: 'INF' },
};

export const GameLog: React.FC<GameLogProps> = ({ entries }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`absolute bottom-5 left-5 z-30 game-log-panel overflow-hidden transition-all duration-300 ${
        isCollapsed ? 'w-[52px] h-[52px] rounded-2xl' : 'w-[300px] h-[260px]'
      }`}
    >
      {isCollapsed ? (
        <button
          onClick={() => setIsCollapsed(false)}
          className="w-full h-full flex items-center justify-center text-amber-800 hover:scale-110 transition-transform"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </button>
      ) : (
        <>
          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-stone-300/40">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" />
              <h3 className="text-amber-900 font-black text-[10px] tracking-[0.2em] uppercase">
                GAME LOG
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-stone-500 font-extrabold tabular-nums">
                {entries.length}
              </span>
              <button
                onClick={() => setIsCollapsed(true)}
                className="text-stone-500 hover:text-stone-800 transition-colors p-0.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Log content recessed container */}
          <div className="p-2.5 h-[calc(100%-46px)]">
            <div ref={scrollRef} className="game-log-content h-full p-2.5 overflow-y-auto space-y-2 scrollbar-thin">
              <AnimatePresence>
                {entries.length === 0 ? (
                  <div className="text-stone-400 italic text-[11px] text-center mt-10">
                    No game events recorded yet...
                  </div>
                ) : (
                  entries.map((entry) => {
                    const style = LOG_TYPE_STYLES[entry.type];
                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -8, height: 0 }}
                        animate={{ opacity: 1, x: 0, height: 'auto' }}
                        className="flex gap-2 items-start text-xs leading-relaxed"
                      >
                        <span className={`shrink-0 ${style.bg} ${style.text} border px-1.5 py-0.5 rounded text-[8px] font-black tracking-wider mt-0.5 shadow-2xs`}>
                          {style.label}
                        </span>
                        <span className="text-stone-800 font-medium">{entry.text}</span>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};
