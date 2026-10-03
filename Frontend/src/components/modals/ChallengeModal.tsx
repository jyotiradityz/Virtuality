import React from 'react';
import { motion } from 'framer-motion';
import type { Role } from '../../types/game';

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
    <div className="absolute inset-0 z-50 flex items-center justify-center coup-modal-overlay select-none p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="coup-modal-panel p-6 max-w-sm w-full text-center space-y-5"
      >
        {/* Badge */}
        <div className="inline-block">
          <div className="neu-pressed px-4 py-1.5 rounded-full">
            <span className="text-amber-800 text-[10px] font-black tracking-[0.2em] uppercase">
              ⚠️ RESPONSE REQUIRED
            </span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-stone-900 text-xl font-black">
          {actorName} claims{' '}
          <span className="text-amber-700 uppercase">{claimedRole}</span>
        </h2>

        {/* Description */}
        <p className="text-stone-600 text-xs leading-relaxed font-medium">
          Action: <span className="font-extrabold text-stone-800">{actionName}</span>
          <br />
          Do you want to challenge their claim?
        </p>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onChallenge}
            className="action-btn danger py-3 text-center font-black"
          >
            🗡️ CHALLENGE
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onAllow}
            className="action-btn py-3 text-center font-bold text-stone-700"
          >
            ALLOW
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
