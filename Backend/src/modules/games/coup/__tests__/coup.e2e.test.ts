import { describe, expect, it } from 'vitest';
import { CoupEngine } from '../coup.engine.js';
import { serializeGameStateForPlayer } from '../coup.serializer.js';

describe('CoupEngine - Full 6-Player End-to-End Match Simulation', () => {
  it('simulates a complete 6-player match with challenges, blocks, reveals, and winner detection', () => {
    const players = [
      { playerId: 'p1', userId: 'u1', username: 'Alice' },
      { playerId: 'p2', userId: 'u2', username: 'Bob' },
      { playerId: 'p3', userId: 'u3', username: 'Charlie' },
      { playerId: 'p4', userId: 'u4', username: 'David' },
      { playerId: 'p5', userId: 'u5', username: 'Eve' },
      { playerId: 'p6', userId: 'u6', username: 'Frank' },
    ];

    let game = CoupEngine.createGame('m_e2e_01', 'K7M4QX', players);

    // Controlled Hand Setup for deterministic test execution
    game.players[0]!.cards = [
      { id: 'c_p1_1', role: 'DUKE', status: 'ALIVE' },
      { id: 'c_p1_2', role: 'ASSASSIN', status: 'ALIVE' },
    ];
    game.players[1]!.cards = [
      { id: 'c_p2_1', role: 'CAPTAIN', status: 'ALIVE' },
      { id: 'c_p2_2', role: 'CONTESSA', status: 'ALIVE' },
    ];
    game.players[2]!.cards = [
      { id: 'c_p3_1', role: 'AMBASSADOR', status: 'ALIVE' },
      { id: 'c_p3_2', role: 'DUKE', status: 'ALIVE' },
    ];
    game.players[3]!.cards = [
      { id: 'c_p4_1', role: 'CONTESSA', status: 'ALIVE' },
      { id: 'c_p4_2', role: 'CAPTAIN', status: 'ALIVE' },
    ];
    game.players[4]!.cards = [
      { id: 'c_p5_1', role: 'ASSASSIN', status: 'ALIVE' },
      { id: 'c_p5_2', role: 'AMBASSADOR', status: 'ALIVE' },
    ];
    game.players[5]!.cards = [
      { id: 'c_p6_1', role: 'DUKE', status: 'ALIVE' },
      { id: 'c_p6_2', role: 'CONTESSA', status: 'ALIVE' },
    ];

    expect(game.players).toHaveLength(6);
    expect(game.phase).toBe('PLAYER_TURN');
    expect(game.currentPlayerId).toBe('p1');

    // Helper to pass remaining player responses automatically
    const passAllRemaining = (g: typeof game) => {
      let current = g;
      while (current.phase === 'ACTION_RESPONSE' || current.phase === 'BLOCK_RESPONSE') {
        const active = current.players.filter((p) => p.isAlive);
        const passes = current.pendingAction?.block
          ? current.pendingAction.block.passes
          : current.pendingAction?.passes || [];
        const nextPlayerToPass = active.find((p) => !passes.includes(p.playerId));
        if (!nextPlayerToPass) break;
        current = CoupEngine.passResponse(current, nextPlayerToPass.playerId);
      }
      return current;
    };

    // === ROUND 1 ===
    // Alice (p1): TAX (Duke). Pass responses.
    game = CoupEngine.executeAction(game, 'p1', { type: 'TAX' });
    game = passAllRemaining(game);
    expect(game.players[0]!.coins).toBe(5); // 2 + 3
    expect(game.currentPlayerId).toBe('p2');

    // Bob (p2): INCOME
    game = CoupEngine.executeAction(game, 'p2', { type: 'INCOME' });
    expect(game.players[1]!.coins).toBe(3);
    expect(game.currentPlayerId).toBe('p3');

    // Charlie (p3): TAX -> David (p4) Challenges! Charlie HAS Duke -> David loses influence
    game = CoupEngine.executeAction(game, 'p3', { type: 'TAX' });
    game = CoupEngine.declareChallenge(game, 'p4'); // David challenges Charlie
    expect(game.phase).toBe('CHOOSE_INFLUENCE');
    expect(game.pendingLoseInfluence?.playerId).toBe('p4');

    // David (p4) reveals c_p4_2 (CAPTAIN)
    game = CoupEngine.revealCard(game, 'p4', 'c_p4_2');
    expect(game.players[3]!.cards.find((c) => c.id === 'c_p4_2')?.status).toBe('REVEALED');
    expect(game.players[2]!.coins).toBe(5); // Charlie got Tax coins
    expect(game.currentPlayerId).toBe('p4');

    // David (p4): INCOME
    game = CoupEngine.executeAction(game, 'p4', { type: 'INCOME' });
    expect(game.players[3]!.coins).toBe(3);
    expect(game.currentPlayerId).toBe('p5');

    // Eve (p5): INCOME
    game = CoupEngine.executeAction(game, 'p5', { type: 'INCOME' });
    expect(game.players[4]!.coins).toBe(3);
    expect(game.currentPlayerId).toBe('p6');

    // Frank (p6): TAX
    game = CoupEngine.executeAction(game, 'p6', { type: 'TAX' });
    game = passAllRemaining(game);
    expect(game.players[5]!.coins).toBe(5);
    expect(game.currentPlayerId).toBe('p1');

    // === ROUND 2 ===
    // Alice (p1): ASSASSINATE on David (p4) -> David blocks with CONTESSA -> Alice challenges David's Contessa!
    // David HAS Contessa! Alice's challenge fails -> Alice loses influence
    game = CoupEngine.executeAction(game, 'p1', { type: 'ASSASSINATE', targetPlayerId: 'p4' });
    game = CoupEngine.declareBlock(game, 'p4', 'CONTESSA');
    game = CoupEngine.declareChallenge(game, 'p1'); // Alice challenges David's block
    expect(game.phase).toBe('CHOOSE_INFLUENCE');
    expect(game.pendingLoseInfluence?.playerId).toBe('p1');

    // Alice reveals c_p1_2 (ASSASSIN)
    game = CoupEngine.revealCard(game, 'p1', 'c_p1_2');
    expect(game.players[0]!.cards.find((c) => c.id === 'c_p1_2')?.status).toBe('REVEALED');
    expect(game.currentPlayerId).toBe('p2');

    // Bob (p2): STEAL from Frank (p6) -> Frank blocks with CAPTAIN -> Bob challenges Frank's Captain!
    // Frank DOES NOT HAVE Captain! Frank caught lying -> Frank loses influence (Frank has 1 card left)
    game = CoupEngine.executeAction(game, 'p2', { type: 'STEAL', targetPlayerId: 'p6' });
    game = CoupEngine.declareBlock(game, 'p6', 'CAPTAIN');
    game = CoupEngine.declareChallenge(game, 'p2'); // Bob challenges Frank's block
    expect(game.phase).toBe('CHOOSE_INFLUENCE');
    expect(game.pendingLoseInfluence?.playerId).toBe('p6');

    // Frank reveals c_p6_1 (DUKE)
    game = CoupEngine.revealCard(game, 'p6', 'c_p6_1');
    expect(game.players[1]!.coins).toBe(5); // Bob stole 2 coins from Frank (3+2=5)
    expect(game.players[5]!.coins).toBe(3); // Frank coins (5-2=3)
    expect(game.currentPlayerId).toBe('p3');

    // Charlie (p3): FOREIGN AID -> Blocked by Alice (p1) with DUKE -> Pass block response
    game = CoupEngine.executeAction(game, 'p3', { type: 'FOREIGN_AID' });
    game = CoupEngine.declareBlock(game, 'p1', 'DUKE');
    game = passAllRemaining(game);
    expect(game.players[2]!.coins).toBe(5); // Foreign aid blocked
    expect(game.currentPlayerId).toBe('p4');

    // David (p4): INCOME
    game = CoupEngine.executeAction(game, 'p4', { type: 'INCOME' });
    expect(game.players[3]!.coins).toBe(4);
    expect(game.currentPlayerId).toBe('p5');

    // Eve (p5): ASSASSINATE on Frank (p6) (Cost 3 coins). Frank has no Contessa, Frank auto-reveals last card!
    const frankBefore = game.players.find((p) => p.playerId === 'p6')!;
    // console.log('Frank before assassinate cards:', frankBefore.cards);

    game = CoupEngine.executeAction(game, 'p5', { type: 'ASSASSINATE', targetPlayerId: 'p6' });
    game = passAllRemaining(game);

    const frankP = game.players.find((p) => p.playerId === 'p6')!;
    expect(frankP.isAlive).toBe(false);
    expect(game.currentPlayerId).toBe('p1');

    // === ELIMINATION CONTINUATION TO WINNER ===
    // Alice (p1): TAX (+3 -> 5 coins)
    game = CoupEngine.executeAction(game, 'p1', { type: 'TAX' });
    game = passAllRemaining(game);
    expect(game.players[0]!.coins).toBe(5);

    // Bob (p2): TAX (Claims Duke). Eve (p5) challenges! Bob LIES (has Captain/Contessa) -> Bob loses influence
    game = CoupEngine.executeAction(game, 'p2', { type: 'TAX' });
    game = CoupEngine.declareChallenge(game, 'p5');
    expect(game.pendingLoseInfluence?.playerId).toBe('p2');

    // Bob reveals c_p2_1 (CAPTAIN)
    game = CoupEngine.revealCard(game, 'p2', 'c_p2_1');
    expect(game.players[1]!.cards.find((c) => c.id === 'c_p2_1')?.status).toBe('REVEALED');

    // Charlie (p3): INCOME
    game = CoupEngine.executeAction(game, 'p3', { type: 'INCOME' });
    expect(game.players[2]!.coins).toBe(6);

    // David (p4): INCOME
    game = CoupEngine.executeAction(game, 'p4', { type: 'INCOME' });
    expect(game.players[3]!.coins).toBe(5);

    // Eve (p5): INCOME
    game = CoupEngine.executeAction(game, 'p5', { type: 'INCOME' });
    expect(game.players[4]!.coins).toBe(1);

    // Alice (p1): TAX (+3 -> 8 coins)
    game = CoupEngine.executeAction(game, 'p1', { type: 'TAX' });
    game = passAllRemaining(game);
    expect(game.players[0]!.coins).toBe(8);

    // Bob (p2): INCOME
    game = CoupEngine.executeAction(game, 'p2', { type: 'INCOME' });
    expect(game.players[1]!.coins).toBe(6);

    // Charlie (p3): INCOME
    game = CoupEngine.executeAction(game, 'p3', { type: 'INCOME' });
    expect(game.players[2]!.coins).toBe(7);

    // David (p4): INCOME
    game = CoupEngine.executeAction(game, 'p4', { type: 'INCOME' });
    expect(game.players[3]!.coins).toBe(6);

    // Eve (p5): INCOME
    game = CoupEngine.executeAction(game, 'p5', { type: 'INCOME' });
    expect(game.players[4]!.coins).toBe(2);

    // Alice (p1): COUP on Charlie (p3) (Cost 7). Charlie reveals c_p3_1 (AMBASSADOR)
    game = CoupEngine.executeAction(game, 'p1', { type: 'COUP', targetPlayerId: 'p3' });
    game = CoupEngine.revealCard(game, 'p3', 'c_p3_1');
    expect(game.players[2]!.cards.find((c) => c.id === 'c_p3_1')?.status).toBe('REVEALED');
    expect(game.players[0]!.coins).toBe(1); // 8 - 7 = 1

    // Bob (p2): INCOME
    game = CoupEngine.executeAction(game, 'p2', { type: 'INCOME' });
    expect(game.players[1]!.coins).toBe(7);

    // Charlie (p3): COUP on David (p4) (Cost 7). David auto-reveals last card -> DAVID ELIMINATED!
    game = CoupEngine.executeAction(game, 'p3', { type: 'COUP', targetPlayerId: 'p4' });
    expect(game.players[3]!.isAlive).toBe(false);

    // Eve (p5): INCOME
    game = CoupEngine.executeAction(game, 'p5', { type: 'INCOME' });
    expect(game.players[4]!.coins).toBe(3);

    // Alice (p1): INCOME
    game = CoupEngine.executeAction(game, 'p1', { type: 'INCOME' });
    expect(game.players[0]!.coins).toBe(2);

    // Bob (p2): COUP on Charlie (p3) (Cost 7). Charlie auto-reveals last card -> CHARLIE ELIMINATED!
    game = CoupEngine.executeAction(game, 'p2', { type: 'COUP', targetPlayerId: 'p3' });
    expect(game.players[2]!.isAlive).toBe(false);

    // Eve (p5): TAX (Claims Duke). Alice (p1) challenges! Eve LIES -> Eve loses card
    game = CoupEngine.executeAction(game, 'p5', { type: 'TAX' });
    game = CoupEngine.declareChallenge(game, 'p1');
    game = CoupEngine.revealCard(game, 'p5', 'c_p5_1');
    expect(game.players[4]!.cards.find((c) => c.id === 'c_p5_1')?.status).toBe('REVEALED');

    // Alice (p1): TAX (+3 -> 5 coins)
    game = CoupEngine.executeAction(game, 'p1', { type: 'TAX' });
    game = passAllRemaining(game);
    expect(game.players[0]!.coins).toBe(5);

    // Bob (p2): INCOME
    game = CoupEngine.executeAction(game, 'p2', { type: 'INCOME' });
    expect(game.players[1]!.coins).toBe(1);

    // Eve (p5): INCOME
    game = CoupEngine.executeAction(game, 'p5', { type: 'INCOME' });
    expect(game.players[4]!.coins).toBe(4);

    // Alice (p1): TAX (+3 -> 8 coins)
    game = CoupEngine.executeAction(game, 'p1', { type: 'TAX' });
    game = passAllRemaining(game);
    expect(game.players[0]!.coins).toBe(8);

    // Bob (p2): INCOME
    game = CoupEngine.executeAction(game, 'p2', { type: 'INCOME' });

    // Eve (p5): INCOME
    game = CoupEngine.executeAction(game, 'p5', { type: 'INCOME' });

    // Alice (p1): COUP on Eve (p5) (Cost 7). Eve auto-reveals last card -> EVE ELIMINATED!
    game = CoupEngine.executeAction(game, 'p1', { type: 'COUP', targetPlayerId: 'p5' });
    expect(game.players[4]!.isAlive).toBe(false);

    // FINAL DUEL: Alice vs Bob!
    // Bob (p2): INCOME
    game = CoupEngine.executeAction(game, 'p2', { type: 'INCOME' });

    // Alice (p1): TAX (Duke). Bob challenges! Alice HAS DUKE! Bob loses his last card!
    game = CoupEngine.executeAction(game, 'p1', { type: 'TAX' });
    game = CoupEngine.declareChallenge(game, 'p2'); // Bob challenges Alice's Duke!

    // Bob's final card is auto-revealed because Bob lost the challenge!
    expect(game.players[1]!.isAlive).toBe(false); // BOB ELIMINATED!

    // MATCH FINISHED! ALICE IS THE WINNER!
    expect(game.phase).toBe('FINISHED');
    expect(game.winnerId).toBe('p1');

    // Verify final public spectator state serialization
    const finalSerialized = serializeGameStateForPlayer(game);
    expect(finalSerialized.winnerId).toBe('p1');
    expect(finalSerialized.players.find((p) => p.playerId === 'p1')?.isAlive).toBe(true);
  });
});
