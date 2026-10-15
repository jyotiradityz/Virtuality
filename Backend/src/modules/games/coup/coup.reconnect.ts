import crypto from 'crypto';
import { PlayerSession } from './coup.types.js';

const SECRET_KEY = process.env.SESSION_SECRET || 'virtuality_coup_secret_key_2026';

export function generateReconnectToken(playerId: string, lobbyId: string): string {
  const payload = `${playerId}:${lobbyId}:${Date.now()}`;
  return crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
}

export function validateReconnectToken(
  session: PlayerSession,
  token: string
): boolean {
  if (!session || !session.reconnectToken) return false;
  return session.reconnectToken === token;
}

export function generateLobbyCode(): string {
  // 6 uppercase chars, avoiding ambiguous 0, O, I, 1
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    code += charset[randomIndex];
  }
  return code;
}
