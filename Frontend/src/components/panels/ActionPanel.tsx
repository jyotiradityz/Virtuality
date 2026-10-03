import React, { useState } from 'react';
import type { GameAction, ActionOption, ActionType } from '../../types/game';
import { getLegalActions } from '../../game/rules';
import { useGameStore } from '../../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';

interface ActionPanelProps {
  selectedCardId?: string | null;
  onPerformAction: (action: GameAction) => void;
}

const ACTION_ICONS: Record<ActionType, string> = {
  INCOME: '💰',
  FOREIGN_AID: '🤝',
  TAX: '👑',
  STEAL: '⚓',
  ASSASSINATE: '🗡️',
  EXCHANGE: '📜',
  COUP: '⚔️',
};

const ACTION_DESCRIPTIONS: Record<ActionType, string> = {
  INCOME: 'Take 1 coin',
  FOREIGN_AID: 'Take 2 coins',
  TAX: 'Claim Duke, take 3 coins',
  STEAL: 'Claim Captain, steal 2 coins',
  ASSASSINATE: 'Claim Assassin, pay 3 to eliminate',
  EXCHANGE: 'Claim Ambassador, swap cards',
  COUP: 'Pay 7 to eliminate (unblockable)',
};

export const ActionPanel: React.FC<ActionPanelProps> = ({
  onPerformAction,
}) => {
  const gameState = useGameStore((state) => state.gameState);
  const [pendingTargetAction, setPendingTargetAction] = useState<ActionOption | null>(null);

  if (!gameState || gameState.phase !== 'ACTION_SELECTION') return null;

  const localPlayer = gameState.players.find((p) => p.isLocalPlayer);
  if (!localPlayer || !localPlayer.isAlive) return null;

  const isLocalTurn = gameState.players[gameState.turnIndex]?.id === localPlayer.id;

  if (!isLocalTurn) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-5 right-5 z-30"
      >
        <div className="action-bar rounded-2xl px-5 py-4 min-w-[280px]">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <div>
              <div className="text-amber-800 text-[10px] font-black tracking-[0.2em] uppercase mb-0.5">
                OPPONENT TURN
              </div>
              <div className="text-stone-600 text-xs font-semibold">
                {gameState.players[gameState.turnIndex]?.name} is deciding...
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const legalOptions = getLegalActions(gameState, localPlayer);
  const livingOpponents = gameState.players.filter((p) => p.isAlive && p.id !== localPlayer.id);

  const handleActionClick = (option: ActionOption) => {
    if (option.disabled) return;
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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="absolute bottom-5 right-5 z-30 w-[340px]"
    >
      <div className="action-bar rounded-3xl p-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-amber-800 text-[10px] font-black tracking-[0.2em] uppercase">
              YOUR TURN
            </span>
          </div>
          <div className="neu-concave px-3 py-1 rounded-full">
            <span className="text-amber-900 text-xs font-black">
              💰 {localPlayer.coins} Coins
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {pendingTargetAction ? (
            <motion.div
              key="target-picker"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-2"
            >
              <div className="text-[10px] font-black text-amber-800 text-center mb-2 tracking-wide uppercase">
                {ACTION_ICONS[pendingTargetAction.action.type]} SELECT TARGET FOR {pendingTargetAction.label}
              </div>
              {livingOpponents.map((opp) => (
                <button
                  key={opp.id}
                  onClick={() => handleSelectTarget(opp.id)}
                  className="action-btn primary w-full flex items-center justify-between"
                >
                  <span className="flex items-center gap-2 text-white">
                    <div className="w-2 h-2 rounded-full bg-white" />
                    {opp.name}
                  </span>
                  <span className="text-xs text-amber-100 font-bold">💰 {opp.coins}</span>
                </button>
              ))}
              <button
                onClick={() => setPendingTargetAction(null)}
                className="action-btn w-full text-center text-stone-600 font-bold"
              >
                ← Back
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="action-list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-2 max-h-[340px] overflow-y-auto scrollbar-thin pr-1"
            >
              {legalOptions.map((opt) => (
                <button
                  key={opt.action.type}
                  disabled={opt.disabled}
                  onClick={() => handleActionClick(opt)}
                  className={`action-btn w-full text-left flex items-center gap-3 ${
                    opt.action.type === 'COUP' ? 'primary' : ''
                  }`}
                >
                  <span className="text-lg leading-none">{ACTION_ICONS[opt.action.type]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-black tracking-wide">{opt.label}</div>
                    <div className="text-[10px] text-stone-500 truncate font-semibold">
                      {opt.disabled && opt.reason ? opt.reason : ACTION_DESCRIPTIONS[opt.action.type]}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {opt.cost && opt.cost > 0 ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-black tabular-nums">
                        💰{opt.cost}
                      </span>
                    ) : null}
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
