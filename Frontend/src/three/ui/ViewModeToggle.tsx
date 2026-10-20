import type { ViewMode } from '../store/viewModeStore';

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const OPTIONS: { mode: ViewMode; label: string }[] = [
  { mode: '2d', label: '2D' },
  { mode: '3d', label: '3D' },
];

/** Glass pill with a sliding active indicator. */
export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  const activeIndex = value === '3d' ? 1 : 0;

  return (
    <div
      role="group"
      aria-label="Experience mode"
      className="relative grid grid-cols-2 rounded-full border border-white/10 bg-white/5 p-1 shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl"
    >
      <span
        aria-hidden
        className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-gradient-to-b from-amber-300 to-amber-500 shadow-[0_0_18px_rgba(245,180,60,0.45)] transition-transform duration-300 ease-out"
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      />
      {OPTIONS.map(({ mode, label }) => (
        <button
          key={mode}
          id={`view-toggle-${mode}`}
          type="button"
          aria-pressed={value === mode}
          onClick={() => onChange(mode)}
          className={`relative z-10 cursor-pointer rounded-full px-5 py-1.5 text-xs font-extrabold tracking-widest transition-colors ${
            value === mode ? 'text-stone-900' : 'text-slate-300 hover:text-white'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
