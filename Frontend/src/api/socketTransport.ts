import { io, Socket } from 'socket.io-client';
import type { GameState, GameAction, Role, RoomInfo, GamePhase, Player, ActionType } from '../types/game';
import type { ITransport } from './transport';

export class SocketTransport implements ITransport {
  private socket: Socket;
  private stateCallback: ((state: GameState) => void) | null = null;
  private lobbyCallback: ((lobby: RoomInfo) => void) | null = null;
  private localPlayerId: string | null = null;
  private localPlayerName: string | null = null;

  constructor(serverUrl?: string) {
    const defaultUrl = typeof window !== 'undefined' ? `http://${window.location.hostname}:4000` : 'http://localhost:4000';
    this.socket = io(serverUrl || defaultUrl, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      timeout: 8000,
    });
  }

  async connect(): Promise<void> {
    if (this.socket.connected) return;

    return new Promise((resolve) => {
      const fallback = setTimeout(() => resolve(), 1500);
      this.socket.once('connect', () => {
        clearTimeout(fallback);
        resolve();
      });

      this.socket.on('GAME_STATE', (rawState: any) => this.handleRawState(rawState));
      this.socket.on('game:state_update', (rawState: any) => this.handleRawState(rawState));
      this.socket.on('game:started', (rawState: any) => this.handleRawState(rawState));

      this.socket.on('LOBBY_UPDATED', (info: any) => {
        if (this.lobbyCallback && info.lobby) {
          this.lobbyCallback(this.normalizeLobby(info.lobby));
        }
      });

      this.socket.on('lobby:update', (info: RoomInfo) => {
        if (this.lobbyCallback) this.lobbyCallback(info);
      });

      this.socket.connect();
    });
  }

  disconnect(): void {
    this.socket.disconnect();
  }

  onStateUpdate(callback: (state: GameState) => void): void {
    this.stateCallback = callback;
  }

  onLobbyUpdate(callback: (lobby: RoomInfo) => void): void {
    this.lobbyCallback = callback;
  }

  async createRoom(playerName: string): Promise<RoomInfo> {
    this.localPlayerName = playerName;
    if (!this.socket.connected) {
      await this.connect();
    }
    return new Promise((resolve, reject) => {
      this.socket.emit('lobby:create', { playerName, username: playerName }, (res: { success: boolean; roomInfo?: RoomInfo; error?: string }) => {
        if (res && res.success && res.roomInfo) {
          this.localPlayerId = res.roomInfo.hostId;
          resolve(res.roomInfo);
        } else {
          reject(new Error(res?.error || 'Failed to create room'));
        }
      });
    });
  }

  async joinRoom(roomCode: string, playerName: string): Promise<RoomInfo> {
    this.localPlayerName = playerName;
    if (!this.socket.connected) {
      await this.connect();
    }
    return new Promise((resolve, reject) => {
      this.socket.emit('lobby:join', { roomCode, lobbyCode: roomCode, playerName, username: playerName }, (res: { success: boolean; roomInfo?: RoomInfo; error?: string }) => {
        if (res && res.success && res.roomInfo) {
          const localP = res.roomInfo.players.find(p => p.name === playerName);
          if (localP) this.localPlayerId = localP.id;
          resolve(res.roomInfo);
        } else {
          reject(new Error(res?.error || 'Failed to join room'));
        }
      });
    });
  }

  async setReady(isReady: boolean): Promise<void> {
    return new Promise((resolve) => {
      this.socket.emit('player:ready', { ready: isReady }, (res: any) => {
        if (res?.roomInfo && this.lobbyCallback) {
          this.lobbyCallback(res.roomInfo);
        }
        resolve();
      });
    });
  }

  async startGame(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.emit('game:start', {}, (res: { success: boolean; error?: string }) => {
        if (res && res.success) resolve();
        else reject(new Error(res?.error || 'Failed to start game'));
      });
    });
  }

  async addTestPlayer(roomCode: string): Promise<void> {
    const testSocket = io(typeof window !== 'undefined' ? `http://${window.location.hostname}:4000` : 'http://localhost:4000', {
      transports: ['websocket', 'polling'],
    });

    const testName = 'TestBot_' + Math.floor(100 + Math.random() * 900);
    testSocket.emit('lobby:join', { roomCode, lobbyCode: roomCode, playerName: testName, username: testName }, (res: any) => {
      if (res?.success) {
        testSocket.emit('player:ready', { ready: true });
      }
    });
  }

  async reconnectMatch(roomCode: string, playerName: string): Promise<void> {
    this.localPlayerName = playerName;
    return new Promise((resolve) => {
      this.socket.emit('match:reconnect', { roomCode, playerName }, (res: any) => {
        if (res?.playerId) {
          this.localPlayerId = res.playerId;
        }
        resolve();
      });
    });
  }

  async sendAction(action: GameAction): Promise<void> {
    const payload: any = { type: action.type };
    if (action.targetId) payload.targetPlayerId = action.targetId;
    this.socket.emit('COUP_ACTION', payload);
    this.socket.emit('game:action', payload);
  }

  async sendPass(): Promise<void> {
    this.socket.emit('PASS');
    this.socket.emit('game:pass');
  }

  async sendBlock(_blockerId: string, claimedRole: Role): Promise<void> {
    const roleUpper = claimedRole.toUpperCase();
    this.socket.emit('BLOCK', { claimedRole: roleUpper });
    this.socket.emit('game:block', { claimedRole: roleUpper });
  }

  async sendChallenge(_challengerId: string): Promise<void> {
    this.socket.emit('CHALLENGE');
    this.socket.emit('game:challenge');
  }

  async sendLoseInfluence(_playerId: string, cardId: string): Promise<void> {
    this.socket.emit('REVEAL_CARD', { cardId });
    this.socket.emit('game:lose_influence', { cardId });
  }

  async sendExchange(keptCardIds: string[]): Promise<void> {
    this.socket.emit('EXCHANGE_SELECTION', { keptCardIds });
    this.socket.emit('game:exchange', { keptCardIds });
  }

  private handleRawState(raw: any): void {
    if (!this.stateCallback || !raw) return;

    // Convert raw server state to Frontend GameState structure
    const phaseMap: Record<string, GamePhase> = {
      PLAYER_TURN: 'ACTION_SELECTION',
      ACTION_RESPONSE: 'RESPONSE_WINDOW',
      BLOCK_RESPONSE: 'BLOCK_RESPONSE_WINDOW',
      CHALLENGE_RESPONSE: 'RESPONSE_WINDOW',
      CHOOSE_INFLUENCE: 'LOSE_INFLUENCE_PENDING',
      EXCHANGE: 'EXCHANGE_PENDING',
      FINISHED: 'GAME_OVER',
    };

    const phase = phaseMap[raw.phase] || 'ACTION_SELECTION';
    const turnIndex = Math.max(0, raw.players.findIndex((p: any) => p.playerId === raw.currentPlayerId));

    if (!this.localPlayerId && this.localPlayerName && raw.players) {
      const matched = raw.players.find((p: any) => p.username === this.localPlayerName);
      if (matched) this.localPlayerId = matched.playerId;
    }

    const players: Player[] = (raw.players || []).map((p: any, idx: number) => ({
      id: p.playerId,
      name: p.username || `Player ${idx + 1}`,
      coins: p.coins ?? 2,
      isAlive: p.isAlive ?? true,
      seatIndex: p.seatIndex ?? idx,
      isLocalPlayer: Boolean(
        (this.localPlayerId && p.playerId === this.localPlayerId) ||
        (this.localPlayerName && p.username === this.localPlayerName) ||
        (!this.localPlayerId && !this.localPlayerName && idx === 0)
      ),
      cards: (p.cards || []).map((c: any) => ({
        id: c.id,
        role: c.role ? ((c.role.charAt(0) + c.role.slice(1).toLowerCase()) as Role) : 'Duke',
        isRevealed: c.status === 'REVEALED',
      })),
    }));

    const normalizedState: GameState = {
      players,
      turnIndex,
      coinPile: raw.coinPile ?? 50,
      deck: [],
      phase,
      pendingAction: raw.pendingAction
        ? {
            action: {
              type: (raw.pendingAction.action?.type || raw.pendingAction.actionType || 'INCOME') as ActionType,
              playerId: raw.pendingAction.actorId,
              targetId: raw.pendingAction.targetId || raw.pendingAction.action?.targetPlayerId,
              claimedRole: raw.pendingAction.claimedRole
                ? ((raw.pendingAction.claimedRole.charAt(0) + raw.pendingAction.claimedRole.slice(1).toLowerCase()) as Role)
                : undefined,
            },
            sourcePlayerId: raw.pendingAction.actorId,
            targetPlayerId: raw.pendingAction.targetId || raw.pendingAction.action?.targetPlayerId,
            block: raw.pendingAction.block
              ? {
                  blockerPlayerId: raw.pendingAction.block.blockerId,
                  claimedRole: raw.pendingAction.block.claimedRole
                    ? ((raw.pendingAction.block.claimedRole.charAt(0) + raw.pendingAction.block.claimedRole.slice(1).toLowerCase()) as Role)
                    : 'Duke',
                }
              : null,
          }
        : null,
      pendingLoseInfluence: raw.pendingLoseInfluence
        ? {
            playerId: raw.pendingLoseInfluence.playerId,
            reason: raw.pendingLoseInfluence.reason,
          }
        : null,
      pendingExchange: raw.pendingExchange
        ? {
            playerId: raw.pendingExchange.playerId,
            drawnCards: (raw.pendingExchange.drawnCards || []).map((c: any) => ({
              id: c.id,
              role: (c.role.charAt(0) + c.role.slice(1).toLowerCase()) as Role,
              isRevealed: false,
            })),
          }
        : null,
      winnerId: raw.winnerId || null,
      gameLog: [],
    };

    this.stateCallback(normalizedState);
  }

  private normalizeLobby(lobby: any): RoomInfo {
    return {
      roomId: lobby.lobbyId,
      roomCode: lobby.code,
      hostId: lobby.hostId,
      players: (lobby.players || []).map((p: any) => ({
        id: p.playerId,
        name: p.username,
        isHost: p.isHost,
        isReady: p.isReady,
      })),
      isGameStarted: lobby.status === 'IN_PROGRESS',
    };
  }
}
