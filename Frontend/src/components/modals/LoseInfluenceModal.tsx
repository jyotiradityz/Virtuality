import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { CardState } from '../../types/game';
import { InfluenceCard } from '../shared/InfluenceCard';
import { AssassinIcon } from '../shared/CoupIcons';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center coup-modal-overlay select-none p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="coup-modal-panel p-6 max-w-md w-full text-center space-y-4"
      >
        {/* Badge */}
        <div className="inline-block">
          <div className="neu-inset-sm px-3.5 py-1 rounded-full">
            <span className="text-red-700 text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5">
              <AssassinIcon className="w-3.5 h-3.5" />
              Sacrifice Influence
            </span>
          </div>
        </div>

        <h2 className="text-stone-900 text-lg sm:text-xl font-black">
          Select Card to Reveal & Surrender
        </h2>
        <p className="text-stone-600 text-xs">{reason}</p>

        {/* Cards */}
        <div className="flex justify-center gap-3 sm:gap-4 py-3">
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

        <button
          disabled={!selectedCardId}
          onClick={() => selectedCardId && onConfirm(selectedCardId)}
          className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
            selectedCardId
              ? 'neu-btn bg-red-600 hover:bg-red-700 text-white shadow-md'
              : 'opacity-40 cursor-not-allowed neu-inset-sm text-stone-400'
          }`}
        >
          Confirm Surrender Card
        </button>
      </motion.div>
    </div>
  );
};
