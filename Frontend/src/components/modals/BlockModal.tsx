import React from 'react';
import { motion } from 'framer-motion';
import type { Role } from '../../types/game';

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
            <span className="text-purple-800 text-[10px] font-black tracking-[0.2em] uppercase">
              🛡️ ACTION ATTEMPTED
            </span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-stone-900 text-xl font-black">
          {actorName} declared{' '}
          <span className="text-amber-700 uppercase">{actionName}</span>
        </h2>

        <p className="text-stone-600 text-xs leading-relaxed font-medium">
          You may respond by blocking with a role claim, challenging, or allowing.
        </p>

        {/* Block options */}
        <div className="space-y-2 pt-1">
          {availableBlockRoles.map((role) => (
            <motion.button
              key={role}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onBlock(role)}
              className="action-btn block w-full flex items-center justify-between py-3"
            >
              <span>Block as {role}</span>
              <span className="text-white text-sm">🛡️</span>
            </motion.button>
          ))}

          {canChallenge && onChallenge && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onChallenge}
              className="action-btn danger w-full flex items-center justify-between py-3"
            >
              <span>Challenge Action</span>
              <span className="text-white text-sm">🗡️</span>
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onAllow}
            className="action-btn w-full text-center py-3 text-stone-700 font-bold"
          >
            Allow Action
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
