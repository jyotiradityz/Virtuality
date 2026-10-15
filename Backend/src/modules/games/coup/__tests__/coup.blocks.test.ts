import { describe, expect, it } from 'vitest';
import { CoupEngine } from '../coup.engine.js';

describe('CoupEngine - Block Mechanics', () => {
  it('allows Duke to block Foreign Aid', () => {
    const players = [
      { playerId: 'p1', userId: 'u1', username: 'Alice' },
      { playerId: 'p2', userId: 'u2', username: 'Bob' },
    ];
    const game = CoupEngine.createGame('m1', 'K7M4QX', players);

    const state1 = CoupEngine.executeAction(game, 'p1', { type: 'FOREIGN_AID' });
    const state2 = CoupEngine.declareBlock(state1, 'p2', 'DUKE');

    expect(state2.phase).toBe('BLOCK_RESPONSE');
    expect(state2.pendingAction?.block?.blockerId).toBe('p2');
    expect(state2.pendingAction?.block?.claimedRole).toBe('DUKE');
  });

  it('prevents invalid roles from blocking actions', () => {
    const players = [
      { playerId: 'p1', userId: 'u1', username: 'Alice' },
      { playerId: 'p2', userId: 'u2', username: 'Bob' },
    ];
    const game = CoupEngine.createGame('m1', 'K7M4QX', players);

    const state1 = CoupEngine.executeAction(game, 'p1', { type: 'FOREIGN_AID' });

    // Contessa cannot block Foreign Aid
    expect(() => CoupEngine.declareBlock(state1, 'p2', 'CONTESSA')).toThrowError();
  });
});
