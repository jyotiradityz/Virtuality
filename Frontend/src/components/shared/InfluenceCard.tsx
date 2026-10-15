import React from 'react';
import { motion } from 'framer-motion';
import type { Role } from '../../types/game';
import {
  DukeIcon,
  AssassinIcon,
  CaptainIcon,
  AmbassadorIcon,
  ContessaIcon,
} from './CoupIcons';

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

export const InfluenceCard: React.FC<InfluenceCardProps> = ({
  role,
  isHidden = false,
  isRevealed = false,
  isSelected = false,
  isLarge = false,
  onClick,
}) => {
  const sizeClass = isLarge
    ? 'w-[96px] h-[140px] sm:w-[114px] sm:h-[164px]'
    : 'w-[44px] h-[64px] sm:w-[52px] sm:h-[74px]';

  // Revealed / Dead Card
  if (isRevealed) {
    return (
      <div className={`${sizeClass} neu-card dead relative rounded-xl overflow-hidden shrink-0`}>
        <img
          src={role ? ROLE_IMAGES[role] : CardBackImg}
          alt={role || 'Eliminated Card'}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-0 bg-stone-950/75 backdrop-blur-[1px] flex flex-col items-center justify-center p-1 text-center">
          <div className="text-red-400 font-black text-[9px] sm:text-[10px] tracking-wider uppercase">
            ✕ DEAD
          </div>
          {role && (
            <div className="text-amber-200/90 font-bold text-[8px] sm:text-[9px] uppercase mt-0.5">
              {role}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Hidden Card (Opponent hand or face-down deck)
  if (isHidden) {
    return (
      <motion.div
        whileHover={onClick ? { scale: 1.05, y: -4 } : {}}
        className={`${sizeClass} neu-card relative rounded-xl overflow-hidden shrink-0`}
      >
        <img
          src={CardBackImg}
          alt="Hidden Influence"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-0 border border-black/10 rounded-xl pointer-events-none" />
      </motion.div>
    );
  }

  const renderRoleIcon = () => {
    switch (role) {
      case 'Duke':
        return <DukeIcon className="w-3.5 h-3.5 text-amber-500" />;
      case 'Assassin':
        return <AssassinIcon className="w-3.5 h-3.5 text-red-500" />;
      case 'Captain':
        return <CaptainIcon className="w-3.5 h-3.5 text-sky-500" />;
      case 'Ambassador':
        return <AmbassadorIcon className="w-3.5 h-3.5 text-emerald-500" />;
      case 'Contessa':
        return <ContessaIcon className="w-3.5 h-3.5 text-pink-500" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.05, y: -6 } : {}}
      whileTap={onClick ? { scale: 0.97 } : {}}
      onClick={onClick}
      className={`
        ${sizeClass} neu-card relative rounded-xl overflow-hidden shrink-0
        ${isSelected ? 'selected ring-3 ring-amber-500' : ''}
      `}
    >
      <img
        src={role ? ROLE_IMAGES[role] : CardBackImg}
        alt={role || 'Influence'}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Subtle Corner Role Crest Badge for Local Hand */}
      {isLarge && role && (
        <div className="absolute top-1.5 left-1.5 z-10 w-6 h-6 rounded-full bg-white/90 backdrop-blur-sm border border-stone-300 shadow-sm flex items-center justify-center">
          {renderRoleIcon()}
        </div>
      )}

      {/* Clean White Bevel Border */}
      <div className="absolute inset-0 border-2 border-white/60 rounded-xl pointer-events-none" />
    </motion.div>
  );
};
