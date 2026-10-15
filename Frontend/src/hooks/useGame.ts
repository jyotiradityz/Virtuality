import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { MockTransport, type ITransport } from '../api/transport';
import { SocketTransport } from '../api/socketTransport';

export function useGame(mode: 'MOCK' | 'SOCKET' = 'SOCKET', botCount: number = 3) {
  const setGameState = useGameStore((state) => state.setGameState);
  const [transport] = useState<ITransport>(() => {
    if (mode === 'SOCKET') {
      const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      return new SocketTransport(`http://${host}:4000`);
    }
    return new MockTransport(botCount + 1);
  });

  useEffect(() => {
    transport.connect();

    transport.onStateUpdate((state) => {
      setGameState(state);
    });

    return () => transport.disconnect();
  }, [transport, setGameState]);

  return {
    transport,
    setGameState,
  };
}
