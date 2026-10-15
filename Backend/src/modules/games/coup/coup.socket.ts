import { Server, Socket } from 'socket.io';
import { COUP_EVENTS } from './coup.events.js';
import { CoupRepository } from './coup.repository.js';
import { serializeGameStateForPlayer } from './coup.serializer.js';
import { CoupService, LobbyInfo } from './coup.service.js';
import { CoupActionPayload, CoupGameState, CoupRole } from './coup.types.js';

function formatRoomInfo(lobby: LobbyInfo) {
  return {
    roomId: lobby.lobbyId,
    roomCode: lobby.code,
    hostId: lobby.hostId,
    players: lobby.players.map((p) => ({
      id: p.playerId,
      name: p.username,
      isHost: p.isHost,
      isReady: p.isReady,
    })),
    isGameStarted: lobby.status === 'IN_PROGRESS',
  };
}

export function setupCoupSocketHandlers(io: Server): void {
  io.on('connection', (socket: Socket) => {
    // Helper to get or recover active matchId for session
    const getActiveMatchId = async (session: any): Promise<string | null> => {
      if (session.matchId) return session.matchId;
      const lobby = CoupService.getLobby(session.lobbyId);
      if (lobby && lobby.matchId) {
        session.matchId = lobby.matchId;
        await CoupRepository.saveSession(session);
        return lobby.matchId;
      }
      return null;
    };

    // 1. Create Lobby
    const handleCreateLobby = async (
      payload: { playerName?: string; username?: string; maxPlayers?: number; isPrivate?: boolean; password?: string },
      callback?: (res: any) => void
    ) => {
      try {
        const username = payload?.playerName || payload?.username || (socket.data.username as string) || `Player_${socket.id.substring(0, 4)}`;
        const userId = (socket.data.userId as string) || `user_${socket.id.substring(0, 5)}`;
        socket.data.username = username;
        socket.data.userId = userId;

        const { lobby, session } = await CoupService.createLobby(userId, username, {
          maxPlayers: payload?.maxPlayers,
          isPrivate: payload?.isPrivate,
          password: payload?.password,
        });

        session.socketId = socket.id;
        await CoupRepository.saveSession(session);

        const roomName = `lobby:${lobby.lobbyId}`;
        await socket.join(roomName);

        const roomInfo = formatRoomInfo(lobby);

        if (typeof callback === 'function') {
          callback({ success: true, roomInfo, reconnectToken: session.reconnectToken });
        }

        socket.emit(COUP_EVENTS.LOBBY_UPDATED, { lobby, reconnectToken: session.reconnectToken });
        io.to(roomName).emit('lobby:update', roomInfo);
      } catch (err: any) {
        if (typeof callback === 'function') {
          callback({ success: false, error: err.message });
        }
        socket.emit(COUP_EVENTS.ERROR, { code: err.code || 'LOBBY_CREATE_FAILED', message: err.message });
      }
    };

    socket.on(COUP_EVENTS.LOBBY_CREATE, (data, cb) => handleCreateLobby(data, cb));
    socket.on('lobby:create', (data, cb) => handleCreateLobby(data, cb));

    // 2. Join Lobby
    const handleJoinLobby = async (
      payload: { lobbyCode?: string; roomCode?: string; playerName?: string; username?: string; password?: string },
      callback?: (res: any) => void
    ) => {
      try {
        const code = (payload?.lobbyCode || payload?.roomCode || '').trim();
        if (!code) {
          throw new Error('Lobby code is required');
        }

        const username = payload?.playerName || payload?.username || (socket.data.username as string) || `Player_${socket.id.substring(0, 4)}`;
        const userId = (socket.data.userId as string) || `user_${socket.id.substring(0, 5)}`;
        socket.data.username = username;
        socket.data.userId = userId;

        const { lobby, session } = await CoupService.joinLobbyByCode(
          userId,
          username,
          code,
          payload?.password
        );

        session.socketId = socket.id;
        await CoupRepository.saveSession(session);

        const roomName = `lobby:${lobby.lobbyId}`;
        await socket.join(roomName);

        if (lobby.matchId) {
          await socket.join(`match:${lobby.matchId}`);
        }

        const roomInfo = formatRoomInfo(lobby);

        if (typeof callback === 'function') {
          callback({ success: true, roomInfo, reconnectToken: session.reconnectToken });
        }

        io.to(roomName).emit(COUP_EVENTS.LOBBY_UPDATED, { lobby });
        io.to(roomName).emit('lobby:update', roomInfo);
        socket.emit(COUP_EVENTS.LOBBY_UPDATED, { lobby, reconnectToken: session.reconnectToken });

        // If match already started, stream game state
        if (lobby.matchId) {
          const matchState = await CoupRepository.getMatchState(lobby.matchId);
          if (matchState) {
            const playerState = serializeGameStateForPlayer(matchState, session.playerId);
            socket.emit(COUP_EVENTS.GAME_STATE, playerState);
            socket.emit('game:state_update', playerState);
          }
        }
      } catch (err: any) {
        if (typeof callback === 'function') {
          callback({ success: false, error: err.message });
        }
        socket.emit(COUP_EVENTS.ERROR, { code: err.code || 'LOBBY_JOIN_FAILED', message: err.message });
      }
    };

    socket.on(COUP_EVENTS.LOBBY_JOIN, (data, cb) => handleJoinLobby(data, cb));
    socket.on('lobby:join', (data, cb) => handleJoinLobby(data, cb));

    // 3. Player Ready Toggle
    const handleReadyToggle = async (payload: { ready?: boolean }, callback?: (res: any) => void) => {
      try {
        const session = await CoupRepository.getSessionBySocketId(socket.id);
        if (!session) {
          if (typeof callback === 'function') callback({ success: false, error: 'Session not found' });
          return;
        }

        const isReady = typeof payload?.ready === 'boolean' ? payload.ready : true;
        const updatedLobby = CoupService.setPlayerReady(session.lobbyId, session.playerId, isReady);
        if (!updatedLobby) {
          if (typeof callback === 'function') callback({ success: false, error: 'Lobby not found' });
          return;
        }

        const roomName = `lobby:${updatedLobby.lobbyId}`;
        const roomInfo = formatRoomInfo(updatedLobby);

        if (typeof callback === 'function') callback({ success: true, roomInfo });
        io.to(roomName).emit(COUP_EVENTS.LOBBY_UPDATED, { lobby: updatedLobby });
        io.to(roomName).emit('lobby:update', roomInfo);
      } catch (err: any) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
        socket.emit(COUP_EVENTS.ERROR, { code: 'READY_FAILED', message: err.message });
      }
    };

    socket.on(COUP_EVENTS.PLAYER_READY, (data, cb) => handleReadyToggle(data, cb));
    socket.on('player:ready', (data, cb) => handleReadyToggle(data, cb));
    socket.on('lobby:ready', (data, cb) => handleReadyToggle(data, cb));

    // 4. Host Start Game
    const handleStartGame = async (_payload: any, callback?: (res: any) => void) => {
      try {
        const session = await CoupRepository.getSessionBySocketId(socket.id);
        if (!session) throw new Error('Session not found');

        const gameState = await CoupService.startGame(session.playerId, session.lobbyId);
        const lobby = CoupService.getLobby(session.lobbyId)!;

        // Join sockets to match room
        for (const player of lobby.players) {
          if (player.socketId) {
            const clientSocket = io.sockets.sockets.get(player.socketId);
            if (clientSocket) {
              await clientSocket.join(`match:${gameState.matchId}`);
            }
          }
        }

        const roomInfo = formatRoomInfo(lobby);

        if (typeof callback === 'function') callback({ success: true, roomInfo });

        io.to(`lobby:${lobby.lobbyId}`).emit('lobby:update', roomInfo);
        io.to(`lobby:${lobby.lobbyId}`).emit(COUP_EVENTS.GAME_STARTED, gameState);
        io.to(`lobby:${lobby.lobbyId}`).emit('game:started', gameState);

        broadcastGameState(io, gameState);
      } catch (err: any) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
        socket.emit(COUP_EVENTS.ERROR, { code: err.code || 'START_GAME_FAILED', message: err.message });
      }
    };

    socket.on(COUP_EVENTS.START_GAME, (data, cb) => handleStartGame(data, cb));
    socket.on('game:start', (data, cb) => handleStartGame(data, cb));

    // 5. Match Reconnect / Re-attachment
    socket.on(
      COUP_EVENTS.LOBBY_RECONNECT,
      async (payload: { lobbyId: string; playerId: string; reconnectToken: string }) => {
        try {
          const { lobby, session, matchState } = await CoupService.reconnectPlayer(
            payload.lobbyId,
            payload.playerId,
            payload.reconnectToken,
            socket.id
          );

          const roomName = `lobby:${lobby.lobbyId}`;
          await socket.join(roomName);

          if (lobby.matchId) {
            await socket.join(`match:${lobby.matchId}`);
          }

          socket.emit(COUP_EVENTS.LOBBY_UPDATED, { lobby, reconnectToken: session.reconnectToken });
          socket.emit('lobby:update', formatRoomInfo(lobby));

          if (matchState) {
            broadcastGameState(io, matchState);
          }
        } catch (err: any) {
          socket.emit(COUP_EVENTS.ERROR, { code: err.code || 'RECONNECT_FAILED', message: err.message });
        }
      }
    );

    // Reconnect by roomCode (when player opens /coup/:roomCode/game)
    socket.on('match:reconnect', async (data: { roomCode: string; playerName?: string }, callback?: Function) => {
      try {
        const { roomCode, playerName } = data;
        const lobbyId = await CoupRepository.getLobbyIdByCode(roomCode);
        if (!lobbyId) throw new Error('Lobby not found');
        const lobby = CoupService.getLobby(lobbyId);
        if (!lobby) throw new Error('Lobby not found');

        // Locate existing player in lobby or re-bind
        let player = lobby.players.find((p) => p.username === playerName);
        if (!player && lobby.players.length > 0) {
          player = lobby.players[0]; // fallback
        }

        if (player) {
          player.socketId = socket.id;
          const session = await CoupRepository.getSession(player.playerId);
          if (session) {
            session.socketId = socket.id;
            session.status = 'CONNECTED';
            if (lobby.matchId) session.matchId = lobby.matchId;
            await CoupRepository.saveSession(session);
          }

          await socket.join(`lobby:${lobby.lobbyId}`);
          if (lobby.matchId) {
            await socket.join(`match:${lobby.matchId}`);
          }

          const roomInfo = formatRoomInfo(lobby);
          if (callback) callback({ success: true, roomInfo, playerId: player.playerId });

          if (lobby.matchId) {
            const matchState = await CoupRepository.getMatchState(lobby.matchId);
            if (matchState) {
              const playerState = serializeGameStateForPlayer(matchState, player.playerId);
              socket.emit(COUP_EVENTS.GAME_STATE, playerState);
              socket.emit('game:state_update', playerState);
            }
          }
        }
      } catch (err: any) {
        if (callback) callback({ success: false, error: err.message });
      }
    });

    // 6. Action Execution
    const handleAction = async (payload: any) => {
      try {
        const session = await CoupRepository.getSessionBySocketId(socket.id);
        if (!session) throw new Error('Player session not found');
        const matchId = await getActiveMatchId(session);
        if (!matchId) throw new Error('Match not found for session');

        // Normalize payload: support both targetId and targetPlayerId
        const actionPayload: CoupActionPayload = {
          type: payload.type,
          ...((payload.targetPlayerId || payload.targetId)
            ? { targetPlayerId: payload.targetPlayerId || payload.targetId }
            : {}),
        } as CoupActionPayload;

        const updatedState = await CoupService.executeAction(matchId, session.playerId, actionPayload);
        broadcastGameState(io, updatedState);
      } catch (err: any) {
        socket.emit(COUP_EVENTS.ERROR, { code: err.code || 'ACTION_FAILED', message: err.message });
      }
    };

    socket.on(COUP_EVENTS.COUP_ACTION, handleAction);
    socket.on('game:action', handleAction);

    // 7. Challenge
    const handleChallenge = async () => {
      try {
        const session = await CoupRepository.getSessionBySocketId(socket.id);
        if (!session) throw new Error('Player session not found');
        const matchId = await getActiveMatchId(session);
        if (!matchId) throw new Error('Match not found for session');

        const updatedState = await CoupService.challenge(matchId, session.playerId);
        broadcastGameState(io, updatedState);
      } catch (err: any) {
        socket.emit(COUP_EVENTS.ERROR, { code: err.code || 'CHALLENGE_FAILED', message: err.message });
      }
    };

    socket.on(COUP_EVENTS.CHALLENGE, handleChallenge);
    socket.on('game:challenge', handleChallenge);

    // 8. Block
    const handleBlock = async (payload: { claimedRole: CoupRole }) => {
      try {
        const session = await CoupRepository.getSessionBySocketId(socket.id);
        if (!session) throw new Error('Player session not found');
        const matchId = await getActiveMatchId(session);
        if (!matchId) throw new Error('Match not found for session');

        const roleUpper = (payload.claimedRole ? payload.claimedRole.toUpperCase() : 'DUKE') as CoupRole;
        const updatedState = await CoupService.block(matchId, session.playerId, roleUpper);
        broadcastGameState(io, updatedState);
      } catch (err: any) {
        socket.emit(COUP_EVENTS.ERROR, { code: err.code || 'BLOCK_FAILED', message: err.message });
      }
    };

    socket.on(COUP_EVENTS.BLOCK, handleBlock);
    socket.on('game:block', handleBlock);

    // 9. Pass
    const handlePass = async () => {
      try {
        const session = await CoupRepository.getSessionBySocketId(socket.id);
        if (!session) throw new Error('Player session not found');
        const matchId = await getActiveMatchId(session);
        if (!matchId) throw new Error('Match not found for session');

        const updatedState = await CoupService.pass(matchId, session.playerId);
        broadcastGameState(io, updatedState);
      } catch (err: any) {
        socket.emit(COUP_EVENTS.ERROR, { code: err.code || 'PASS_FAILED', message: err.message });
      }
    };

    socket.on(COUP_EVENTS.PASS, handlePass);
    socket.on('game:pass', handlePass);

    // 10. Lose Influence / Reveal Card
    const handleRevealCard = async (payload: { cardId: string }) => {
      try {
        const session = await CoupRepository.getSessionBySocketId(socket.id);
        if (!session) throw new Error('Player session not found');
        const matchId = await getActiveMatchId(session);
        if (!matchId) throw new Error('Match not found for session');

        const updatedState = await CoupService.revealCard(matchId, session.playerId, payload.cardId);
        broadcastGameState(io, updatedState);
      } catch (err: any) {
        socket.emit(COUP_EVENTS.ERROR, { code: err.code || 'REVEAL_FAILED', message: err.message });
      }
    };

    socket.on(COUP_EVENTS.REVEAL_CARD, handleRevealCard);
    socket.on('game:lose_influence', handleRevealCard);

    // 11. Ambassador Exchange Selection
    const handleExchangeSelection = async (payload: { keptCardIds: string[] }) => {
      try {
        const session = await CoupRepository.getSessionBySocketId(socket.id);
        if (!session) throw new Error('Player session not found');
        const matchId = await getActiveMatchId(session);
        if (!matchId) throw new Error('Match not found for session');

        const updatedState = await CoupService.exchangeSelection(matchId, session.playerId, payload.keptCardIds);
        broadcastGameState(io, updatedState);
      } catch (err: any) {
        socket.emit(COUP_EVENTS.ERROR, { code: err.code || 'EXCHANGE_FAILED', message: err.message });
      }
    };

    socket.on(COUP_EVENTS.EXCHANGE_SELECTION, handleExchangeSelection);
    socket.on('game:exchange', handleExchangeSelection);

    // 12. Socket Disconnect
    socket.on('disconnect', async () => {
      await CoupRepository.removeSocketBinding(socket.id);
    });
  });
}

export function broadcastGameState(io: Server, state: CoupGameState): void {
  for (const player of state.players) {
    CoupRepository.getSession(player.playerId).then((sess) => {
      if (sess && sess.socketId) {
        const playerSpecificState = serializeGameStateForPlayer(state, player.playerId);
        io.to(sess.socketId).emit(COUP_EVENTS.GAME_STATE, playerSpecificState);
        io.to(sess.socketId).emit('game:state_update', playerSpecificState);
      }
    });
  }
}
