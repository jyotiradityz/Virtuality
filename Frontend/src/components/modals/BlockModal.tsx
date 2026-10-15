import React from 'react';
import { motion } from 'framer-motion';
import type { Role } from '../../types/game';
import {
  ContessaIcon,
  CaptainIcon,
  AmbassadorIcon,
  DukeIcon,
  AssassinIcon,
  CheckIcon,
} from '../shared/CoupIcons';

interface BlockModalProps {
  actorName: string;
  actionName: string;
  availableBlockRoles: Role[];
  onBlock: (role: Role) => void;
  onAllow: () => void;
  onChallenge?: () => void;
  canChallenge?: boolean;
}

export const BlockModal: React.FC<BlockModalProps> = ({
  actorName,
  actionName,
  availableBlockRoles,
  onBlock,
  onAllow,
  onChallenge,
  canChallenge = false,
}) => {
  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'Contessa':
        return <ContessaIcon className="w-4 h-4 text-pink-600" />;
      case 'Captain':
        return <CaptainIcon className="w-4 h-4 text-sky-600" />;
      case 'Ambassador':
        return <AmbassadorIcon className="w-4 h-4 text-emerald-600" />;
      case 'Duke':
        return <DukeIcon className="w-4 h-4 text-amber-600" />;
      case 'Assassin':
        return <AssassinIcon className="w-4 h-4 text-red-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center coup-modal-overlay select-none p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="coup-modal-panel p-6 max-w-sm w-full text-center space-y-4"
      >
        {/* Badge */}
        <div className="inline-block">
          <div className="neu-inset-sm px-3.5 py-1 rounded-full">
            <span className="text-indigo-800 text-[10px] font-black tracking-widest uppercase">
              Reaction Window
            </span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-stone-900 text-lg sm:text-xl font-black">
          {actorName} declared{' '}
          <span className="text-amber-700 uppercase">{actionName}</span>
        </h2>

        <p className="text-stone-600 text-xs leading-relaxed">
          You may claim a defensive role to block, challenge the claim, or allow the action to proceed.
        </p>

        {/* Block options */}
        <div className="space-y-2 pt-1">
          {availableBlockRoles.map((role) => (
            <button
              key={role}
              onClick={() => onBlock(role)}
              className="neu-btn w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
            >
              <div className="flex items-center gap-2.5">
                {getRoleIcon(role)}
                <span className="text-xs font-black text-stone-900 uppercase">
                  Block as {role}
                </span>
              </div>
              <span className="text-[10px] font-bold text-stone-500">Claim Role</span>
            </button>
          ))}
        </div>

        {/* Challenge or Pass */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          {canChallenge && onChallenge ? (
            <button
              onClick={onChallenge}
              className="neu-btn bg-red-500 hover:bg-red-600 text-white py-2.5 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <AssassinIcon className="w-3.5 h-3.5 text-white" />
              <span>Challenge</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onAllow}
            className="neu-btn bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <CheckIcon className="w-3.5 h-3.5 text-white" />
            <span>Allow</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
