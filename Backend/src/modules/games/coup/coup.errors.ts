export type CoupErrorCode =
  | 'NOT_IN_LOBBY'
  | 'NOT_IN_GAME'
  | 'NOT_YOUR_TURN'
  | 'INVALID_PHASE'
  | 'INVALID_ACTION'
  | 'INVALID_TARGET'
  | 'INSUFFICIENT_COINS'
  | 'MANDATORY_COUP_REQUIRED'
  | 'PLAYER_ELIMINATED'
  | 'ALREADY_RESPONDED'
  | 'RESPONSE_WINDOW_CLOSED'
  | 'INVALID_CARD'
  | 'LOBBY_FULL'
  | 'LOBBY_NOT_FOUND'
  | 'GAME_ALREADY_STARTED'
  | 'INVALID_RECONNECT_TOKEN'
  | 'CANNOT_TARGET_SELF'
  | 'NOT_HOST';

export class CoupError extends Error {
  constructor(
    public readonly code: CoupErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'CoupError';
    Object.setPrototypeOf(this, CoupError.prototype);
  }
}
