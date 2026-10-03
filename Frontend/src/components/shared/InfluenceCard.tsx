import React from 'react';
import { motion } from 'framer-motion';
import type { Role } from '../../types/game';

// Import character assets
import AssassinImg from '../../assets/Coup Assets/Assasin.jpg';
import DukeImg from '../../assets/Coup Assets/Duke.jpg';
import CaptainImg from '../../assets/Coup Assets/Captain.jpg';
import AmbassadorImg from '../../assets/Coup Assets/Ambsador.jpg';
import ContessaImg from '../../assets/Coup Assets/Contessa.jpg';
import CardBackImg from '../../assets/Coup Assets/CardBack.png';

interface InfluenceCardProps {
  role?: Role;
  isHidden?: boolean;
  isRevealed?: boolean;
  isSelected?: boolean;
  isLarge?: boolean;
  onClick?: () => void;
}

const ROLE_IMAGES: Record<Role, string> = {
  Duke: DukeImg,
  Assassin: AssassinImg,
  Captain: CaptainImg,
  Ambassador: AmbassadorImg,
  Contessa: ContessaImg,
};

const ROLE_ACCENTS: Record<Role, { text: string; bg: string; border: string }> = {
  Duke: { text: 'text-amber-800', bg: 'bg-amber-100/90', border: 'border-amber-400' },
  Assassin: { text: 'text-purple-900', bg: 'bg-purple-100/90', border: 'border-purple-400' },
  Captain: { text: 'text-sky-900', bg: 'bg-sky-100/90', border: 'border-sky-400' },
  Ambassador: { text: 'text-emerald-900', bg: 'bg-emerald-100/90', border: 'border-emerald-400' },
  Contessa: { text: 'text-rose-900', bg: 'bg-rose-100/90', border: 'border-rose-400' },
};

const ROLE_ICONS: Record<Role, string> = {
  Duke: '👑',
  Assassin: '🗡️',
  Captain: '⚓',
  Ambassador: '📜',
  Contessa: '🛡️',
};

export const InfluenceCard: React.FC<InfluenceCardProps> = ({
  role,
  isHidden = false,
  isRevealed = false,
  isSelected = false,
  isLarge = false,
  onClick,
}) => {
  const sizeClass = isLarge
    ? 'w-[124px] h-[175px]'
    : 'w-[74px] h-[104px]';

  // Revealed / Dead card
  if (isRevealed) {
    return (
      <div className={`${sizeClass} relative rounded-xl overflow-hidden coup-card dead`}>
        <img
          src={role ? ROLE_IMAGES[role] : CardBackImg}
          alt={role || 'Dead Card'}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        {/* Death overlay */}
        <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-[2px] flex flex-col items-center justify-center p-1 text-center">
          <div className="text-red-400 font-black text-xs uppercase tracking-wider mb-1">✕ ELIMINATED</div>
          <div className="text-stone-300 font-extrabold text-[10px] uppercase">{role}</div>
        </div>
      </div>
    );
  }

  // Hidden face-down card
  if (isHidden) {
    return (
      <motion.div
        animate={{ rotateY: [0, 1.5, 0, -1.5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className={`${sizeClass} relative rounded-xl overflow-hidden coup-card`}
      >
        <img
          src={CardBackImg}
          alt="Hidden Card"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        <div className="card-shimmer" />
      </motion.div>
    );
  }

  // Visible card (local player's active card)
  const accent = role ? ROLE_ACCENTS[role] : { text: 'text-amber-800', bg: 'bg-amber-100', border: 'border-amber-400' };
  const icon = role ? ROLE_ICONS[role] : '🃏';

  return (
    <motion.div
      whileHover={onClick ? { y: -8, scale: 1.04 } : {}}
      whileTap={onClick ? { scale: 0.96 } : {}}
      onClick={onClick}
      className={`
        ${sizeClass} relative rounded-xl overflow-hidden cursor-pointer
        coup-card ${isSelected ? 'selected' : ''}
      `}
    >
      {/* Character Image */}
      <img
        src={role ? ROLE_IMAGES[role] : CardBackImg}
        alt={role || 'Card'}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Top Left Icon Pill */}
      <div className="absolute top-1.5 left-1.5 z-10">
        <div className="w-6 h-6 rounded-full bg-stone-900/60 backdrop-blur-md flex items-center justify-center text-xs shadow-md border border-white/20">
          {icon}
        </div>
      </div>

      {/* Bottom Role Banner */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-stone-950/90 via-stone-900/60 to-transparent p-2 pt-5 z-10">
        <div className={`${accent.bg} ${accent.text} px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider text-center shadow-sm border ${accent.border}`}>
          {role}
        </div>
      </div>

      {/* Subtle Shimmer */}
      <div className="card-shimmer" />
    </motion.div>
  );
};
