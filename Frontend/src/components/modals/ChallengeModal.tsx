import React from 'react';
import { motion } from 'framer-motion';
import type { Role } from '../../types/game';
import { AssassinIcon, CheckIcon } from '../shared/CoupIcons';

interface ChallengeModalProps {
  actorName: string;
  claimedRole: Role;
  actionName: string;
  onChallenge: () => void;
  onAllow: () => void;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  actorName,
  claimedRole,
  actionName,
  onChallenge,
  onAllow,
}) => {
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
            <span className="text-amber-800 text-[10px] font-black tracking-widest uppercase">
              Bluff Opportunity
            </span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-stone-900 text-lg sm:text-xl font-black">
          {actorName} claims{' '}
          <span className="text-amber-700 uppercase">{claimedRole}</span>
        </h2>

        {/* Description */}
        <p className="text-stone-600 text-xs leading-relaxed">
          Action: <span className="font-extrabold text-stone-900">{actionName}</span>
          <br />
          Do you suspect a bluff? Challenge their claim or allow the action.
        </p>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onChallenge}
            className="neu-btn bg-red-500 hover:bg-red-600 text-white py-3 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <AssassinIcon className="w-4 h-4 text-white" />
            <span>Challenge</span>
          </button>
          <button
            onClick={onAllow}
            className="neu-btn bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <CheckIcon className="w-4 h-4 text-white" />
            <span>Allow</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
