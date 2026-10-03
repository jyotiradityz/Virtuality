export type Role = 'Duke' | 'Assassin' | 'Captain' | 'Ambassador' | 'Contessa';

export interface CardState {
  id: string;
  role: Role;
  isRevealed: boolean;
}

export interface Player {
  id: string;
  name: string;
  coins: number;
  cards: CardState[];
  isAlive: boolean;
  isLocalPlayer: boolean;
  seatIndex: number;
}

export type ActionType =
  | 'INCOME'
  | 'FOREIGN_AID'
  | 'TAX'
  | 'STEAL'
  | 'ASSASSINATE'
  | 'EXCHANGE'
  | 'COUP';

export interface GameAction {
  type: ActionType;
  playerId: string;
  targetId?: string;
  claimedRole?: Role;
}

export type GamePhase =
  | 'WAITING_FOR_PLAYERS'
  | 'ACTION_SELECTION'
  | 'RESPONSE_WINDOW'
  | 'BLOCK_RESPONSE_WINDOW'
  | 'LOSE_INFLUENCE_PENDING'
  | 'EXCHANGE_PENDING'
  | 'GAME_OVER';

export interface PendingAction {
  action: GameAction;
  sourcePlayerId: string;
  targetPlayerId?: string;
  block?: {
    blockerPlayerId: string;
    claimedRole: Role;
  } | null;
}

export interface PendingLoseInfluence {
  playerId: string;
  reason: string;
  onSuccessNextPhase?: GamePhase;
}

export interface PendingExchange {
  playerId: string;
  drawnCards: CardState[];
}

export interface GameLogEntry {
  id: string;
  text: string;
  timestamp: number;
  type: 'INFO' | 'ACTION' | 'CHALLENGE' | 'BLOCK' | 'RESOLUTION';
}

export interface GameState {
  players: Player[];
  turnIndex: number;
  coinPile: number;
  deck: Role[];
  phase: GamePhase;
  pendingAction: PendingAction | null;
  pendingLoseInfluence: PendingLoseInfluence | null;
  pendingExchange: PendingExchange | null;
  winnerId: string | null;
  gameLog: GameLogEntry[];
}

export interface ActionOption {
  action: GameAction;
  label: string;
  disabled: boolean;
  reason?: string;
  claimedRole?: Role;
  cost?: number;
}

export interface RoomInfo {
  roomId: string;
  roomCode: string;
  hostId: string;
  players: {
    id: string;
    name: string;
    isHost: boolean;
    isReady: boolean;
  }[];
  isGameStarted: boolean;
}
