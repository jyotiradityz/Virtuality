import { CoupActionPayload, CoupRole, SerializedGameState } from './coup.types.js';

export const COUP_EVENTS = {
  // Client -> Server
  LOBBY_CREATE: 'LOBBY_CREATE',
  LOBBY_JOIN: 'LOBBY_JOIN',
  LOBBY_RECONNECT: 'LOBBY_RECONNECT',
  PLAYER_READY: 'PLAYER_READY',
  START_GAME: 'START_GAME',
  COUP_ACTION: 'COUP_ACTION',
  CHALLENGE: 'CHALLENGE',
  BLOCK: 'BLOCK',
  PASS: 'PASS',
  REVEAL_CARD: 'REVEAL_CARD',
  EXCHANGE_SELECTION: 'EXCHANGE_SELECTION',

  // Server -> Client
  LOBBY_UPDATED: 'LOBBY_UPDATED',
  GAME_STARTED: 'GAME_STARTED',
  GAME_STATE: 'GAME_STATE',
  CHOOSE_CARD_TO_REVEAL: 'CHOOSE_CARD_TO_REVEAL',
  EXCHANGE_REQUIRED: 'EXCHANGE_REQUIRED',
  ERROR: 'ERROR',
  PLAYER_DISCONNECTED: 'PLAYER_DISCONNECTED',
  PLAYER_RECONNECTED: 'PLAYER_RECONNECTED',
  SESSION_REPLACED: 'SESSION_REPLACED',
} as const;

export interface ClientEventsMap {
  LOBBY_CREATE: (payload: { maxPlayers?: number; isPrivate?: boolean; password?: string }) => void;
  LOBBY_JOIN: (payload: { lobbyCode: string; password?: string }) => void;
  LOBBY_RECONNECT: (payload: { lobbyId: string; playerId: string; reconnectToken: string }) => void;
  PLAYER_READY: (payload: { ready: boolean }) => void;
  START_GAME: () => void;
  COUP_ACTION: (payload: CoupActionPayload) => void;
  CHALLENGE: () => void;
  BLOCK: (payload: { claimedRole: CoupRole }) => void;
  PASS: () => void;
  REVEAL_CARD: (payload: { cardId: string }) => void;
  EXCHANGE_SELECTION: (payload: { keptCardIds: string[] }) => void;
}

export interface ServerEventsMap {
  LOBBY_UPDATED: (data: unknown) => void;
  GAME_STARTED: (state: SerializedGameState) => void;
  GAME_STATE: (state: SerializedGameState) => void;
  CHOOSE_CARD_TO_REVEAL: (payload: { reason: string; availableCards: { id: string; role: CoupRole }[] }) => void;
  EXCHANGE_REQUIRED: (payload: { drawnCards: { id: string; role: CoupRole }[] }) => void;
  ERROR: (payload: { code: string; message: string }) => void;
  PLAYER_DISCONNECTED: (payload: { playerId: string; username: string }) => void;
  PLAYER_RECONNECTED: (payload: { playerId: string; username: string }) => void;
  SESSION_REPLACED: () => void;
}
