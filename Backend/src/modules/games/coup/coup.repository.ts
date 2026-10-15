import { CoupGameState, PlayerSession } from './coup.types.js';

// In-Memory Fallback & Cache Store for high performance & testing
export class CoupRepository {
  private static sessions = new Map<string, PlayerSession>(); // playerId -> PlayerSession
  private static socketToPlayer = new Map<string, string>();  // socketId -> playerId
  private static matchStates = new Map<string, CoupGameState>(); // matchId -> CoupGameState
  private static lobbyCodeToId = new Map<string, string>();     // roomCode -> lobbyId

  public static async saveSession(session: PlayerSession): Promise<void> {
    this.sessions.set(session.playerId, session);
    if (session.socketId) {
      this.socketToPlayer.set(session.socketId, session.playerId);
    }
  }

  public static async getSession(playerId: string): Promise<PlayerSession | null> {
    return this.sessions.get(playerId) || null;
  }

  public static async getSessionBySocketId(socketId: string): Promise<PlayerSession | null> {
    const playerId = this.socketToPlayer.get(socketId);
    if (!playerId) return null;
    return this.getSession(playerId);
  }

  public static async removeSocketBinding(socketId: string): Promise<void> {
    const playerId = this.socketToPlayer.get(socketId);
    if (playerId) {
      this.socketToPlayer.delete(socketId);
      const session = this.sessions.get(playerId);
      if (session) {
        session.socketId = null;
        session.status = 'DISCONNECTED';
        session.disconnectedAt = Date.now();
      }
    }
  }

  public static async saveMatchState(state: CoupGameState): Promise<void> {
    this.matchStates.set(state.matchId, state);
  }

  public static async getMatchState(matchId: string): Promise<CoupGameState | null> {
    return this.matchStates.get(matchId) || null;
  }

  public static async registerLobbyCode(code: string, lobbyId: string): Promise<void> {
    this.lobbyCodeToId.set(code, lobbyId);
  }

  public static async getLobbyIdByCode(code: string): Promise<string | null> {
    return this.lobbyCodeToId.get(code.toUpperCase()) || null;
  }

  public static async getMatchStateByRoomCode(code: string): Promise<CoupGameState | null> {
    const uppercaseCode = code.toUpperCase();
    for (const state of this.matchStates.values()) {
      if (state.roomCode === uppercaseCode) {
        return state;
      }
    }
    return null;
  }
}
