import React from 'react';
import { motion } from 'framer-motion';
import type { Player } from '../../types/game';
import { InfluenceCard } from '../shared/InfluenceCard';

interface PlayerSeatProps {
  player: Player;
  isTurn: boolean;
  selectedCardId?: string | null;
  onCardSelect?: (cardId: string) => void;
  isTargetable?: boolean;
  onTargetClick?: () => void;
}

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  isTurn,
  selectedCardId,
  onCardSelect,
  isTargetable = false,
  onTargetClick,
}) => {
  const activeCount = player.cards.filter((c) => !c.isRevealed).length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      onClick={isTargetable ? onTargetClick : undefined}
      className={`
        player-seat-panel relative p-3.5 flex flex-col items-center gap-2.5
        ${isTurn ? 'is-turn' : ''}
        ${!player.isAlive ? 'eliminated' : ''}
        ${isTargetable ? 'cursor-pointer hover:scale-105 transition-transform' : ''}
        ${player.isLocalPlayer ? 'min-w-[230px]' : 'min-w-[160px]'}
      `}
    >
      {/* Turn Indicator Pill */}
      {isTurn && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-4 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="turn-indicator px-4 py-1 flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-amber-800 text-[9px] font-black tracking-[0.2em] uppercase">
              {player.isLocalPlayer ? 'YOUR TURN' : 'TURN'}
            </span>
          </div>
        </motion.div>
      )}

      {/* Header Row */}
      <div className="flex items-center justify-between w-full px-1">
        <div className="flex items-center gap-2">
          {/* Status Dot */}
          <div className={`w-2.5 h-2.5 rounded-full ${player.isAlive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} />
          {/* Player Name */}
          <span className={`font-black text-xs truncate max-w-[100px] ${player.isLocalPlayer ? 'text-amber-700' : 'text-stone-800'}`}>
            {player.name}
            {player.isLocalPlayer && (
              <span className="text-amber-600 text-[9px] ml-1 font-bold">(YOU)</span>
            )}
          </span>
        </div>
        {/* Influence Count Badge */}
        <span className={`status-badge ${player.isAlive ? 'status-alive' : 'status-eliminated'}`}>
          {player.isAlive ? `${activeCount} INF` : 'OUT'}
        </span>
      </div>

      {/* Coins Display - Neumorphic Inset Pill */}
      <div className="neu-concave px-4 py-1.5 rounded-full flex items-center gap-2 w-full justify-center">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: Math.min(player.coins, 5) }).map((_, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 border border-amber-600/60 shadow-sm"
              style={{ marginLeft: i > 0 ? '-6px' : '0', zIndex: i }}
            />
          ))}
          {player.coins > 5 && (
            <span className="text-amber-700 text-[9px] font-bold ml-0.5">+{player.coins - 5}</span>
          )}
        </div>
        <span className="text-amber-800 font-black text-xs">{player.coins}</span>
        <span className="text-stone-500 text-[9px] font-extrabold uppercase">COINS</span>
      </div>

      {/* Cards Display */}
      <div className="flex gap-2.5 mt-1">
        {player.cards.map((card) => (
          <InfluenceCard
            key={card.id}
            role={card.role}
            isHidden={!player.isLocalPlayer && !card.isRevealed}
            isRevealed={card.isRevealed}
            isSelected={selectedCardId === card.id}
            isLarge={player.isLocalPlayer}
            onClick={() => {
              if (player.isLocalPlayer && !card.isRevealed && onCardSelect) {
                onCardSelect(card.id);
              }
            }}
          />
        ))}
      </div>

      {/* Target Ring */}
      {isTargetable && (
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 rounded-[24px] border-2 border-dashed border-amber-500 pointer-events-none"
        />
      )}
    </motion.div>
  );
};
