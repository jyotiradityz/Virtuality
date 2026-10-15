import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { calculatePlayerPositions, type Position } from '../../hooks/usePlayerPosition';

interface FlyingCoin {
  id: string;
  from: Position;
  to: Position;
  delay: number;
}

// Bank center is { x: 0, y: 0 } (center of table felt)
// Local Player Console is { x: 0, y: 65 } (docked below the table)
const BANK_POS: Position = { x: 0, y: 0 };
const LOCAL_PLAYER_POS: Position = { x: 0, y: 65 };

export const CoinAnimations: React.FC = () => {
  const gameState = useGameStore((state) => state.gameState);
  const [activeCoins, setActiveCoins] = useState<FlyingCoin[]>([]);
  const [lastLogId, setLastLogId] = useState<string | null>(null);

  useEffect(() => {
    if (!gameState || gameState.gameLog.length === 0) return;

    const latestLog = gameState.gameLog[gameState.gameLog.length - 1];
    if (latestLog.id === lastLogId) return;
    setLastLogId(latestLog.id);

    const logText = latestLog.text;
    const playerPositions = calculatePlayerPositions(gameState.players);

    const getPos = (player: any): Position => {
      if (player.isLocalPlayer) return LOCAL_PLAYER_POS;
      const found = playerPositions.find((p) => p.id === player.id);
      return found?.position || BANK_POS;
    };

    let newCoins: FlyingCoin[] = [];
    const timestamp = Date.now();

    // 1. BANK COLLECTION (Income, Foreign Aid, Tax)
    if (logText.includes('collected') && logText.includes('coin')) {
      const actor = gameState.players.find((p) => logText.startsWith(p.name));
      if (actor) {
        const targetPos = getPos(actor);
        const count = logText.includes('3 coins') ? 3 : logText.includes('2 coins') ? 2 : 1;
        for (let i = 0; i < count; i++) {
          newCoins.push({
            id: `coin-bank-${timestamp}-${i}`,
            from: BANK_POS,
            to: targetPos,
            delay: i * 0.12,
          });
        }
      }
    }
    // 2. STEALING (Steal action)
    else if (logText.includes('stole') && logText.includes('coins')) {
      const stealer = gameState.players.find((p) => logText.startsWith(p.name));
      const victim = gameState.players.find((p) => p.name !== stealer?.name && logText.includes(p.name));

      if (stealer && victim) {
        const fromPos = getPos(victim);
        const toPos = getPos(stealer);
        for (let i = 0; i < 2; i++) {
          newCoins.push({
            id: `coin-steal-${timestamp}-${i}`,
            from: fromPos,
            to: toPos,
            delay: i * 0.15,
          });
        }
      }
    }

    if (newCoins.length > 0) {
      setActiveCoins((prev) => [...prev, ...newCoins]);
      setTimeout(() => {
        setActiveCoins((prev) => prev.filter((c) => !newCoins.some((nc) => nc.id === c.id)));
      }, 1600);
    }
  }, [gameState?.gameLog]);

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-visible">
      <AnimatePresence>
        {activeCoins.map((coin) => (
          <motion.div
            key={coin.id}
            initial={{
              left: `calc(50% + ${coin.from.x}%)`,
              top: `calc(50% + ${coin.from.y}%)`,
              scale: 0.4,
              opacity: 0,
              rotate: 0,
            }}
            animate={{
              left: `calc(50% + ${coin.to.x}%)`,
              top: `calc(50% + ${coin.to.y}%)`,
              scale: [0.4, 1.4, 1, 0.6],
              opacity: [0, 1, 1, 0],
              rotate: 360,
            }}
            transition={{
              duration: 1.1,
              delay: coin.delay,
              ease: [0.25, 0.8, 0.25, 1],
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 border border-amber-600 shadow-xl flex items-center justify-center font-black text-amber-950 text-xs"
          >
            <span className="w-5 h-5 rounded-full border border-amber-500/80 flex items-center justify-center text-[10px] font-black tracking-tighter">
              C
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
