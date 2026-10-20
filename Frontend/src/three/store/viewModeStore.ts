import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ViewMode = '2d' | '3d';

interface ViewModeState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const isViewMode = (value: unknown): value is ViewMode => value === '2d' || value === '3d';

/**
 * Persisted 2D/3D preference. Later phases let CoupGame read this to choose
 * between the 2D table and the 3D canvas.
 */
export const useViewModeStore = create<ViewModeState>()(
  persist(
    (set) => ({
      viewMode: '2d',
      setViewMode: (mode) => set({ viewMode: isViewMode(mode) ? mode : '2d' }),
    }),
    {
      name: 'virtuality-coup-view-mode',
      // A tampered/legacy localStorage value must never break the toggle.
      merge: (persisted, current) => {
        const stored = (persisted as Partial<ViewModeState> | undefined)?.viewMode;
        return { ...current, viewMode: isViewMode(stored) ? stored : '2d' };
      },
    },
  ),
);
