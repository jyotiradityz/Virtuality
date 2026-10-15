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
  INFO: { bg: 'bg-stone-100 border-stone-300', text: 'text-stone-700', label: 'INF' },
};

export const GameLog: React.FC<GameLogProps> = ({ entries }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className={`fixed bottom-28 sm:bottom-6 left-3 sm:left-6 z-30 neu-flat overflow-hidden transition-all duration-300 ${
        isCollapsed ? 'w-[42px] h-[42px] rounded-xl' : 'w-[280px] sm:w-[320px] h-[200px] sm:h-[240px] rounded-2xl'
      }`}
    >
      {isCollapsed ? (
        <button
          onClick={() => setIsCollapsed(false)}
          className="w-full h-full flex items-center justify-center text-stone-600 hover:text-amber-600 transition-colors cursor-pointer"
          title="Open Action History"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </button>
      ) : (
        <>
          {/* Header */}
          <div className="px-3.5 py-2 flex items-center justify-between border-b border-stone-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 shadow-sm" />
              <h3 className="text-stone-800 font-black text-[10px] tracking-wider uppercase">
                Action History
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-stone-500 font-bold tabular-nums">
                {entries.length}
              </span>
              <button
                onClick={() => setIsCollapsed(true)}
                className="text-stone-400 hover:text-stone-700 transition-colors p-0.5 cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Log content */}
          <div className="p-2 h-[calc(100%-38px)]">
            <div ref={scrollRef} className="neu-inset-sm h-full p-2 overflow-y-auto space-y-1.5 scrollbar-thin rounded-xl">
              <AnimatePresence>
                {entries.length === 0 ? (
                  <div className="text-stone-400 italic text-[11px] text-center mt-6">
                    Game starting... No actions yet.
                  </div>
                ) : (
                  entries.map((entry) => {
                    const style = LOG_TYPE_STYLES[entry.type];
                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-1.5 items-start text-[11px] leading-tight"
                      >
                        <span className={`shrink-0 ${style.bg} ${style.text} border px-1.5 py-0.5 rounded text-[8px] font-black tracking-wider`}>
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
