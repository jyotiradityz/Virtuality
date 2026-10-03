import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Player, GameAction, ActionOption, ActionType } from '../../types/game';
import { getLegalActions } from '../../game/rules';
import { useGameStore } from '../../store/gameStore';
import { InfluenceCard } from '../shared/InfluenceCard';
import CaptainAvatar from '../../assets/Coup Assets/Captain.jpg';

interface LocalPlayerConsoleProps {
  player: Player;
  selectedCardId?: string | null;
  onCardSelect?: (cardId: string) => void;
  onPerformAction: (action: GameAction) => void;
}

interface ActionBoxConfig {
  type: ActionType;
  label: string;
  icon: string;
  subtitle: string;
  isAggressive?: boolean;
}

const ACTION_BOX_CONFIGS: ActionBoxConfig[] = [
  { type: 'INCOME', label: 'INCOME', icon: '💵', subtitle: '+1' },
  { type: 'FOREIGN_AID', label: 'FOREIGN AID', icon: '🌐', subtitle: '+2' },
  { type: 'TAX', label: 'TAX', icon: '💰', subtitle: 'Duke' },
  { type: 'STEAL', label: 'STEAL', icon: '👮', subtitle: 'Captain' },
  { type: 'ASSASSINATE', label: 'ASSASSINATE', icon: '💀', subtitle: '-3 Assassin', isAggressive: true },
  { type: 'EXCHANGE', label: 'EXCHANGE', icon: '🤝', subtitle: 'Ambassador' },
  { type: 'COUP', label: 'COUP', icon: '⚔️', subtitle: '-7', isAggressive: true },
];

export const LocalPlayerConsole: React.FC<LocalPlayerConsoleProps> = ({
  player,
  selectedCardId,
  onCardSelect,
  onPerformAction,
}) => {
  const gameState = useGameStore((state) => state.gameState);
  const [pendingTargetAction, setPendingTargetAction] = useState<ActionOption | null>(null);

  if (!gameState) return null;

  const isMyTurn = gameState.phase === 'ACTION_SELECTION' && gameState.players[gameState.turnIndex]?.id === player.id;
  const legalOptions = isMyTurn ? getLegalActions(gameState, player) : [];
  const livingOpponents = gameState.players.filter((p) => p.isAlive && p.id !== player.id);

  const handleActionClick = (boxConfig: ActionBoxConfig) => {
    if (!isMyTurn) return;
    const option = legalOptions.find((opt) => opt.action.type === boxConfig.type);
    if (!option || option.disabled) return;

    const actionType = option.action.type;
    if (actionType === 'STEAL' || actionType === 'ASSASSINATE' || actionType === 'COUP') {
      if (livingOpponents.length === 1) {
        onPerformAction({ ...option.action, targetId: livingOpponents[0].id });
      } else {
        setPendingTargetAction(option);
      }
    } else {
      onPerformAction(option.action);
    }
  };

  const handleSelectTarget = (targetId: string) => {
    if (!pendingTargetAction) return;
    onPerformAction({ ...pendingTargetAction.action, targetId });
    setPendingTargetAction(null);
  };

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center select-none max-w-[95vw]">
      {/* Target Picker Modal overlay if choosing target */}
      <AnimatePresence>
        {pendingTargetAction && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mb-2 neu-convex p-3 rounded-2xl w-full max-w-md border-2 border-amber-500/50 text-center shadow-2xl"
          >
            <div className="text-xs font-black text-amber-900 mb-2 uppercase tracking-wide">
              🎯 SELECT TARGET FOR {pendingTargetAction.label}
            </div>
            <div className="flex gap-2 justify-center flex-wrap">
              {livingOpponents.map((opp) => (
                <button
                  key={opp.id}
                  onClick={() => handleSelectTarget(opp.id)}
                  className="action-btn primary px-4 py-2 text-xs font-black flex items-center gap-1.5"
                >
                  <span>{opp.name}</span>
                  <span className="text-[10px] text-amber-100">💰{opp.coins}</span>
                </button>
              ))}
              <button
                onClick={() => setPendingTargetAction(null)}
                className="action-btn px-3 py-2 text-xs font-bold text-stone-600"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Console Box holding Action Menu + Influence Card Panel */}
      <div className="flex flex-col items-center space-y-2">
        {/* 1. ACTION MENU ROW */}
        <div className="relative neu-convex rounded-2xl p-2 flex flex-col items-center border border-white/80 shadow-xl">
          {/* Tab Header Badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ece7dc] px-4 py-0.5 rounded-full border border-stone-300 shadow-sm">
            <span className="text-stone-700 text-[9px] font-black uppercase tracking-widest">
              Action Menu
            </span>
          </div>

          {/* Action Boxes Row */}
          <div className="flex items-center gap-1.5 pt-2 px-1">
            {ACTION_BOX_CONFIGS.map((box) => {
              const option = legalOptions.find((opt) => opt.action.type === box.type);
              const isDisabled = !isMyTurn || (option ? option.disabled : true);

              return (
                <motion.button
                  key={box.type}
                  whileHover={!isDisabled ? { y: -3, scale: 1.03 } : {}}
                  whileTap={!isDisabled ? { scale: 0.96 } : {}}
                  disabled={isDisabled}
                  onClick={() => handleActionClick(box)}
                  className={`
                    w-[92px] h-[95px] rounded-xl flex flex-col items-center justify-between p-2 transition-all relative
                    ${isDisabled ? 'opacity-40 grayscale cursor-not-allowed neu-pressed' : 'neu-convex cursor-pointer'}
                    ${
                      box.isAggressive
                        ? 'border-2 border-red-400/40 hover:border-red-500 hover:shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                        : 'border-2 border-emerald-400/40 hover:border-emerald-500 hover:shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                    }
                  `}
                >
                  {/* Icon */}
                  <span className="text-2xl leading-none mt-1">{box.icon}</span>

                  {/* Action Label */}
                  <span className="text-[10px] font-black text-stone-900 tracking-tighter uppercase text-center leading-tight">
                    {box.label}
                  </span>

                  {/* Subtitle / Role / Cost */}
                  <span className={`text-[9px] font-extrabold truncate max-w-full ${box.isAggressive ? 'text-red-700' : 'text-emerald-700'}`}>
                    {box.subtitle}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* 2. YOUR INFLUENCE PLAYER SEAT PANEL */}
        <div className="relative neu-convex rounded-2xl p-3 flex items-center justify-between w-full border border-white/80 shadow-2xl px-6 min-w-[620px]">
          {/* Tab Header Badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ece7dc] px-4 py-0.5 rounded-full border border-stone-300 shadow-sm">
            <span className="text-amber-800 text-[9px] font-black uppercase tracking-widest">
              YOUR INFLUENCE
            </span>
          </div>

          {/* Left: 3D Coin Stack + Total Counter */}
          <div className="flex items-center gap-3 pr-4 border-r border-stone-300/60">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-0.5 mb-1">
                {Array.from({ length: Math.min(player.coins, 4) }).map((_, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 border border-amber-700 shadow-sm"
                    style={{ marginLeft: i > 0 ? '-6px' : '0', zIndex: i }}
                  />
                ))}
              </div>
              <span className="text-stone-900 font-black text-2xl tabular-nums leading-none">
                {player.coins}
              </span>
              <span className="text-stone-500 text-[8px] font-extrabold uppercase tracking-widest mt-0.5">
                COINS
              </span>
            </div>
          </div>

          {/* Center: 2 Large Influence Cards */}
          <div className="flex items-center gap-4 px-4">
            {player.cards.map((card) => (
              <InfluenceCard
                key={card.id}
                role={card.role}
                isRevealed={card.isRevealed}
                isSelected={selectedCardId === card.id}
                isLarge
                onClick={() => {
                  if (!card.isRevealed && onCardSelect) {
                    onCardSelect(card.id);
                  }
                }}
              />
            ))}
          </div>

          {/* Right: Round Avatar + Name */}
          <div className="flex items-center gap-3 pl-4 border-l border-stone-300/60">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500 shadow-md">
              <img src={CaptainAvatar} alt={player.name} className="w-full h-full object-cover" />
            </div>
            <div className="text-left">
              <div className="text-stone-900 font-black text-sm uppercase tracking-wide truncate max-w-[100px]">
                {player.name}
              </div>
              <div className="text-amber-700 text-[9px] font-extrabold uppercase tracking-widest">
                YOU
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
