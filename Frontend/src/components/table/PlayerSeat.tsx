import React from 'react';
import { motion } from 'framer-motion';
import type { Player } from '../../types/game';
import { InfluenceCard } from '../shared/InfluenceCard';
import { CoinCrestIcon } from '../shared/CoupIcons';

import CaptainAvatar from '../../assets/Coup Assets/Captain.jpg';
import DukeAvatar from '../../assets/Coup Assets/Duke.jpg';
import AssassinAvatar from '../../assets/Coup Assets/Assasin.jpg';
import ContessaAvatar from '../../assets/Coup Assets/Contessa.jpg';
import AmbassadorAvatar from '../../assets/Coup Assets/Ambsador.jpg';

interface PlayerSeatProps {
  player: Player;
  isTurn: boolean;
  selectedCardId?: string | null;
  onCardSelect?: (cardId: string) => void;
  isTargetable?: boolean;
  onTargetClick?: () => void;
}

const AVATAR_MAP: Record<string, string> = {
  Sam: DukeAvatar,
  Alex: AssassinAvatar,
  Riley: ContessaAvatar,
  Jordan: AmbassadorAvatar,
  Morgan: CaptainAvatar,
};

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  isTurn,
  selectedCardId,
  onCardSelect,
  isTargetable = false,
  onTargetClick,
}) => {
  const avatarImg = AVATAR_MAP[player.name] || CaptainAvatar;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      onClick={isTargetable ? onTargetClick : undefined}
      className={`neu-player-podium select-none ${isTurn ? 'is-turn' : ''} ${
        isTargetable ? 'cursor-pointer ring-2 ring-amber-400 hover:scale-105 transition-transform' : ''
      }`}
    >
      {/* Active Turn Indicator Banner */}
      {isTurn && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-extrabold text-[8px] sm:text-[9px] uppercase tracking-wider shadow-sm flex items-center gap-1"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <span>TURN</span>
        </motion.div>
      )}

      {/* Standing 3D Cards Tray */}
      <div className="flex items-center gap-1.5">
        {player.cards.map((card, idx) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
          >
            <InfluenceCard
              role={card.role}
              isHidden={!card.isRevealed}
              isRevealed={card.isRevealed}
              isSelected={selectedCardId === card.id}
              onClick={() => {
                if (!card.isRevealed && onCardSelect) {
                  onCardSelect(card.id);
                }
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Player Medallion + Name & Coins */}
      <div className="flex items-center gap-2 pt-0.5">
        <div
          className={`neu-avatar-ring shrink-0 ${
            !player.isAlive ? 'opacity-40 grayscale ring-2 ring-red-500' : ''
          }`}
        >
          <img
            src={avatarImg}
            alt={player.name}
            className="w-full h-full object-cover"
            draggable={false}
          />
          {!player.isAlive && (
            <div className="absolute inset-0 bg-red-950/80 flex items-center justify-center text-red-200 font-black text-[9px]">
              OUT
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <span className="font-extrabold text-xs sm:text-sm text-stone-800 max-w-[85px] truncate leading-tight">
            {player.name}
          </span>
          <div className="neu-coin-stack mt-0.5">
            <div className="neu-3d-coin">
              <CoinCrestIcon className="w-2.5 h-2.5 text-amber-950" />
            </div>
            <span>{player.coins}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
