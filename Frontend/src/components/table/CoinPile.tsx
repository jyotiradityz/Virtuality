import React from 'react';
import { motion } from 'framer-motion';

interface CoinPileProps {
  coinPile?: number;
}

export const CoinPile: React.FC<CoinPileProps> = ({ coinPile = 42 }) => {
  const visibleCoins = Math.min(coinPile, 12);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="flex flex-col items-center justify-center select-none"
    >
      {/* 3D Stacked Coins Visual */}
      <div className="relative w-28 h-28 flex items-center justify-center mb-2">
        <div className="relative" style={{ perspective: '200px', transformStyle: 'preserve-3d' }}>
          {Array.from({ length: visibleCoins }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i, duration: 0.4 }}
              style={{
                position: i === 0 ? 'relative' : 'absolute',
                left: `${(i % 3) * 12 - 12}px`,
                top: `${Math.floor(i / 3) * 14 - 14}px`,
                zIndex: i,
                transform: `translateZ(${i * 2}px) rotateX(${25 - i * 2}deg)`,
              }}
            >
              <div className="coin">
                ₿
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Treasury Counter - Neumorphic Pill */}
      <div className="neu-convex px-6 py-2 rounded-full flex items-center gap-2.5 shadow-md">
        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
        <span className="text-amber-800 font-black text-xs tracking-[0.2em] uppercase">
          TREASURY
        </span>
        <span className="text-amber-900 font-black text-base tabular-nums">{coinPile}</span>
      </div>
    </motion.div>
  );
};
