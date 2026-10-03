import type { GameState, GameAction, Role, CardState, Player, GameLogEntry } from '../types/game';
import { ACTION_COSTS, ROLE_CLAIMS } from './rules';

const ALL_ROLES: Role[] = ['Duke', 'Assassin', 'Captain', 'Ambassador', 'Contessa'];

export function createDeck(): Role[] {
  const deck: Role[] = [];
  ALL_ROLES.forEach((role) => {
    deck.push(role, role, role);
  });
  // Shuffle deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function createInitialState(playerCount: number = 4): GameState {
  const deck = createDeck();
  const playerNames = ['Jyot', 'Alex', 'Sam', 'Riley', 'Jordan', 'Morgan'];
  const players: Player[] = [];

  for (let i = 0; i < playerCount; i++) {
    const c1 = deck.pop()!;
    const c2 = deck.pop()!;
    players.push({
      id: `p${i + 1}`,
      name: playerNames[i] || `Player ${i + 1}`,
      coins: 2,
      cards: [
        { id: `c-${i + 1}-1`, role: c1, isRevealed: false },
        { id: `c-${i + 1}-2`, role: c2, isRevealed: false },
      ],
      isAlive: true,
      isLocalPlayer: i === 0,
      seatIndex: i,
    });
  }

  return {
    players,
    turnIndex: 0,
    coinPile: 50 - playerCount * 2,
    deck,
    phase: 'ACTION_SELECTION',
    pendingAction: null,
    pendingLoseInfluence: null,
    pendingExchange: null,
    winnerId: null,
    gameLog: [
      {
        id: `log-${Date.now()}`,
        text: 'Game initialized. Welcome to Coup!',
        timestamp: Date.now(),
        type: 'INFO',
      },
    ],
  };
}

export function addLogEntry(state: GameState, text: string, type: GameLogEntry['type'] = 'ACTION'): GameLogEntry[] {
  return [
    ...state.gameLog,
    {
      id: `log-${Date.now()}-${Math.random()}`,
      text,
      timestamp: Date.now(),
      type,
    },
  ];
}

export function advanceTurn(state: GameState): GameState {
  // Check winner
  const alivePlayers = state.players.filter((p) => p.isAlive);
  if (alivePlayers.length === 1) {
    const winner = alivePlayers[0];
    return {
      ...state,
      phase: 'GAME_OVER',
      winnerId: winner.id,
      pendingAction: null,
      pendingLoseInfluence: null,
      pendingExchange: null,
      gameLog: addLogEntry(state, `🏆 ${winner.name} has won the game!`, 'RESOLUTION'),
    };
  }

  // Next turn index
  let nextIdx = (state.turnIndex + 1) % state.players.length;
  while (!state.players[nextIdx].isAlive) {
    nextIdx = (nextIdx + 1) % state.players.length;
  }

  return {
    ...state,
    turnIndex: nextIdx,
    phase: 'ACTION_SELECTION',
    pendingAction: null,
    pendingLoseInfluence: null,
    pendingExchange: null,
    gameLog: addLogEntry(
      state,
      `It is now ${state.players[nextIdx].name}'s turn.`,
      'INFO'
    ),
  };
}

export function handleActionDeclaration(state: GameState, action: GameAction): GameState {
  const actor = state.players.find((p) => p.id === action.playerId);
  if (!actor) return state;

  const cost = ACTION_COSTS[action.type];
  let updatedPlayers = state.players.map((p) => {
    if (p.id === actor.id) {
      return { ...p, coins: p.coins - cost };
    }
    return p;
  });

  const updatedCoinPile = state.coinPile + cost;

  let actionText = `${actor.name} declared ${action.type}`;
  if (action.targetId) {
    const target = state.players.find((p) => p.id === action.targetId);
    if (target) actionText += ` on ${target.name}`;
  }

  let newState: GameState = {
    ...state,
    players: updatedPlayers,
    coinPile: updatedCoinPile,
    pendingAction: {
      action,
      sourcePlayerId: actor.id,
      targetPlayerId: action.targetId,
      block: null,
    },
    gameLog: addLogEntry(state, actionText, 'ACTION'),
  };

  // Immediate non-respondable actions
  if (action.type === 'INCOME') {
    return resolveIncome(newState);
  }

  if (action.type === 'COUP') {
    return resolveCoupDeclaration(newState);
  }

  // Actions that can be challenged or blocked enter RESPONSE_WINDOW
  return {
    ...newState,
    phase: 'RESPONSE_WINDOW',
  };
}

function resolveIncome(state: GameState): GameState {
  const actor = state.players[state.turnIndex];
  const updatedPlayers = state.players.map((p) =>
    p.id === actor.id ? { ...p, coins: p.coins + 1 } : p
  );
  const updatedState = {
    ...state,
    players: updatedPlayers,
    coinPile: state.coinPile - 1,
    gameLog: addLogEntry(state, `${actor.name} collected 1 coin from Income.`, 'RESOLUTION'),
  };
  return advanceTurn(updatedState);
}

function resolveCoupDeclaration(state: GameState): GameState {
  const pending = state.pendingAction;
  if (!pending || !pending.targetPlayerId) return state;

  const target = state.players.find((p) => p.id === pending.targetPlayerId);
  if (!target) return state;

  return {
    ...state,
    phase: 'LOSE_INFLUENCE_PENDING',
    pendingLoseInfluence: {
      playerId: target.id,
      reason: `Coup from ${state.players.find((p) => p.id === pending.sourcePlayerId)?.name}`,
    },
    gameLog: addLogEntry(state, `${target.name} must choose an influence card to lose due to Coup.`, 'RESOLUTION'),
  };
}

export function handlePassResponse(state: GameState): GameState {
  if (state.phase === 'RESPONSE_WINDOW') {
    // Action was allowed without challenge or block
    return resolveUnchallengedAction(state);
  }
  if (state.phase === 'BLOCK_RESPONSE_WINDOW') {
    // Block was allowed without challenge
    const pending = state.pendingAction;
    const blockerName = state.players.find(p => p.id === pending?.block?.blockerPlayerId)?.name || 'Player';
    const logState = {
      ...state,
      gameLog: addLogEntry(state, `Block by ${blockerName} succeeded. Action cancelled.`, 'RESOLUTION'),
    };
    return advanceTurn(logState);
  }
  return state;
}

export function handleBlockAction(state: GameState, blockerId: string, claimedRole: Role): GameState {
  const pending = state.pendingAction;
  if (!pending) return state;

  const blocker = state.players.find(p => p.id === blockerId);
  if (!blocker) return state;

  return {
    ...state,
    phase: 'BLOCK_RESPONSE_WINDOW',
    pendingAction: {
      ...pending,
      block: {
        blockerPlayerId: blockerId,
        claimedRole,
      },
    },
    gameLog: addLogEntry(state, `${blocker.name} claims ${claimedRole} to block ${pending.action.type}.`, 'BLOCK'),
  };
}

export function handleChallengeAction(state: GameState, challengerId: string): GameState {
  const pending = state.pendingAction;
  if (!pending) return state;

  const challenger = state.players.find(p => p.id === challengerId);
  if (!challenger) return state;

  let targetId: string;
  let claimedRole: Role;
  let isBlockChallenge = false;

  if (state.phase === 'BLOCK_RESPONSE_WINDOW' && pending.block) {
    targetId = pending.block.blockerPlayerId;
    claimedRole = pending.block.claimedRole;
    isBlockChallenge = true;
  } else {
    targetId = pending.sourcePlayerId;
    claimedRole = ROLE_CLAIMS[pending.action.type]!;
  }

  const targetPlayer = state.players.find(p => p.id === targetId);
  if (!targetPlayer) return state;

  const hasRole = targetPlayer.cards.some(c => !c.isRevealed && c.role === claimedRole);

  const logMsg = `${challenger.name} challenged ${targetPlayer.name}'s claim of ${claimedRole}!`;
  let tempState = { ...state, gameLog: addLogEntry(state, logMsg, 'CHALLENGE') };

  if (hasRole) {
    // Target player PROVES they have the role
    // 1. Target player swaps card with deck
    const updatedDeck = [...tempState.deck];
    const newRole = updatedDeck.pop()!;
    updatedDeck.push(claimedRole);
    // Shuffle deck
    for (let i = updatedDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [updatedDeck[i], updatedDeck[j]] = [updatedDeck[j], updatedDeck[i]];
    }

    const updatedPlayers = tempState.players.map(p => {
      if (p.id === targetPlayer.id) {
        let replaced = false;
        const newCards = p.cards.map(c => {
          if (!c.isRevealed && c.role === claimedRole && !replaced) {
            replaced = true;
            return { ...c, role: newRole };
          }
          return c;
        });
        return { ...p, cards: newCards };
      }
      return p;
    });

    // 2. Challenger LOSES 1 influence
    const challengeLog = addLogEntry(
      tempState,
      `${targetPlayer.name} revealed ${claimedRole}! ${targetPlayer.name} draws a new card. ${challenger.name} lost the challenge and must lose influence.`,
      'RESOLUTION'
    );

    return {
      ...tempState,
      players: updatedPlayers,
      deck: updatedDeck,
      phase: 'LOSE_INFLUENCE_PENDING',
      pendingLoseInfluence: {
        playerId: challenger.id,
        reason: 'Lost challenge',
        onSuccessNextPhase: isBlockChallenge ? 'ACTION_SELECTION' : undefined, // Proceed with action if not blocked
      },
      gameLog: challengeLog,
    };
  } else {
    // Target player WAS LYING! Target player loses 1 influence & action/block fails
    const challengeLog = addLogEntry(
      tempState,
      `${targetPlayer.name} does NOT have ${claimedRole}! ${targetPlayer.name} must lose an influence.`,
      'RESOLUTION'
    );

    return {
      ...tempState,
      phase: 'LOSE_INFLUENCE_PENDING',
      pendingLoseInfluence: {
        playerId: targetPlayer.id,
        reason: 'Caught lying in challenge',
      },
      gameLog: challengeLog,
    };
  }
}

export function handleLoseInfluence(state: GameState, playerId: string, cardId: string): GameState {
  let lostRole: Role | null = null;
  const updatedPlayers = state.players.map(p => {
    if (p.id === playerId) {
      const updatedCards = p.cards.map(c => {
        if (c.id === cardId) {
          lostRole = c.role;
          return { ...c, isRevealed: true };
        }
        return c;
      });
      const activeCount = updatedCards.filter(c => !c.isRevealed).length;
      return {
        ...p,
        cards: updatedCards,
        isAlive: activeCount > 0,
      };
    }
    return p;
  });

  const losingPlayer = state.players.find(p => p.id === playerId);
  const logMsg = `${losingPlayer?.name || 'Player'} revealed and lost influence: ${lostRole || 'Card'}.`;
  let nextState: GameState = {
    ...state,
    players: updatedPlayers,
    pendingLoseInfluence: null,
    gameLog: addLogEntry(state, logMsg, 'RESOLUTION'),
  };

  // If action was assassination and target hasn't lost influence yet
  const pending = state.pendingAction;
  if (pending && pending.action.type === 'ASSASSINATE' && state.phase !== 'LOSE_INFLUENCE_PENDING') {
    // Proceed to target losing influence if assassination succeeded
    const target = updatedPlayers.find(p => p.id === pending.targetPlayerId);
    if (target && target.isAlive) {
      return {
        ...nextState,
        phase: 'LOSE_INFLUENCE_PENDING',
        pendingLoseInfluence: {
          playerId: target.id,
          reason: 'Assassinated',
        },
      };
    }
  }

  return advanceTurn(nextState);
}

export function resolveUnchallengedAction(state: GameState): GameState {
  const pending = state.pendingAction;
  if (!pending) return advanceTurn(state);

  const actor = state.players.find(p => p.id === pending.sourcePlayerId);
  if (!actor || !actor.isAlive) return advanceTurn(state);

  switch (pending.action.type) {
    case 'FOREIGN_AID': {
      const updatedPlayers = state.players.map(p =>
        p.id === actor.id ? { ...p, coins: p.coins + 2 } : p
      );
      const logState = {
        ...state,
        players: updatedPlayers,
        coinPile: state.coinPile - 2,
        gameLog: addLogEntry(state, `${actor.name} collected 2 coins from Foreign Aid.`, 'RESOLUTION'),
      };
      return advanceTurn(logState);
    }
    case 'TAX': {
      const updatedPlayers = state.players.map(p =>
        p.id === actor.id ? { ...p, coins: p.coins + 3 } : p
      );
      const logState = {
        ...state,
        players: updatedPlayers,
        coinPile: state.coinPile - 3,
        gameLog: addLogEntry(state, `${actor.name} collected 3 coins from Tax.`, 'RESOLUTION'),
      };
      return advanceTurn(logState);
    }
    case 'STEAL': {
      const target = state.players.find(p => p.id === pending.targetPlayerId);
      if (!target) return advanceTurn(state);
      const amount = Math.min(2, target.coins);
      const updatedPlayers = state.players.map(p => {
        if (p.id === actor.id) return { ...p, coins: p.coins + amount };
        if (p.id === target.id) return { ...p, coins: p.coins - amount };
        return p;
      });
      const logState = {
        ...state,
        players: updatedPlayers,
        gameLog: addLogEntry(state, `${actor.name} stole ${amount} coins from ${target.name}.`, 'RESOLUTION'),
      };
      return advanceTurn(logState);
    }
    case 'ASSASSINATE': {
      const target = state.players.find(p => p.id === pending.targetPlayerId);
      if (!target || !target.isAlive) return advanceTurn(state);
      return {
        ...state,
        phase: 'LOSE_INFLUENCE_PENDING',
        pendingLoseInfluence: {
          playerId: target.id,
          reason: `Assassinated by ${actor.name}`,
        },
        gameLog: addLogEntry(state, `${target.name} must lose an influence card due to Assassination!`, 'RESOLUTION'),
      };
    }
    case 'EXCHANGE': {
      const deck = [...state.deck];
      const d1 = deck.pop()!;
      const d2 = deck.pop()!;

      const drawnCards: CardState[] = [
        { id: `ex-1-${Date.now()}`, role: d1, isRevealed: false },
        { id: `ex-2-${Date.now()}`, role: d2, isRevealed: false },
      ];

      return {
        ...state,
        deck,
        phase: 'EXCHANGE_PENDING',
        pendingExchange: {
          playerId: actor.id,
          drawnCards,
        },
        gameLog: addLogEntry(state, `${actor.name} drew 2 cards for Ambassador Exchange.`, 'RESOLUTION'),
      };
    }
    default:
      return advanceTurn(state);
  }
}

export function handleExchangeSelection(state: GameState, keptCardIds: string[]): GameState {
  const pending = state.pendingExchange;
  if (!pending) return advanceTurn(state);

  const player = state.players.find(p => p.id === pending.playerId);
  if (!player) return advanceTurn(state);

  const activeCards = player.cards.filter(c => !c.isRevealed);
  const revealedCards = player.cards.filter(c => c.isRevealed);
  const pool = [...activeCards, ...pending.drawnCards];

  const keptCards = pool.filter(c => keptCardIds.includes(c.id));
  const returnedCards = pool.filter(c => !keptCardIds.includes(c.id));

  const updatedPlayers = state.players.map(p => {
    if (p.id === player.id) {
      return {
        ...p,
        cards: [...keptCards, ...revealedCards],
      };
    }
    return p;
  });

  const updatedDeck = [...state.deck, ...returnedCards.map(c => c.role)];
  // Shuffle deck
  for (let i = updatedDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [updatedDeck[i], updatedDeck[j]] = [updatedDeck[j], updatedDeck[i]];
  }

  const nextState = {
    ...state,
    players: updatedPlayers,
    deck: updatedDeck,
    pendingExchange: null,
    gameLog: addLogEntry(state, `${player.name} returned 2 cards to the deck.`, 'RESOLUTION'),
  };

  return advanceTurn(nextState);
}
