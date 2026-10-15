import { createDeck, dealInitialCards, shuffleDeck } from './coup.cards.js';
import { CoupError } from './coup.errors.js';
import {
  COUP_ACTION_RULES,
  MANDATORY_COUP_COIN_THRESHOLD,
  RESPONSE_TIMEOUT_MS,
} from './coup.rules.js';
import {
  CoupActionPayload,
  CoupCard,
  CoupGameState,
  CoupPhase,
  CoupPlayerState,
  CoupRole,
} from './coup.types.js';
import { validateAction, validateBlock, validateChallenge } from './coup.validator.js';

export class CoupEngine {
  public static createGame(
    matchId: string,
    roomCode: string,
    playersInfo: { playerId: string; userId: string; username: string; avatarUrl?: string }[]
  ): CoupGameState {
    if (playersInfo.length < 2 || playersInfo.length > 6) {
      throw new CoupError('INVALID_ACTION', 'Coup requires 2 to 6 players.');
    }

    const initialDeck = createDeck();
    const { dealt, remainingDeck } = dealInitialCards(initialDeck, playersInfo.length);

    const players: CoupPlayerState[] = playersInfo.map((p, idx) => ({
      playerId: p.playerId,
      userId: p.userId,
      username: p.username,
      avatarUrl: p.avatarUrl,
      seatIndex: idx,
      coins: 2,
      cards: dealt[idx]!,
      isAlive: true,
      connectionStatus: 'CONNECTED',
    }));

    return {
      matchId,
      roomCode,
      phase: 'PLAYER_TURN',
      players,
      deck: remainingDeck,
      currentPlayerId: players[0]!.playerId,
      coinPile: 50 - players.length * 2,
      version: 1,
    };
  }

  public static executeAction(
    state: CoupGameState,
    playerId: string,
    action: CoupActionPayload
  ): CoupGameState {
    validateAction(state, playerId, action);
    const nextState: CoupGameState = JSON.parse(JSON.stringify(state));
    nextState.version += 1;

    const actor = nextState.players.find((p) => p.playerId === playerId)!;
    const rule = COUP_ACTION_RULES[action.type];

    // Deduct coin cost
    if (rule.cost > 0) {
      actor.coins -= rule.cost;
      nextState.coinPile += rule.cost;
    }

    const pendingId = `action_${Date.now()}`;

    // Action 1: INCOME (Unblockable, Unchallengeable)
    if (action.type === 'INCOME') {
      actor.coins += 1;
      nextState.coinPile -= 1;
      return this.advanceTurn(nextState);
    }

    // Action 2: COUP (Unblockable, Unchallengeable)
    if (action.type === 'COUP') {
      const target = nextState.players.find((p) => p.playerId === action.targetPlayerId)!;
      return this.promptLoseInfluence(
        nextState,
        target.playerId,
        `${actor.username} executed a Coup on ${target.username}.`,
        'PLAYER_TURN',
        'ADVANCE_TURN'
      );
    }

    // Action 3: FOREIGN AID (Blockable by Duke, Unchallengeable)
    if (action.type === 'FOREIGN_AID') {
      nextState.phase = 'BLOCK_RESPONSE';
      nextState.pendingAction = {
        id: pendingId,
        actorId: playerId,
        action,
        passes: [playerId], // Actor auto-passes
      };
      nextState.responseDeadline = Date.now() + RESPONSE_TIMEOUT_MS;
      return nextState;
    }

    // Actions with Role Claims (TAX, STEAL, ASSASSINATE, EXCHANGE)
    nextState.pendingAction = {
      id: pendingId,
      actorId: playerId,
      action,
      claimedRole: rule.claimedRole,
      targetId: 'targetPlayerId' in action ? action.targetPlayerId : undefined,
      passes: [playerId],
    };

    if (rule.isChallengable) {
      nextState.phase = 'ACTION_RESPONSE';
      nextState.responseDeadline = Date.now() + RESPONSE_TIMEOUT_MS;
    }

    return nextState;
  }

  public static declareChallenge(state: CoupGameState, challengerId: string): CoupGameState {
    validateChallenge(state, challengerId);
    const nextState: CoupGameState = JSON.parse(JSON.stringify(state));
    nextState.version += 1;

    const challenger = nextState.players.find((p) => p.playerId === challengerId)!;

    if (nextState.phase === 'ACTION_RESPONSE') {
      const pending = nextState.pendingAction!;
      const actor = nextState.players.find((p) => p.playerId === pending.actorId)!;
      const claimedRole = pending.claimedRole!;

      const matchingCard = actor.cards.find(
        (c) => c.status === 'ALIVE' && c.role === claimedRole
      );

      if (matchingCard) {
        // Claimant HAS the claimed role -> Challenge FAILS
        // 1. Return card to deck and replace it for claimant
        this.replaceCardInDeck(nextState, actor.playerId, matchingCard.id);

        // 2. Challenger loses influence
        return this.promptLoseInfluence(
          nextState,
          challenger.playerId,
          `${actor.username} proved they have ${claimedRole}! ${challenger.username} loses influence.`,
          nextState.phase,
          'RESOLVE_ACTION_AFTER_CHALLENGE_SUCCESS'
        );
      } else {
        // Claimant DOES NOT HAVE role -> Challenge SUCCEEDS
        // Claimant loses influence and action FAILS
        nextState.pendingAction = undefined;
        return this.promptLoseInfluence(
          nextState,
          actor.playerId,
          `${actor.username} lied about having ${claimedRole}! ${actor.username} loses influence.`,
          'PLAYER_TURN',
          'ADVANCE_TURN'
        );
      }
    } else if (nextState.phase === 'BLOCK_RESPONSE') {
      const pending = nextState.pendingAction!;
      const block = pending.block!;
      const blocker = nextState.players.find((p) => p.playerId === block.blockerId)!;
      const claimedRole = block.claimedRole;

      const matchingCard = blocker.cards.find(
        (c) => c.status === 'ALIVE' && c.role === claimedRole
      );

      if (matchingCard) {
        // Blocker HAS claimed role -> Challenge FAILS, Block succeeds
        this.replaceCardInDeck(nextState, blocker.playerId, matchingCard.id);
        nextState.pendingAction = undefined;

        return this.promptLoseInfluence(
          nextState,
          challenger.playerId,
          `${blocker.username} proved they have ${claimedRole}! Block succeeds. ${challenger.username} loses influence.`,
          'PLAYER_TURN',
          'ADVANCE_TURN'
        );
      } else {
        // Blocker DOES NOT HAVE role -> Challenge SUCCEEDS, Block fails
        nextState.pendingAction!.block = undefined;

        return this.promptLoseInfluence(
          nextState,
          blocker.playerId,
          `${blocker.username} lied about having ${claimedRole}! Block fails. ${blocker.username} loses influence.`,
          'PLAYER_TURN',
          'EXECUTE_PENDING_ACTION'
        );
      }
    }

    return nextState;
  }

  public static declareBlock(
    state: CoupGameState,
    blockerId: string,
    claimedRole: CoupRole
  ): CoupGameState {
    validateBlock(state, blockerId, claimedRole);
    const nextState: CoupGameState = JSON.parse(JSON.stringify(state));
    nextState.version += 1;

    nextState.phase = 'BLOCK_RESPONSE';
    nextState.pendingAction!.block = {
      blockerId,
      claimedRole,
      passes: [blockerId],
    };
    nextState.responseDeadline = Date.now() + RESPONSE_TIMEOUT_MS;

    return nextState;
  }

  public static passResponse(state: CoupGameState, playerId: string): CoupGameState {
    const nextState: CoupGameState = JSON.parse(JSON.stringify(state));
    const activePlayers = nextState.players.filter((p) => p.isAlive);

    if (nextState.phase === 'ACTION_RESPONSE') {
      const pending = nextState.pendingAction!;
      if (!pending.passes.includes(playerId)) {
        pending.passes.push(playerId);
      }

      // If all active players passed on challenging the action
      if (pending.passes.length >= activePlayers.length) {
        const rule = COUP_ACTION_RULES[pending.action.type];
        if (rule.blockableBy && rule.blockableBy.length > 0) {
          nextState.phase = 'BLOCK_RESPONSE';
          nextState.pendingAction!.passes = [];
          nextState.responseDeadline = Date.now() + RESPONSE_TIMEOUT_MS;
          return nextState;
        } else {
          return this.executePendingAction(nextState);
        }
      }
    } else if (nextState.phase === 'BLOCK_RESPONSE') {
      const pending = nextState.pendingAction!;
      const block = pending.block;

      if (block) {
        if (!block.passes.includes(playerId)) {
          block.passes.push(playerId);
        }
        // All active players passed on challenging the block -> Block succeeds!
        if (block.passes.length >= activePlayers.length) {
          nextState.pendingAction = undefined;
          return this.advanceTurn(nextState);
        }
      } else {
        // Passing on blocking Foreign Aid
        if (!pending.passes.includes(playerId)) {
          pending.passes.push(playerId);
        }
        if (pending.passes.length >= activePlayers.length) {
          return this.executePendingAction(nextState);
        }
      }
    }

    return nextState;
  }

  public static revealCard(
    state: CoupGameState,
    playerId: string,
    cardId: string
  ): CoupGameState {
    const nextState: CoupGameState = JSON.parse(JSON.stringify(state));
    nextState.version += 1;

    const player = nextState.players.find((p) => p.playerId === playerId);
    if (!player || !player.isAlive) {
      throw new CoupError('PLAYER_ELIMINATED', 'Player is eliminated.');
    }

    const card = player.cards.find((c) => c.id === cardId && c.status === 'ALIVE');
    if (!card) {
      throw new CoupError('INVALID_CARD', 'Selected card is not alive or invalid.');
    }

    // Reveal card
    card.status = 'REVEALED';

    // Check if player is eliminated (0 alive cards left)
    const aliveCount = player.cards.filter((c) => c.status === 'ALIVE').length;
    if (aliveCount === 0) {
      player.isAlive = false;
    }

    const postAction = nextState.pendingLoseInfluence?.postRevealAction;
    nextState.pendingLoseInfluence = undefined;
    nextState.phase = 'PLAYER_TURN';

    // Check win condition
    const remainingAlive = nextState.players.filter((p) => p.isAlive);
    if (remainingAlive.length === 1) {
      nextState.phase = 'FINISHED';
      nextState.winnerId = remainingAlive[0]!.playerId;
      return nextState;
    }

    return this.executePostRevealAction(nextState, postAction);
  }

  public static executeExchangeSelection(
    state: CoupGameState,
    playerId: string,
    keptCardIds: string[]
  ): CoupGameState {
    const nextState: CoupGameState = JSON.parse(JSON.stringify(state));
    nextState.version += 1;

    if (nextState.phase !== 'EXCHANGE' || !nextState.pendingExchange) {
      throw new CoupError('INVALID_PHASE', 'No active Ambassador exchange phase.');
    }

    if (nextState.pendingExchange.playerId !== playerId) {
      throw new CoupError('INVALID_ACTION', 'Only the exchanging player can select cards.');
    }

    const player = nextState.players.find((p) => p.playerId === playerId)!;
    const aliveCardCount = player.cards.filter((c) => c.status === 'ALIVE').length;

    if (keptCardIds.length !== aliveCardCount) {
      throw new CoupError(
        'INVALID_CARD',
        `You must choose exactly ${aliveCardCount} cards to keep.`
      );
    }

    const pool = [...player.cards.filter((c) => c.status === 'ALIVE'), ...nextState.pendingExchange.drawnCards];
    const keptCards: CoupCard[] = [];

    for (const id of keptCardIds) {
      const card = pool.find((c) => c.id === id);
      if (!card) {
        throw new CoupError('INVALID_CARD', 'Selected card is not part of exchange pool.');
      }
      keptCards.push(card);
    }

    const returnedCards = pool.filter((c) => !keptCardIds.includes(c.id));

    // Update player alive cards
    player.cards = [
      ...player.cards.filter((c) => c.status === 'REVEALED'),
      ...keptCards,
    ];

    // Return cards to Court Deck and reshuffle
    nextState.deck.push(...returnedCards);
    nextState.deck = shuffleDeck(nextState.deck);

    nextState.pendingExchange = undefined;
    nextState.pendingAction = undefined;

    return this.advanceTurn(nextState);
  }

  // --- Internal Helper Functions ---

  private static resolveActionAfterChallengeSuccess(state: CoupGameState): CoupGameState {
    const pending = state.pendingAction!;
    const rule = COUP_ACTION_RULES[pending.action.type];

    if (rule.blockableBy && rule.blockableBy.length > 0) {
      state.phase = 'BLOCK_RESPONSE';
      state.responseDeadline = Date.now() + RESPONSE_TIMEOUT_MS;
      return state;
    }
    return this.executePendingAction(state);
  }

  private static executePendingAction(state: CoupGameState): CoupGameState {
    const pending = state.pendingAction;
    if (!pending) return this.advanceTurn(state);

    const actor = state.players.find((p) => p.playerId === pending.actorId)!;

    switch (pending.action.type) {
      case 'FOREIGN_AID': {
        actor.coins += 2;
        state.coinPile -= 2;
        state.pendingAction = undefined;
        return this.advanceTurn(state);
      }
      case 'TAX': {
        actor.coins += 3;
        state.coinPile -= 3;
        state.pendingAction = undefined;
        return this.advanceTurn(state);
      }
      case 'STEAL': {
        const target = state.players.find((p) => p.playerId === pending.targetId)!;
        const stolen = Math.min(2, target.coins);
        target.coins -= stolen;
        actor.coins += stolen;
        state.pendingAction = undefined;
        return this.advanceTurn(state);
      }
      case 'ASSASSINATE': {
        const target = state.players.find((p) => p.playerId === pending.targetId)!;
        state.pendingAction = undefined;
        return this.promptLoseInfluence(
          state,
          target.playerId,
          `${actor.username} assassinated ${target.username}!`,
          'PLAYER_TURN',
          'ADVANCE_TURN'
        );
      }
      case 'EXCHANGE': {
        const drawn1 = state.deck.pop()!;
        const drawn2 = state.deck.pop()!;

        state.phase = 'EXCHANGE';
        state.pendingExchange = {
          playerId: actor.playerId,
          drawnCards: [drawn1, drawn2],
        };
        return state;
      }
      default:
        state.pendingAction = undefined;
        return this.advanceTurn(state);
    }
  }

  private static executePostRevealAction(state: CoupGameState, action?: string): CoupGameState {
    if (action === 'RESOLVE_ACTION_AFTER_CHALLENGE_SUCCESS') {
      return this.resolveActionAfterChallengeSuccess(state);
    } else if (action === 'EXECUTE_PENDING_ACTION') {
      return this.executePendingAction(state);
    }
    return this.advanceTurn(state);
  }

  private static promptLoseInfluence(
    state: CoupGameState,
    playerId: string,
    reason: string,
    returnPhase: CoupPhase,
    postRevealAction: 'ADVANCE_TURN' | 'EXECUTE_PENDING_ACTION' | 'RESOLVE_ACTION_AFTER_CHALLENGE_SUCCESS' = 'ADVANCE_TURN'
  ): CoupGameState {
    const player = state.players.find((p) => p.playerId === playerId)!;
    const aliveCards = player.cards.filter((c) => c.status === 'ALIVE');

    // Auto-reveal if player only has 1 card left
    if (aliveCards.length === 1) {
      aliveCards[0]!.status = 'REVEALED';
      const stillAlive = player.cards.filter((c) => c.status === 'ALIVE').length;
      if (stillAlive === 0) {
        player.isAlive = false;
      }

      const remainingAlive = state.players.filter((p) => p.isAlive);
      if (remainingAlive.length === 1) {
        state.phase = 'FINISHED';
        state.winnerId = remainingAlive[0]!.playerId;
        return state;
      }

      return this.executePostRevealAction(state, postRevealAction);
    }

    state.phase = 'CHOOSE_INFLUENCE';
    state.pendingLoseInfluence = {
      playerId,
      reason,
      returnPhase,
      postRevealAction,
    };

    return state;
  }

  private static replaceCardInDeck(state: CoupGameState, playerId: string, cardId: string): void {
    const player = state.players.find((p) => p.playerId === playerId)!;
    const cardIndex = player.cards.findIndex((c) => c.id === cardId);
    if (cardIndex === -1) return;

    const oldCard = player.cards[cardIndex]!;
    state.deck.push(oldCard);
    state.deck = shuffleDeck(state.deck);

    const replacementCard = state.deck.pop()!;
    player.cards[cardIndex] = replacementCard;
  }

  public static advanceTurn(state: CoupGameState): CoupGameState {
    const alivePlayers = state.players.filter((p) => p.isAlive);
    if (alivePlayers.length <= 1) {
      state.phase = 'FINISHED';
      state.winnerId = alivePlayers[0]?.playerId;
      return state;
    }

    const currentIndex = state.players.findIndex((p) => p.playerId === state.currentPlayerId);
    let nextIndex = (currentIndex + 1) % state.players.length;

    while (!state.players[nextIndex]!.isAlive) {
      nextIndex = (nextIndex + 1) % state.players.length;
    }

    state.currentPlayerId = state.players[nextIndex]!.playerId;
    state.phase = 'PLAYER_TURN';
    state.pendingAction = undefined;
    state.pendingExchange = undefined;
    state.pendingLoseInfluence = undefined;
    state.responseDeadline = undefined;

    return state;
  }
}
