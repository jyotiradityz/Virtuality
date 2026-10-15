import {
  CoupGameState,
  SerializedCard,
  SerializedGameState,
  SerializedPlayer,
} from './coup.types.js';

export function serializeGameStateForPlayer(
  state: CoupGameState,
  requestingPlayerId?: string
): SerializedGameState {
  const players: SerializedPlayer[] = state.players.map((p) => {
    const influence = p.cards.filter((c) => c.status === 'ALIVE').length;

    const cards: SerializedCard[] = p.cards.map((c) => {
      // Reveal role IF card is publicly revealed OR belongs to requesting player
      if (c.status === 'REVEALED' || p.playerId === requestingPlayerId) {
        return {
          id: c.id,
          role: c.role,
          status: c.status,
        };
      }

      // Mask role for hidden cards belonging to opponents or spectators
      return {
        id: c.id,
        status: c.status,
      };
    });

    return {
      playerId: p.playerId,
      userId: p.userId,
      username: p.username,
      avatarUrl: p.avatarUrl,
      seatIndex: p.seatIndex,
      coins: p.coins,
      influence,
      isAlive: p.isAlive,
      connectionStatus: p.connectionStatus,
      cards,
    };
  });

  return {
    matchId: state.matchId,
    roomCode: state.roomCode,
    phase: state.phase,
    currentPlayerId: state.currentPlayerId,
    coinPile: state.coinPile,
    version: state.version,
    responseDeadline: state.responseDeadline,
    players,
    pendingAction: state.pendingAction
      ? {
          id: state.pendingAction.id,
          actorId: state.pendingAction.actorId,
          actionType: state.pendingAction.action.type,
          targetId: state.pendingAction.targetId,
          claimedRole: state.pendingAction.claimedRole,
          block: state.pendingAction.block
            ? {
                blockerId: state.pendingAction.block.blockerId,
                claimedRole: state.pendingAction.block.claimedRole,
              }
            : undefined,
        }
      : undefined,
    pendingLoseInfluence: state.pendingLoseInfluence
      ? {
          playerId: state.pendingLoseInfluence.playerId,
          reason: state.pendingLoseInfluence.reason,
        }
      : undefined,
    pendingExchange: state.pendingExchange
      ? {
          playerId: state.pendingExchange.playerId,
          drawnCards: state.pendingExchange.drawnCards.map((c) => ({
            id: c.id,
            role: requestingPlayerId === state.pendingExchange?.playerId ? c.role : undefined,
            status: c.status,
          })),
        }
      : undefined,
    winnerId: state.winnerId,
  };
}
