import { create } from 'zustand';
import type { GameState } from '../types/game';

interface GameStore {
  gameState: GameState | null;
  setGameState: (state: GameState) => void;
  updatePlayerCoins: (playerId: string, amount: number) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: null,
  setGameState: (state) => set({ gameState: state }),
  updatePlayerCoins: (playerId, amount) => set((state) => {
    if (!state.gameState) return state;
    return {
      gameState: {
        ...state.gameState,
        players: state.gameState.players.map(p =>
          p.id === playerId ? { ...p, coins: p.coins + amount } : p
        )
      }
    };
  }),
}));
