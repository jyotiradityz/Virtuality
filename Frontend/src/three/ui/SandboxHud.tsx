import { MAX_PLAYERS, MIN_PLAYERS } from '../config/sceneConfig';
import type { ViewMode } from '../store/viewModeStore';
import { ViewModeToggle } from './ViewModeToggle';

interface SandboxHudProps {
  playerCount: number;
  activeSeatIndex: number;
  freeOrbit: boolean;
  viewMode: ViewMode;
  onPlayerCountChange: (count: number) => void;
  onPrevTurn: () => void;
  onNextTurn: () => void;
  onFreeOrbitChange: (value: boolean) => void;
  onViewModeChange: (mode: ViewMode) => void;
}

const glass =
  'rounded-2xl border border-white/10 bg-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl';
const btn =
  'cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold tracking-wider text-slate-200 transition-all hover:border-amber-400/50 hover:bg-amber-400/10 hover:text-white active:scale-95';

export function SandboxHud({
  playerCount,
  activeSeatIndex,
  freeOrbit,
  viewMode,
  onPlayerCountChange,
  onPrevTurn,
  onNextTurn,
  onFreeOrbitChange,
  onViewModeChange,
}: SandboxHudProps) {
  const counts = Array.from({ length: MAX_PLAYERS - MIN_PLAYERS + 1 }, (_, i) => MIN_PLAYERS + i);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4 sm:p-6">
      {/* Top bar */}
      <header className="flex items-start justify-between gap-3">
        <div className={`${glass} px-4 py-2.5`}>
          <p className="text-sm font-black uppercase leading-none tracking-widest text-white">Coup</p>
          <p className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.25em] text-amber-300/80">
            3D Sandbox · Phase 7
          </p>
        </div>

        <div className="pointer-events-auto">
          <ViewModeToggle value={viewMode} onChange={onViewModeChange} />
        </div>
      </header>

      {/* Bottom control dock */}
      <footer className="flex flex-col items-center gap-3">
        <div
          id="hud-active-seat"
          className="rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 text-xs font-extrabold tracking-wider text-amber-200 backdrop-blur-xl"
        >
          Turn: P{activeSeatIndex + 1} / {playerCount}
        </div>

        <div className={`${glass} pointer-events-auto flex flex-wrap items-center justify-center gap-3 p-3`}>
          <div className="flex items-center gap-1.5" role="group" aria-label="Player count">
            <span className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Players</span>
            {counts.map((count) => (
              <button
                key={count}
                id={`hud-players-${count}`}
                type="button"
                aria-pressed={playerCount === count}
                onClick={() => onPlayerCountChange(count)}
                className={`h-8 w-8 cursor-pointer rounded-lg text-xs font-extrabold transition-all active:scale-95 ${
                  playerCount === count
                    ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-stone-900 shadow-[0_0_14px_rgba(245,180,60,0.4)]'
                    : 'border border-white/10 bg-white/5 text-slate-300 hover:border-amber-400/50 hover:text-white'
                }`}
              >
                {count}
              </button>
            ))}
          </div>

          <span className="hidden h-6 w-px bg-white/10 sm:block" />

          <div className="flex items-center gap-2">
            <button id="hud-prev-turn" type="button" onClick={onPrevTurn} className={btn}>
              ‹ Prev Turn
            </button>
            <button id="hud-next-turn" type="button" onClick={onNextTurn} className={btn}>
              Next Turn ›
            </button>
          </div>

          <span className="hidden h-6 w-px bg-white/10 sm:block" />

          <button
            id="hud-free-orbit"
            type="button"
            role="switch"
            aria-checked={freeOrbit}
            onClick={() => onFreeOrbitChange(!freeOrbit)}
            className="flex cursor-pointer items-center gap-2 text-xs font-bold tracking-wider text-slate-200"
          >
            <span
              className={`relative h-5 w-9 rounded-full border border-white/10 transition-colors ${
                freeOrbit ? 'bg-amber-400' : 'bg-white/10'
              }`}
            >
              <span
                className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow transition-all ${
                  freeOrbit ? 'left-[1.1rem]' : 'left-0.5'
                }`}
              />
            </span>
            Free Orbit
          </button>
        </div>

        <p className="text-[10px] font-semibold tracking-wider text-slate-500">
          ← → change turn · O free orbit
        </p>
      </footer>
    </div>
  );
}
