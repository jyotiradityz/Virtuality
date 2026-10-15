import { CoupEngine } from './coup.engine.js';
import { CoupError } from './coup.errors.js';
import { generateLobbyCode, generateReconnectToken, validateReconnectToken } from './coup.reconnect.js';
import { CoupRepository } from './coup.repository.js';

import {
  CoupActionPayload,
  CoupGameState,
  CoupRole,
  PlayerSession,
  SerializedGameState,
} from './coup.types.js';

export interface LobbyInfo {
  lobbyId: string;
  code: string;
  hostId: string;
  maxPlayers: number;
  isPrivate: boolean;
  password?: string;
  status: 'WAITING' | 'STARTING' | 'IN_PROGRESS' | 'FINISHED';
  players: {
    playerId: string;
    userId: string;
    username: string;
    avatarUrl?: string;
    isReady: boolean;
    isHost: boolean;
    socketId: string | null;
  }[];
  matchId?: string;
}

export class CoupService {
  private static lobbies = new Map<string, LobbyInfo>();

  public static async createLobby(
    hostUserId: string,
    hostUsername: string,
    options: { maxPlayers?: number; isPrivate?: boolean; password?: string }
  ): Promise<{ lobby: LobbyInfo; session: PlayerSession }> {
    const lobbyId = `lobby_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const code = generateLobbyCode();
    const playerId = `player_${hostUserId}`;
    const reconnectToken = generateReconnectToken(playerId, lobbyId);

    const lobby: LobbyInfo = {
      lobbyId,
      code,
      hostId: playerId,
      maxPlayers: options.maxPlayers || 6,
      isPrivate: !!options.isPrivate,
      password: options.password,
      status: 'WAITING',
      players: [
        {
          playerId,
          userId: hostUserId,
          username: hostUsername,
          isReady: true, // Host is ready by default
          isHost: true,
          socketId: null,
        },
      ],
    };

    const session: PlayerSession = {
      playerId,
      userId: hostUserId,
      lobbyId,
      reconnectToken,
      socketId: null,
      status: 'CONNECTED',
    };

    this.lobbies.set(lobbyId, lobby);
    await CoupRepository.registerLobbyCode(code, lobbyId);
    await CoupRepository.saveSession(session);

    return { lobby, session };
  }

  public static async joinLobbyByCode(
    userId: string,
    username: string,
    code: string,
    password?: string
  ): Promise<{ lobby: LobbyInfo; session: PlayerSession }> {
    const lobbyId = await CoupRepository.getLobbyIdByCode(code.toUpperCase());
    if (!lobbyId) {
      throw new CoupError('LOBBY_NOT_FOUND', 'Lobby with specified code was not found.');
    }

    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      throw new CoupError('LOBBY_NOT_FOUND', 'Lobby no longer exists.');
    }

    if (lobby.status !== 'WAITING') {
      throw new CoupError('GAME_ALREADY_STARTED', 'Match has already started.');
    }

    if (lobby.players.length >= lobby.maxPlayers) {
      throw new CoupError('LOBBY_FULL', 'Lobby is at maximum player capacity.');
    }

    if (lobby.isPrivate && lobby.password && lobby.password !== password) {
      throw new CoupError('INVALID_ACTION', 'Incorrect lobby password.');
    }

    const playerId = `player_${userId}`;
    let existingPlayer = lobby.players.find((p) => p.playerId === playerId);

    if (!existingPlayer) {
      existingPlayer = {
        playerId,
        userId,
        username,
        isReady: false,
        isHost: false,
        socketId: null,
      };
      lobby.players.push(existingPlayer);
    }

    const reconnectToken = generateReconnectToken(playerId, lobbyId);
    const session: PlayerSession = {
      playerId,
      userId,
      lobbyId,
      reconnectToken,
      socketId: null,
      status: 'CONNECTED',
    };

    await CoupRepository.saveSession(session);
    return { lobby, session };
  }

  public static async reconnectPlayer(
    lobbyId: string,
    playerId: string,
    reconnectToken: string,
    newSocketId: string
  ): Promise<{ lobby: LobbyInfo; session: PlayerSession; matchState?: CoupGameState }> {
    const session = await CoupRepository.getSession(playerId);
    if (!session || !validateReconnectToken(session, reconnectToken)) {
      throw new CoupError('INVALID_RECONNECT_TOKEN', 'Invalid or expired reconnect token.');
    }

    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      throw new CoupError('LOBBY_NOT_FOUND', 'Lobby not found.');
    }

    // Attach new socket
    session.socketId = newSocketId;
    session.status = 'CONNECTED';
    session.disconnectedAt = undefined;
    await CoupRepository.saveSession(session);

    const playerInLobby = lobby.players.find((p) => p.playerId === playerId);
    if (playerInLobby) {
      playerInLobby.socketId = newSocketId;
    }

    let matchState: CoupGameState | undefined;
    if (lobby.matchId) {
      const activeState = await CoupRepository.getMatchState(lobby.matchId);
      if (activeState) {
        const inGameState = activeState.players.find((p) => p.playerId === playerId);
        if (inGameState) {
          inGameState.connectionStatus = 'CONNECTED';
          inGameState.disconnectedAt = undefined;
        }
        matchState = activeState;
      }
    }

    return { lobby, session, matchState };
  }

  public static async startGame(hostPlayerId: string, lobbyId: string): Promise<CoupGameState> {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      throw new CoupError('LOBBY_NOT_FOUND', 'Lobby not found.');
    }

    if (lobby.hostId !== hostPlayerId) {
      throw new CoupError('NOT_HOST', 'Only the lobby host can start the game.');
    }

    if (lobby.players.length < 2) {
      throw new CoupError('INVALID_ACTION', 'At least 2 players are required to start Coup.');
    }

    const unready = lobby.players.filter((p) => !p.isReady);
    if (unready.length > 0) {
      throw new CoupError('INVALID_ACTION', 'All players must be ready before starting.');
    }

    const matchId = `match_${Date.now()}`;
    lobby.status = 'IN_PROGRESS';
    lobby.matchId = matchId;

    const gamePlayers = lobby.players.map((p) => ({
      playerId: p.playerId,
      userId: p.userId,
      username: p.username,
    }));

    const gameState = CoupEngine.createGame(matchId, lobby.code, gamePlayers);
    await CoupRepository.saveMatchState(gameState);

    // Populate session.matchId for all players so subsequent actions are authorized
    for (const player of lobby.players) {
      const playerSession = await CoupRepository.getSession(player.playerId);
      if (playerSession) {
        playerSession.matchId = matchId;
        await CoupRepository.saveSession(playerSession);
      }
    }

    return gameState;
  }

  public static setPlayerReady(lobbyId: string, playerId: string, isReady: boolean): LobbyInfo | null {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return null;
    const player = lobby.players.find((p) => p.playerId === playerId);
    if (player) {
      player.isReady = isReady;
    }
    return lobby;
  }

  public static async executeAction(
    matchId: string,
    playerId: string,
    action: CoupActionPayload
  ): Promise<CoupGameState> {
    const state = await CoupRepository.getMatchState(matchId);
    if (!state) {
      throw new CoupError('NOT_IN_GAME', 'Match state not found.');
    }

    const updatedState = CoupEngine.executeAction(state, playerId, action);
    await CoupRepository.saveMatchState(updatedState);
    return updatedState;
  }

  public static async challenge(matchId: string, playerId: string): Promise<CoupGameState> {
    const state = await CoupRepository.getMatchState(matchId);
    if (!state) throw new CoupError('NOT_IN_GAME', 'Match state not found.');

    const updatedState = CoupEngine.declareChallenge(state, playerId);
    await CoupRepository.saveMatchState(updatedState);
    return updatedState;
  }

  public static async block(
    matchId: string,
    playerId: string,
    claimedRole: CoupRole
  ): Promise<CoupGameState> {
    const state = await CoupRepository.getMatchState(matchId);
    if (!state) throw new CoupError('NOT_IN_GAME', 'Match state not found.');

    const updatedState = CoupEngine.declareBlock(state, playerId, claimedRole);
    await CoupRepository.saveMatchState(updatedState);
    return updatedState;
  }

  public static async pass(matchId: string, playerId: string): Promise<CoupGameState> {
    const state = await CoupRepository.getMatchState(matchId);
    if (!state) throw new CoupError('NOT_IN_GAME', 'Match state not found.');

    const updatedState = CoupEngine.passResponse(state, playerId);
    await CoupRepository.saveMatchState(updatedState);
    return updatedState;
  }

  public static async revealCard(
    matchId: string,
    playerId: string,
    cardId: string
  ): Promise<CoupGameState> {
    const state = await CoupRepository.getMatchState(matchId);
    if (!state) throw new CoupError('NOT_IN_GAME', 'Match state not found.');

    const updatedState = CoupEngine.revealCard(state, playerId, cardId);
    await CoupRepository.saveMatchState(updatedState);
    return updatedState;
  }

  public static async exchangeSelection(
    matchId: string,
    playerId: string,
    keptCardIds: string[]
  ): Promise<CoupGameState> {
    const state = await CoupRepository.getMatchState(matchId);
    if (!state) throw new CoupError('NOT_IN_GAME', 'Match state not found.');

    const updatedState = CoupEngine.executeExchangeSelection(state, playerId, keptCardIds);
    await CoupRepository.saveMatchState(updatedState);
    return updatedState;
  }

  public static getLobby(lobbyId: string): LobbyInfo | undefined {
    return this.lobbies.get(lobbyId);
  }
}
