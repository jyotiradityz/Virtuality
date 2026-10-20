import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CoupScene3D } from '../three/components/CoupScene3D';
import { useViewModeStore } from '../three/store/viewModeStore';
import type { ViewMode } from '../three/store/viewModeStore';
import { SandboxHud } from '../three/ui/SandboxHud';

/** Phase 7 test sandbox for the 3D Coup experience. No game logic. */
export const Coup3DSandbox: React.FC = () => {
  const navigate = useNavigate();
  const viewMode = useViewModeStore((s) => s.viewMode);
  const setViewMode = useViewModeStore((s) => s.setViewMode);

  const [playerCount, setPlayerCount] = useState(4);
  const [activeSeatIndex, setActiveSeatIndex] = useState(0);
  const [freeOrbit, setFreeOrbit] = useState(false);

  useEffect(() => {
    document.title = 'Coup 3D Sandbox | Virtuality';
    setViewMode('3d');
  }, [setViewMode]);

  const handlePlayerCountChange = useCallback((count: number) => {
    setPlayerCount(count);
    setActiveSeatIndex(0);
  }, []);

  const nextTurn = useCallback(
    () => setActiveSeatIndex((i) => (i + 1) % playerCount),
    [playerCount],
  );
  const prevTurn = useCallback(
    () => setActiveSeatIndex((i) => (i - 1 + playerCount) % playerCount),
    [playerCount],
  );

  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      setViewMode(mode);
      if (mode === '2d') navigate('/coup');
    },
    [navigate, setViewMode],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextTurn();
      else if (e.key === 'ArrowLeft') prevTurn();
      else if (e.key === 'o' || e.key === 'O') setFreeOrbit((v) => !v);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [nextTurn, prevTurn]);

  return (
    <main className="relative h-screen w-full overflow-hidden bg-[#07080d]">
      <h1 className="sr-only">Coup 3D Sandbox</h1>
      <CoupScene3D playerCount={playerCount} activeSeatIndex={activeSeatIndex} freeOrbit={freeOrbit} />
      <SandboxHud
        playerCount={playerCount}
        activeSeatIndex={activeSeatIndex}
        freeOrbit={freeOrbit}
        viewMode={viewMode}
        onPlayerCountChange={handlePlayerCountChange}
        onPrevTurn={prevTurn}
        onNextTurn={nextTurn}
        onFreeOrbitChange={setFreeOrbit}
        onViewModeChange={handleViewModeChange}
      />
    </main>
  );
};

export default Coup3DSandbox;
