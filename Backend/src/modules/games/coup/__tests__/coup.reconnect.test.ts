import { describe, expect, it } from 'vitest';
import { generateLobbyCode, generateReconnectToken, validateReconnectToken } from '../coup.reconnect.js';
import { PlayerSession } from '../coup.types.js';

describe('Coup Session & Reconnection Security', () => {
  it('generates 6-character uppercase lobby code avoiding ambiguous characters', () => {
    const code = generateLobbyCode();
    expect(code).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/);
    expect(code).not.toContain('0');
    expect(code).not.toContain('O');
    expect(code).not.toContain('I');
    expect(code).not.toContain('1');
  });

  it('validates matching reconnect tokens and rejects forged tokens', () => {
    const token = generateReconnectToken('p1', 'l1');
    const session: PlayerSession = {
      playerId: 'p1',
      userId: 'u1',
      lobbyId: 'l1',
      reconnectToken: token,
      socketId: 'sock1',
      status: 'CONNECTED',
    };

    expect(validateReconnectToken(session, token)).toBe(true);
    expect(validateReconnectToken(session, 'forged_token_123')).toBe(false);
  });
});
