import { describe, expect, it } from 'vitest';
import { CoupEngine } from '../coup.engine.js';

describe('CoupEngine - Actions (Tax, Steal, Foreign Aid)', () => {
  it('opens challenge window on Tax claim', () => {
    const players = [
      { playerId: 'p1', userId: 'u1', username: 'Alice' },
      { playerId: 'p2', userId: 'u2', username: 'Bob' },
    ];
    const game = CoupEngine.createGame('m1', 'K7M4QX', players);

    const nextState = CoupEngine.executeAction(game, 'p1', { type: 'TAX' });

    expect(nextState.phase).toBe('ACTION_RESPONSE');
    expect(nextState.pendingAction?.claimedRole).toBe('DUKE');
  });

  it('opens block response window on Foreign Aid claim', () => {
    const players = [
      { playerId: 'p1', userId: 'u1', username: 'Alice' },
      { playerId: 'p2', userId: 'u2', username: 'Bob' },
    ];
    const game = CoupEngine.createGame('m1', 'K7M4QX', players);

    const nextState = CoupEngine.executeAction(game, 'p1', { type: 'FOREIGN_AID' });

    expect(nextState.phase).toBe('BLOCK_RESPONSE');
    expect(nextState.pendingAction?.action.type).toBe('FOREIGN_AID');
  });
});
