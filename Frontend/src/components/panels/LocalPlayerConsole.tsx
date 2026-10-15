import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Player, GameAction, ActionOption, ActionType } from '../../types/game';
import { getLegalActions } from '../../game/rules';
import { useGameStore } from '../../store/gameStore';
import { InfluenceCard } from '../shared/InfluenceCard';
import {
  IncomeIcon,
  ForeignAidIcon,
  TaxIcon,
  StealIcon,
  AssassinateIcon,
  ExchangeIcon,
  CoupSwordsIcon,
  TargetIcon,
  CoinCrestIcon,
} from '../shared/CoupIcons';
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
  role?: string;
  effect: string;
  icon: React.ReactNode;
  tintClass: string;
  isCoup?: boolean;
}

export const LocalPlayerConsole: React.FC<LocalPlayerConsoleProps> = ({
  player,
  selectedCardId,
  onCardSelect,
  onPerformAction,
}) => {
  const gameState = useGameStore((state) => state.gameState);
  const [pendingTargetAction, setPendingTargetAction] = useState<ActionOption | null>(null);

  if (!gameState) return null;

  const isMyTurn =
    gameState.phase === 'ACTION_SELECTION' &&
    gameState.players[gameState.turnIndex]?.id === player.id;
  const legalOptions = isMyTurn ? getLegalActions(gameState, player) : [];
  const livingOpponents = gameState.players.filter((p) => p.isAlive && p.id !== player.id);
  const mustCoup = player.coins >= 10;

  // 7 Coup Actions matching Image 2
  const allActions: ActionBoxConfig[] = [
    {
      type: 'INCOME',
      label: 'INCOME',
      effect: '+1',
      icon: <IncomeIcon className="w-4 h-4 text-emerald-600" />,
      tintClass: 'neu-action-green',
    },
    {
      type: 'FOREIGN_AID',
      label: 'FOREIGN AID',
      effect: '+2',
      icon: <ForeignAidIcon className="w-4 h-4 text-teal-600" />,
      tintClass: 'neu-action-green',
    },
    {
      type: 'TAX',
      label: 'TAX',
      role: 'Duke',
      effect: '+3',
      icon: <TaxIcon className="w-4 h-4 text-amber-600" />,
      tintClass: 'neu-action-amber',
    },
    {
      type: 'STEAL',
      label: 'STEAL',
      role: 'Captain',
      effect: '2 Coins',
      icon: <StealIcon className="w-4 h-4 text-slate-700" />,
      tintClass: 'neu-action-card',
    },
    {
      type: 'ASSASSINATE',
      label: 'ASSASSINATE',
      role: 'Assassin',
      effect: '-3 Coins',
      icon: <AssassinateIcon className="w-4 h-4 text-red-600" />,
      tintClass: 'neu-action-red',
    },
    {
      type: 'EXCHANGE',
      label: 'EXCHANGE',
      role: 'Ambassador',
      effect: 'Draw 2',
      icon: <ExchangeIcon className="w-4 h-4 text-purple-600" />,
      tintClass: 'neu-action-purple',
    },
    {
      type: 'COUP',
      label: 'COUP',
      effect: '-7 Coins',
      icon: <CoupSwordsIcon className="w-4 h-4 text-amber-900" />,
      tintClass: 'neu-action-coup',
      isCoup: true,
    },
  ];

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
    <div className="fixed bottom-2 sm:bottom-3 inset-x-0 z-40 flex flex-col items-center select-none px-3 pointer-events-none">
      
      {/* Target Noble Selection Modal Tray */}
      <AnimatePresence>
        {pendingTargetAction && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="mb-2 pointer-events-auto p-4 rounded-2xl neu-flat max-w-md w-full text-center"
          >
            <div className="flex items-center justify-center gap-2 text-xs font-black text-amber-700 uppercase tracking-wider mb-3">
              <TargetIcon className="w-4 h-4 text-amber-600" />
              <span>Choose Target for {pendingTargetAction.label}</span>
            </div>
            <div className="flex gap-2 justify-center flex-wrap">
              {livingOpponents.map((opp) => (
                <button
                  key={opp.id}
                  onClick={() => handleSelectTarget(opp.id)}
                  className="neu-btn px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2"
                >
                  <span className="text-stone-800">{opp.name}</span>
                  <div className="neu-coin-stack">
                    <div className="neu-3d-coin">
                      <CoinCrestIcon className="w-2.5 h-2.5 text-amber-950" />
                    </div>
                    <span>{opp.coins}</span>
                  </div>
                </button>
              ))}
              <button
                onClick={() => setPendingTargetAction(null)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-stone-500 hover:text-stone-800 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Console Container */}
      <div className="pointer-events-auto flex flex-col items-center gap-2 w-full max-w-3xl sm:max-w-[760px]">
        
        {/* ACTION MENU (Directly matching Image 2) */}
        {isMyTurn ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full p-2.5 sm:p-3 rounded-2xl neu-flat flex flex-col items-center"
          >
            {/* Header: Action Menu tag & prompt */}
            <div className="flex items-center justify-between w-full px-2 pb-1.5 border-b border-stone-200 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span className="text-xs font-black text-stone-800 uppercase tracking-wider">
                  {mustCoup ? 'MANDATORY COUP (10+ COINS)' : 'ACTION MENU • CHOOSE YOUR MOVE'}
                </span>
              </div>
              <span className="text-xs font-extrabold text-amber-700">
                {player.coins} Coins Available
              </span>
            </div>

            {/* 7 Action Buttons Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2 w-full">
              {allActions.map((box) => {
                const option = legalOptions.find((opt) => opt.action.type === box.type);
                const isDisabled = option ? option.disabled : true;

                return (
                  <button
                    key={box.type}
                    disabled={isDisabled}
                    onClick={() => handleActionClick(box)}
                    className={`neu-action-card ${box.tintClass}`}
                  >
                    <div className="mb-1">{box.icon}</div>
                    <span className="text-[10px] sm:text-[11px] font-black text-stone-900 uppercase tracking-tight block leading-tight">
                      {box.label}
                    </span>
                    <span className="text-[9px] font-extrabold text-stone-500 block mt-0.5">
                      {box.role ? `${box.role}` : box.effect}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <div className="px-5 py-2 rounded-full neu-flat text-center shadow-sm">
            <span className="text-xs font-extrabold text-stone-600 tracking-wide">
              Waiting for noble's move...
            </span>
          </div>
        )}

        {/* YOUR INFLUENCE DOCK (Directly matching Image 2) */}
        <div className="w-full max-w-xl p-2.5 sm:p-3 rounded-2xl neu-flat flex items-center justify-between">
          
          {/* Left: 3D Coins Stack */}
          <div className="flex flex-col items-center pl-2">
            <div className="relative flex flex-col items-center mb-1">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className="w-8 h-3 rounded-full border border-amber-300 shadow-sm relative"
                  style={{
                    background:
                      idx === 0
                        ? 'radial-gradient(ellipse at 35% 30%, #fef08a 0%, #f59e0b 60%, #b45309 100%)'
                        : 'linear-gradient(180deg, #fbbf24 0%, #d97706 70%, #78350f 100%)',
                    marginTop: idx === 0 ? 0 : -5,
                    zIndex: 3 - idx,
                  }}
                />
              ))}
            </div>
            <span className="text-sm sm:text-base font-black text-amber-900 leading-none">
              {player.coins}
            </span>
            <span className="text-[8px] font-extrabold text-stone-400 uppercase tracking-wider">
              COINS
            </span>
          </div>

          {/* Center: YOUR INFLUENCE Cards */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500 mb-1">
              YOUR INFLUENCE
            </span>
            <div className="flex items-center gap-3">
              {player.cards.map((card, idx) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                >
                  <InfluenceCard
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
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Player Avatar & Name */}
          <div className="flex flex-col items-center pr-2">
            <div className="neu-avatar-ring w-11 h-11 sm:w-12 sm:h-12">
              <img src={CaptainAvatar} alt="You" className="w-full h-full object-cover" />
            </div>
            <span className="text-xs font-black text-stone-800 uppercase mt-1 truncate max-w-[70px]">
              {player.name}
            </span>
            <span className="text-[8px] font-extrabold text-emerald-600 uppercase">
              YOU
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
