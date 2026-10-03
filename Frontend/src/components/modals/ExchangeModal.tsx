import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { CardState } from '../../types/game';
import { InfluenceCard } from '../shared/InfluenceCard';

interface ExchangeModalProps {
  activeCards: CardState[];
  drawnCards: CardState[];
  onConfirm: (keptCardIds: string[]) => void;
}

export const ExchangeModal: React.FC<ExchangeModalProps> = ({
  activeCards,
  drawnCards,
  onConfirm,
}) => {
  const pool = [...activeCards, ...drawnCards];
  const requiredCount = activeCards.length;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length < requiredCount) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const isComplete = selectedIds.length === requiredCount;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center coup-modal-overlay select-none p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="coup-modal-panel p-6 max-w-lg w-full text-center space-y-5"
      >
        {/* Badge */}
        <div className="inline-block">
          <div className="neu-pressed px-4 py-1.5 rounded-full">
            <span className="text-emerald-800 text-[10px] font-black tracking-[0.2em] uppercase">
              📜 AMBASSADOR EXCHANGE
            </span>
          </div>
        </div>

        <h2 className="text-stone-900 text-xl font-black">
          Choose {requiredCount} Card{requiredCount > 1 ? 's' : ''} to Keep
        </h2>
        <p className="text-stone-600 text-xs font-medium">
          Select {requiredCount} card{requiredCount > 1 ? 's' : ''} to keep.
          The rest return to the deck.
        </p>

        {/* Cards */}
        <div className="flex justify-center gap-3 py-2 flex-wrap">
          {pool.map((card) => {
            const isSelected = selectedIds.includes(card.id);
            return (
              <motion.div key={card.id} whileHover={{ y: -4 }} className="flex flex-col items-center">
                <InfluenceCard
                  role={card.role}
                  isSelected={isSelected}
                  isLarge
                  onClick={() => toggleSelect(card.id)}
                />
              </motion.div>
            );
          })}
        </div>

        <motion.button
          whileHover={isComplete ? { scale: 1.03 } : {}}
          whileTap={isComplete ? { scale: 0.97 } : {}}
          disabled={!isComplete}
          onClick={() => isComplete && onConfirm(selectedIds)}
          className={`action-btn w-full py-3 text-center font-black ${
            isComplete
              ? 'primary'
              : 'opacity-40 cursor-not-allowed text-stone-500'
          }`}
        >
          Confirm Exchange ({selectedIds.length} / {requiredCount})
        </motion.button>
      </motion.div>
    </div>
  );
};
