import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { calculatePlayerPositions } from '../../hooks/usePlayerPosition';
import { PlayerSeat } from './PlayerSeat';
import { CoinPile } from './CoinPile';
import { CoinAnimations } from './CoinAnimations';
import CardBackImg from '../../assets/Coup Assets/CardBack.png';

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
      <div className="flex items-center justify-center h-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-stone-600 text-xs font-black tracking-widest uppercase flex items-center gap-3 font-coup"
        >
          <div className="w-5 h-5 rounded-full border-2 border-stone-400 border-t-amber-500 animate-spin" />
          <span>Setting up 3D Table...</span>
        </motion.div>
      </div>
    );
  }

  const currentTurnPlayerId = gameState.players[gameState.turnIndex]?.id;
  const pendingAction = gameState.pendingAction;
  const pendingActor = pendingAction
    ? gameState.players.find((p) => p.id === pendingAction.sourcePlayerId)
    : null;
  const pendingTarget = pendingAction?.targetPlayerId
    ? gameState.players.find((p) => p.id === pendingAction.targetPlayerId)
    : null;

  return (
    <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-4 select-none pb-28 sm:pb-36">
      
      {/* 3D Circular/Oval Wooden Gaming Table (Matching Image 2) */}
      <div className="neu-wood-table w-[78%] sm:w-[80%] max-w-[820px] h-[260px] sm:h-[290px] lg:h-[320px]">
        
        {/* Recessed Table Inner Felt */}
        <div className="neu-table-inner-felt">
          
          {/* Subtle concentric table inlay */}
          <div className="absolute inset-4 rounded-full border border-amber-400/20 pointer-events-none" />

          {/* Central Table Centerpiece: Deck & Bank Coins */}
          <div
            className="absolute z-10 flex items-center justify-center gap-6 sm:gap-8"
            style={{
              top: '55%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Court Deck Tray */}
            <div className="flex flex-col items-center">
              <div className="relative w-12 h-16 sm:w-14 sm:h-18 rounded-lg overflow-hidden border border-amber-300/40 shadow-md">
                <img
                  src={CardBackImg}
                  alt="Court Deck"
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
              <div className="px-2.5 py-0.5 rounded-full bg-black/60 border border-amber-400/30 text-[9px] font-black text-amber-200 mt-1 uppercase tracking-wider">
                DECK {gameState.deck?.length ?? 3}
              </div>
            </div>

            {/* 3D Bank Coin Pile */}
            <CoinPile coinPile={gameState.coinPile} />
          </div>

          {/* Active Action Heraldic Plaque (Floating above center) */}
          <AnimatePresence>
            {pendingAction && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: -10 }}
                className="absolute z-20 px-4 py-1.5 rounded-full neu-flat shadow-lg flex items-center gap-2 border border-amber-400"
                style={{
                  top: '24%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span className="text-xs font-black text-stone-800 uppercase tracking-wide">
                  {pendingActor?.name || 'Player'} declares{' '}
                  <span className="text-amber-700 font-black">
                    {pendingAction.action.claimedRole || pendingAction.action.type}
                  </span>
                  {pendingTarget ? ` on ${pendingTarget.name}` : ''}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Coin Toss Dynamic Particle Animations */}
          <CoinAnimations />
        </div>

        {/* Opponents seated on 3D Neumorphic Podiums along the SIDES & PERIMETER of the board */}
        {opponentPlayers.map((player) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1],
              delay: player.seatIndex * 0.08,
            }}
            style={{
              position: 'absolute',
              left: `calc(50% + ${player.position.x}%)`,
              top: `calc(50% + ${player.position.y}%)`,
              transform: 'translate(-50%, -50%)',
              zIndex: 30,
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
