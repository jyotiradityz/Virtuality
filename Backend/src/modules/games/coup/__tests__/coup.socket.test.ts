import { describe, expect, it } from 'vitest';
import { CoupRepository } from '../coup.repository.js';
import { CoupService } from '../coup.service.js';

describe('Coup Service & Socket Interaction Flow', () => {
  it('handles complete lobby lifecycle: create, join, ready toggling, matchId propagation, and action execution', async () => {
    // 1. Host creates lobby
    const { lobby, session: hostSession } = await CoupService.createLobby(
      'user_host_1',
      'AliceHost',
      { maxPlayers: 4 }
    );

    expect(lobby.code).toBeDefined();
    expect(lobby.hostId).toBe(hostSession.playerId);
    expect(lobby.players).toHaveLength(1);
    expect(lobby.players[0].isReady).toBe(true);

    // 2. Guest joins lobby
    const { lobby: joinedLobby, session: guestSession } = await CoupService.joinLobbyByCode(
      'user_guest_2',
      'BobGuest',
      lobby.code
    );

    expect(joinedLobby.players).toHaveLength(2);
    expect(joinedLobby.players[1].isReady).toBe(false);

    // 3. Starting game before all players ready should throw error
    await expect(
      CoupService.startGame(hostSession.playerId, lobby.lobbyId)
    ).rejects.toThrow('All players must be ready before starting.');

    // 4. Guest toggles ready
    const readyLobby = CoupService.setPlayerReady(lobby.lobbyId, guestSession.playerId, true);
    expect(readyLobby).not.toBeNull();
    expect(readyLobby!.players[1].isReady).toBe(true);

    // 5. Host starts game successfully
    const gameState = await CoupService.startGame(hostSession.playerId, lobby.lobbyId);
    expect(gameState.matchId).toBeDefined();
    expect(gameState.phase).toBe('PLAYER_TURN');
    expect(gameState.players).toHaveLength(2);

    // 6. Verify matchId is populated on both player sessions in CoupRepository
    const hostPersistedSession = await CoupRepository.getSession(hostSession.playerId);
    const guestPersistedSession = await CoupRepository.getSession(guestSession.playerId);

    expect(hostPersistedSession?.matchId).toBe(gameState.matchId);
    expect(guestPersistedSession?.matchId).toBe(gameState.matchId);

    // 7. Active match state retrieval by room code
    const matchByCode = await CoupRepository.getMatchStateByRoomCode(lobby.code);
    expect(matchByCode?.matchId).toBe(gameState.matchId);

    // 8. Player executes Income action
    const currentTurnPlayer = gameState.currentPlayerId;
    const updatedState = await CoupService.executeAction(gameState.matchId, currentTurnPlayer, {
      type: 'INCOME',
    });

    const activeActor = updatedState.players.find((p) => p.playerId === currentTurnPlayer);
    expect(activeActor?.coins).toBe(3); // 2 initial + 1 Income
    expect(updatedState.currentPlayerId).not.toBe(currentTurnPlayer); // turn advanced
  });
});
