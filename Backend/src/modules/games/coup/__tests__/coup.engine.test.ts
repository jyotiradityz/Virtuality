import { describe, expect, it } from 'vitest';
import { createDeck } from '../coup.cards.js';
import { CoupEngine } from '../coup.engine.js';
import { serializeGameStateForPlayer } from '../coup.serializer.js';

describe('CoupEngine - Core & Initialization', () => {
  it('creates deck of exactly 15 cards with 3 of each role', () => {
    const deck = createDeck();
    expect(deck).toHaveLength(15);
    const roleCounts: Record<string, number> = {};
    for (const card of deck) {
      roleCounts[card.role] = (roleCounts[card.role] || 0) + 1;
    }
    expect(roleCounts['DUKE']).toBe(3);
    expect(roleCounts['ASSASSIN']).toBe(3);
    expect(roleCounts['CAPTAIN']).toBe(3);
    expect(roleCounts['AMBASSADOR']).toBe(3);
    expect(roleCounts['CONTESSA']).toBe(3);
  });

  it('initializes a 3-player game correctly with 2 cards & 2 coins each', () => {
    const players = [
      { playerId: 'p1', userId: 'u1', username: 'Alice' },
      { playerId: 'p2', userId: 'u2', username: 'Bob' },
      { playerId: 'p3', userId: 'u3', username: 'Charlie' },
    ];
    const game = CoupEngine.createGame('m1', 'K7M4QX', players);

    expect(game.players).toHaveLength(3);
    expect(game.deck).toHaveLength(15 - 6); // 9 cards left in deck
    expect(game.currentPlayerId).toBe('p1');
    expect(game.phase).toBe('PLAYER_TURN');

    for (const player of game.players) {
      expect(player.coins).toBe(2);
      expect(player.cards).toHaveLength(2);
      expect(player.isAlive).toBe(true);
    }
  });

  it('masks opponent cards in serialized state and displays player own cards', () => {
    const players = [
      { playerId: 'p1', userId: 'u1', username: 'Alice' },
      { playerId: 'p2', userId: 'u2', username: 'Bob' },
    ];
    const game = CoupEngine.createGame('m1', 'K7M4QX', players);

    const p1Serialized = serializeGameStateForPlayer(game, 'p1');

    // P1 sees their own roles
    expect(p1Serialized.players[0]!.cards[0]!.role).toBeDefined();

    // P1 DOES NOT see P2 roles (Role is undefined)
    expect(p1Serialized.players[1]!.cards[0]!.role).toBeUndefined();
    expect(p1Serialized.players[1]!.cards[0]!.status).toBe('ALIVE');
  });
});
