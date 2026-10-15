export type CoupRole = 'DUKE' | 'ASSASSIN' | 'CAPTAIN' | 'AMBASSADOR' | 'CONTESSA';

export interface CoupCard {
  id: string;
  role: CoupRole;
  status: 'ALIVE' | 'REVEALED';
}

export type ConnectionStatus = 'CONNECTED' | 'DISCONNECTED';

export interface CoupPlayerState {
  playerId: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  seatIndex: number;
  coins: number;
  cards: CoupCard[];
  isAlive: boolean;
  connectionStatus: ConnectionStatus;
  disconnectedAt?: number;
}

export type CoupPhase =
  | 'PLAYER_TURN'
  | 'ACTION_RESPONSE'
  | 'BLOCK_RESPONSE'
  | 'CHALLENGE_RESPONSE'
  | 'CHOOSE_INFLUENCE'
  | 'EXCHANGE'
  | 'FINISHED';

export type CoupActionType =
  | 'INCOME'
  | 'FOREIGN_AID'
  | 'TAX'
  | 'STEAL'
  | 'EXCHANGE'
  | 'ASSASSINATE'
  | 'COUP';

export type CoupActionPayload =
  | { type: 'INCOME' }
  | { type: 'FOREIGN_AID' }
  | { type: 'TAX' }
  | { type: 'STEAL'; targetPlayerId: string }
  | { type: 'EXCHANGE' }
  | { type: 'ASSASSINATE'; targetPlayerId: string }
  | { type: 'COUP'; targetPlayerId: string };

export interface PendingBlock {
  blockerId: string;
  claimedRole: CoupRole;
  passes: string[];
}

export interface CoupPendingAction {
  id: string;
  actorId: string;
  action: CoupActionPayload;
  claimedRole?: CoupRole;
  targetId?: string;
  passes: string[];
  block?: PendingBlock;
}

export interface PendingLoseInfluence {
  playerId: string;
  reason: string;
  returnPhase: CoupPhase;
  postRevealAction?: 'ADVANCE_TURN' | 'EXECUTE_PENDING_ACTION' | 'RESOLVE_ACTION_AFTER_CHALLENGE_SUCCESS';
}

export interface PendingExchange {
  playerId: string;
  drawnCards: CoupCard[];
}

export interface CoupGameState {
  matchId: string;
  roomCode: string;
  phase: CoupPhase;
  players: CoupPlayerState[];
  deck: CoupCard[];
  currentPlayerId: string;
  coinPile: number;
  pendingAction?: CoupPendingAction;
  pendingLoseInfluence?: PendingLoseInfluence;
  pendingExchange?: PendingExchange;
  winnerId?: string;
  version: number;
  responseDeadline?: number;
}

export interface SerializedCard {
  id: string;
  role?: CoupRole;
  status: 'ALIVE' | 'REVEALED';
}

export interface SerializedPlayer {
  playerId: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  seatIndex: number;
  coins: number;
  influence: number;
  isAlive: boolean;
  connectionStatus: ConnectionStatus;
  cards: SerializedCard[];
}

export interface SerializedGameState {
  matchId: string;
  roomCode: string;
  phase: CoupPhase;
  currentPlayerId: string;
  coinPile: number;
  version: number;
  responseDeadline?: number;
  players: SerializedPlayer[];
  pendingAction?: {
    id: string;
    actorId: string;
    actionType: CoupActionType;
    targetId?: string;
    claimedRole?: CoupRole;
    block?: {
      blockerId: string;
      claimedRole: CoupRole;
    };
  };
  pendingLoseInfluence?: {
    playerId: string;
    reason: string;
  };
  pendingExchange?: {
    playerId: string;
    drawnCards: SerializedCard[];
  };
  winnerId?: string;
}

export interface PlayerSession {
  playerId: string;
  userId: string;
  lobbyId: string;
  matchId?: string;
  reconnectToken: string;
  socketId: string | null;
  status: ConnectionStatus;
  disconnectedAt?: number;
}
