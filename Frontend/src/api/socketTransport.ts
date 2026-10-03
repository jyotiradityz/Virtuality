import { io, Socket } from 'socket.io-client';
import type { GameState, GameAction, Role, RoomInfo } from '../types/game';
import type { ITransport } from './transport';

export class SocketTransport implements ITransport {
  private socket: Socket;
  private stateCallback: ((state: GameState) => void) | null = null;
  private lobbyCallback: ((lobby: RoomInfo) => void) | null = null;

  constructor(serverUrl: string = 'http://localhost:4000') {
    this.socket = io(serverUrl, { autoConnect: false });
  }

  async connect(): Promise<void> {
    this.socket.connect();

    this.socket.on('game:started', (state: GameState) => {
      if (this.stateCallback) this.stateCallback(state);
    });

    this.socket.on('game:state_update', (state: GameState) => {
      if (this.stateCallback) this.stateCallback(state);
    });

    this.socket.on('lobby:update', (info: RoomInfo) => {
      if (this.lobbyCallback) this.lobbyCallback(info);
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
    return new Promise((resolve, reject) => {
      this.socket.emit('lobby:create', { playerName }, (res: { success: boolean; roomInfo?: RoomInfo; error?: string }) => {
        if (res.success && res.roomInfo) resolve(res.roomInfo);
        else reject(new Error(res.error || 'Failed to create room'));
      });
    });
  }

  async joinRoom(roomCode: string, playerName: string): Promise<RoomInfo> {
    return new Promise((resolve, reject) => {
      this.socket.emit('lobby:join', { roomCode, playerName }, (res: { success: boolean; roomInfo?: RoomInfo; error?: string }) => {
        if (res.success && res.roomInfo) resolve(res.roomInfo);
        else reject(new Error(res.error || 'Failed to join room'));
      });
    });
  }

  async startGame(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.emit('game:start', {}, (res: { success: boolean; error?: string }) => {
        if (res.success) resolve();
        else reject(new Error(res.error || 'Failed to start game'));
      });
    });
  }

  async sendAction(action: GameAction): Promise<void> {
    this.socket.emit('game:action', action);
  }

  async sendPass(): Promise<void> {
    this.socket.emit('game:pass');
  }

  async sendBlock(blockerId: string, claimedRole: Role): Promise<void> {
    this.socket.emit('game:block', { blockerId, claimedRole });
  }

  async sendChallenge(challengerId: string): Promise<void> {
    this.socket.emit('game:challenge', { challengerId });
  }

  async sendLoseInfluence(playerId: string, cardId: string): Promise<void> {
    this.socket.emit('game:lose_influence', { playerId, cardId });
  }

  async sendExchange(keptCardIds: string[]): Promise<void> {
    this.socket.emit('game:exchange', { keptCardIds });
  }
}
