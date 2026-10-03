import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { MockTransport, type ITransport } from '../api/transport';
import { SocketTransport } from '../api/socketTransport';

export function useGame(mode: 'MOCK' | 'SOCKET' = 'MOCK', botCount: number = 3) {
  const setGameState = useGameStore((state) => state.setGameState);
  const [transport] = useState<ITransport>(() => {
    if (mode === 'SOCKET') {
      return new SocketTransport('http://localhost:4000');
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
