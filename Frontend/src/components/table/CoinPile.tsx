import React from 'react';
import { motion } from 'framer-motion';
import { CoinCrestIcon } from '../shared/CoupIcons';

interface CoinPileProps {
  coinPile?: number;
}

export const CoinPile: React.FC<CoinPileProps> = ({ coinPile = 42 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center select-none"
    >
      {/* 3D Stack of Gold Coins (Cylinder Stack) */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-1">
        <div className="relative flex flex-col items-center">
          {/* Stacked coin discs with realistic 3D offset */}
          {[0, 1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="w-10 h-3.5 sm:w-12 sm:h-4 rounded-full border border-amber-300 shadow-md relative"
              style={{
                background:
                  idx === 0
                    ? 'radial-gradient(ellipse at 35% 30%, #fef08a 0%, #f59e0b 60%, #b45309 100%)'
                    : 'linear-gradient(180deg, #fbbf24 0%, #d97706 70%, #78350f 100%)',
                marginTop: idx === 0 ? 0 : -6,
                zIndex: 5 - idx,
                boxShadow:
                  idx === 4
                    ? '0 6px 12px rgba(0, 0, 0, 0.45)'
                    : '0 2px 4px rgba(120, 53, 15, 0.3)',
              }}
            >
              {idx === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-amber-950 opacity-75">
                  <CoinCrestIcon className="w-2.5 h-2.5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pill Badge matching Image 2: "Bank: 38 Coins" */}
      <div className="px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-amber-400/40 shadow-lg flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_rgba(251,191,36,0.9)]" />
        <span className="text-white font-extrabold text-[11px] sm:text-xs tracking-wide">
          Bank: <span className="text-amber-300 font-black">{coinPile}</span> Coins
        </span>
      </div>
    </motion.div>
  );
};
