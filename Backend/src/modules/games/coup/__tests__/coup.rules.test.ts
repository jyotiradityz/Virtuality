import { describe, expect, it } from 'vitest';
import { CoupEngine } from '../coup.engine.js';
import { CoupError } from '../coup.errors.js';

describe('CoupEngine - Basic Actions & Mandatory Coup', () => {
  it('executes Income (+1 coin)', () => {
    const players = [
      { playerId: 'p1', userId: 'u1', username: 'Alice' },
      { playerId: 'p2', userId: 'u2', username: 'Bob' },
    ];
    const game = CoupEngine.createGame('m1', 'K7M4QX', players);

    const nextState = CoupEngine.executeAction(game, 'p1', { type: 'INCOME' });

    expect(nextState.players[0]!.coins).toBe(3);
    expect(nextState.currentPlayerId).toBe('p2');
    expect(nextState.phase).toBe('PLAYER_TURN');
  });

  it('enforces mandatory Coup when player has 10 or more coins', () => {
    const players = [
      { playerId: 'p1', userId: 'u1', username: 'Alice' },
      { playerId: 'p2', userId: 'u2', username: 'Bob' },
    ];
    const game = CoupEngine.createGame('m1', 'K7M4QX', players);
    game.players[0]!.coins = 10; // Set coins to 10

    // Attempting Income should fail
    expect(() => CoupEngine.executeAction(game, 'p1', { type: 'INCOME' })).toThrowError(
      CoupError
    );

    // Executing Coup should succeed
    const nextState = CoupEngine.executeAction(game, 'p1', {
      type: 'COUP',
      targetPlayerId: 'p2',
    });
    expect(nextState.players[0]!.coins).toBe(3); // 10 - 7 = 3
  });
});
