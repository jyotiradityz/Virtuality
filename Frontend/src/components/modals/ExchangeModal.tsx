import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { CardState } from '../../types/game';
import { InfluenceCard } from '../shared/InfluenceCard';
import { AmbassadorIcon } from '../shared/CoupIcons';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center coup-modal-overlay select-none p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="coup-modal-panel p-6 max-w-lg w-full text-center space-y-4"
      >
        {/* Badge */}
        <div className="inline-block">
          <div className="neu-inset-sm px-3.5 py-1 rounded-full">
            <span className="text-emerald-800 text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5">
              <AmbassadorIcon className="w-3.5 h-3.5" />
              Ambassador Exchange
            </span>
          </div>
        </div>

        <h2 className="text-stone-900 text-lg sm:text-xl font-black">
          Retain {requiredCount} Influence Card{requiredCount > 1 ? 's' : ''}
        </h2>
        <p className="text-stone-600 text-xs">
          Select {requiredCount} card{requiredCount > 1 ? 's' : ''} to keep in your court hand. Unselected cards return to the Court Deck.
        </p>

        {/* Cards Pool */}
        <div className="flex justify-center gap-2.5 sm:gap-3 py-3 flex-wrap">
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

        <button
          disabled={!isComplete}
          onClick={() => isComplete && onConfirm(selectedIds)}
          className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
            isComplete
              ? 'neu-btn bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
              : 'opacity-40 cursor-not-allowed neu-inset-sm text-stone-400'
          }`}
        >
          Confirm Retention ({selectedIds.length} / {requiredCount})
        </button>
      </motion.div>
    </div>
  );
};
