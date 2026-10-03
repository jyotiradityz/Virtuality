import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { CardState } from '../../types/game';
import { InfluenceCard } from '../shared/InfluenceCard';

interface LoseInfluenceModalProps {
  reason: string;
  activeCards: CardState[];
  onConfirm: (cardId: string) => void;
}

export const LoseInfluenceModal: React.FC<LoseInfluenceModalProps> = ({
  reason,
  activeCards,
  onConfirm,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center coup-modal-overlay select-none p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="coup-modal-panel p-6 max-w-md w-full text-center space-y-5"
      >
        {/* Badge */}
        <div className="inline-block">
          <div className="neu-pressed px-4 py-1.5 rounded-full">
            <span className="text-red-800 text-[10px] font-black tracking-[0.2em] uppercase">
              ☠️ LOSE INFLUENCE
            </span>
          </div>
        </div>

        <h2 className="text-stone-900 text-xl font-black">Choose a Card to Reveal & Lose</h2>
        <p className="text-stone-600 text-xs font-medium">{reason}</p>

        {/* Cards */}
        <div className="flex justify-center gap-4 py-2">
          {activeCards.map((card) => (
            <motion.div
              key={card.id}
              whileHover={{ y: -4 }}
              className="flex flex-col items-center"
            >
              <InfluenceCard
                role={card.role}
                isSelected={selectedCardId === card.id}
                isLarge
                onClick={() => setSelectedCardId(card.id)}
              />
            </motion.div>
          ))}
        </div>

        <motion.button
          whileHover={selectedCardId ? { scale: 1.03 } : {}}
          whileTap={selectedCardId ? { scale: 0.97 } : {}}
          disabled={!selectedCardId}
          onClick={() => selectedCardId && onConfirm(selectedCardId)}
          className={`action-btn w-full py-3 text-center font-black ${
            selectedCardId ? 'danger' : 'opacity-40 cursor-not-allowed text-stone-500'
          }`}
        >
          Confirm Lose Influence
        </motion.button>
      </motion.div>
    </div>
  );
};
