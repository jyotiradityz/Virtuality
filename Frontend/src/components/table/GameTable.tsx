import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { calculatePlayerPositions } from '../../hooks/usePlayerPosition';
import { PlayerSeat } from './PlayerSeat';
import { CoinPile } from './CoinPile';

interface GameTableProps {
  selectedCardId?: string | null;
  onCardSelect?: (cardId: string) => void;
}

export const GameTable: React.FC<GameTableProps> = ({ selectedCardId, onCardSelect }) => {
  const gameState = useGameStore((state) => state.gameState);

  const opponentPlayers = useMemo(() => {
    if (!gameState) return [];
    return calculatePlayerPositions(gameState.players).filter((p) => !p.isLocalPlayer);
  }, [gameState]);

  if (!gameState) {
    return (
      <div className="coup-table-container flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-stone-500 text-sm font-bold tracking-widest uppercase"
        >
          Loading Table...
        </motion.div>
      </div>
    );
  }

  const currentTurnPlayerId = gameState.players[gameState.turnIndex]?.id;

  return (
    <div className="coup-table-container relative flex items-center justify-center w-full h-full">
      {/* Subtle Ambient Glow behind Table */}
      <div className="absolute w-[800px] h-[500px] rounded-[50%] bg-amber-200/20 blur-3xl pointer-events-none" />

      {/* 3D Table Surface */}
      <div className="coup-table-surface relative w-[860px] h-[500px] flex items-center justify-center">
        {/* Table Felt */}
        <div className="coup-table-felt absolute inset-0 rounded-[120px]">
          {/* Inner decorative seam */}
          <div className="absolute inset-4 rounded-[100px] border border-amber-900/10 pointer-events-none" />
          <div className="absolute inset-[26%] rounded-full border border-amber-900/5 pointer-events-none" />
        </div>

        {/* Central Coin Treasury */}
        <div className="absolute z-10" style={{ transform: 'translateY(-30px)' }}>
          <CoinPile coinPile={gameState.coinPile} />
        </div>

        {/* Opponent Player Seats */}
        {opponentPlayers.map((player) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1], delay: player.seatIndex * 0.1 }}
            className="absolute z-20"
            style={{
              left: `calc(50% + ${player.position.x}px)`,
              top: `calc(50% + ${player.position.y}px)`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <PlayerSeat
              player={player}
              isTurn={player.id === currentTurnPlayerId}
              selectedCardId={selectedCardId}
              onCardSelect={onCardSelect}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
