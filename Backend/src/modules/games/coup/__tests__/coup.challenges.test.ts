import { describe, expect, it } from 'vitest';
import { CoupEngine } from '../coup.engine.js';
import { serializeGameStateForPlayer } from '../coup.serializer.js';

describe('CoupEngine - Challenge & Influence Loss Mechanics', () => {
  it('penalizes claimant when caught lying on Tax claim and reveals role to everyone', () => {
    const players = [
      { playerId: 'p1', userId: 'u1', username: 'Alice' },
      { playerId: 'p2', userId: 'u2', username: 'Bob' },
    ];
    const game = CoupEngine.createGame('m1', 'K7M4QX', players);

    // Force p1's hand to NOT have Duke
    game.players[0]!.cards = [
      { id: 'c1', role: 'ASSASSIN', status: 'ALIVE' },
      { id: 'c2', role: 'CONTESSA', status: 'ALIVE' },
    ];

    const state1 = CoupEngine.executeAction(game, 'p1', { type: 'TAX' });
    const state2 = CoupEngine.declareChallenge(state1, 'p2');

    // p1 was caught lying, must lose influence
    expect(state2.phase).toBe('CHOOSE_INFLUENCE');
    expect(state2.pendingLoseInfluence?.playerId).toBe('p1');

    // p1 reveals c1 (ASSASSIN)
    const state3 = CoupEngine.revealCard(state2, 'p1', 'c1');

    // Check state3: card is REVEALED
    const p1Card = state3.players[0]!.cards.find((c) => c.id === 'c1');
    expect(p1Card?.status).toBe('REVEALED');

    // Check serialization for Opponent p2: p1's revealed card role ASSASSIN IS VISIBLE to p2!
    const p2View = serializeGameStateForPlayer(state3, 'p2');
    const p1CardInP2View = p2View.players[0]!.cards.find((c) => c.id === 'c1');
    expect(p1CardInP2View?.status).toBe('REVEALED');
    expect(p1CardInP2View?.role).toBe('ASSASSIN');
  });

  it('penalizes challenger when claimant actually has claimed role, replaces card, and executes action', () => {
    const players = [
      { playerId: 'p1', userId: 'u1', username: 'Alice' },
      { playerId: 'p2', userId: 'u2', username: 'Bob' },
    ];
    const game = CoupEngine.createGame('m1', 'K7M4QX', players);

    // Force p1's hand to have Duke
    game.players[0]!.cards = [
      { id: 'c1', role: 'DUKE', status: 'ALIVE' },
      { id: 'c2', role: 'CONTESSA', status: 'ALIVE' },
    ];

    const state1 = CoupEngine.executeAction(game, 'p1', { type: 'TAX' });
    const state2 = CoupEngine.declareChallenge(state1, 'p2');

    // Challenger p2 must lose influence
    expect(state2.phase).toBe('CHOOSE_INFLUENCE');
    expect(state2.pendingLoseInfluence?.playerId).toBe('p2');

    const p2CardId = state2.players[1]!.cards[0]!.id;
    const state3 = CoupEngine.revealCard(state2, 'p2', p2CardId);

    // p1's Tax action succeeded (+3 coins for p1!)
    expect(state3.players[0]!.coins).toBe(5); // 2 + 3 = 5
  });
});
