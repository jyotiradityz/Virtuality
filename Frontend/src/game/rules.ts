import type { GameState, GameAction, ActionType, Role, ActionOption, Player } from '../types/game';

export const ROLE_CLAIMS: Record<ActionType, Role | null> = {
  INCOME: null,
  FOREIGN_AID: null,
  TAX: 'Duke',
  STEAL: 'Captain',
  ASSASSINATE: 'Assassin',
  EXCHANGE: 'Ambassador',
  COUP: null,
};

export const BLOCK_ROLES: Record<ActionType, Role[]> = {
  INCOME: [],
  FOREIGN_AID: ['Duke'],
  TAX: [],
  STEAL: ['Captain', 'Ambassador'],
  ASSASSINATE: ['Contessa'],
  EXCHANGE: [],
  COUP: [],
};

export const ACTION_COSTS: Record<ActionType, number> = {
  INCOME: 0,
  FOREIGN_AID: 0,
  TAX: 0,
  STEAL: 0,
  ASSASSINATE: 3,
  EXCHANGE: 0,
  COUP: 7,
};

export function validateAction(state: GameState, action: GameAction): { legal: boolean; reason?: string } {
  const actor = state.players.find(p => p.id === action.playerId);
  if (!actor || !actor.isAlive) {
    return { legal: false, reason: 'Eliminated or invalid player cannot act.' };
  }

  if (state.players[state.turnIndex].id !== actor.id) {
    return { legal: false, reason: 'It is not your turn.' };
  }

  // Mandatory Coup check: If player has 10 or more coins, they MUST Coup
  if (actor.coins >= 10 && action.type !== 'COUP') {
    return { legal: false, reason: 'Mandatory Coup: You have 10 or more coins and must Coup.' };
  }

  const cost = ACTION_COSTS[action.type];
  if (actor.coins < cost) {
    return { legal: false, reason: `Requires ${cost} coins (you have ${actor.coins}).` };
  }

  // Check target requirement
  if (action.type === 'STEAL' || action.type === 'ASSASSINATE' || action.type === 'COUP') {
    if (!action.targetId) {
      return { legal: false, reason: `${action.type} requires a target player.` };
    }
    const target = state.players.find(p => p.id === action.targetId);
    if (!target || !target.isAlive) {
      return { legal: false, reason: 'Target player is eliminated or invalid.' };
    }
    if (target.id === actor.id) {
      return { legal: false, reason: 'Cannot target yourself.' };
    }
    if (action.type === 'STEAL' && target.coins === 0) {
      return { legal: false, reason: 'Target player has no coins to steal.' };
    }
  }

  return { legal: true };
}

export function getLegalActions(state: GameState, player: Player): ActionOption[] {
  if (!player.isAlive || state.players[state.turnIndex].id !== player.id) {
    return [];
  }

  const allActions: ActionType[] = ['INCOME', 'FOREIGN_AID', 'TAX', 'STEAL', 'ASSASSINATE', 'EXCHANGE', 'COUP'];

  // Mandatory Coup
  if (player.coins >= 10) {
    return [
      {
        action: { type: 'COUP', playerId: player.id },
        label: 'Coup (Mandatory)',
        disabled: false,
        cost: 7,
      }
    ];
  }

  const livingOpponents = state.players.filter(p => p.isAlive && p.id !== player.id);

  return allActions.map((type) => {
    const cost = ACTION_COSTS[type];
    const claimedRole = ROLE_CLAIMS[type] || undefined;
    let disabled = false;
    let reason: string | undefined = undefined;

    if (player.coins < cost) {
      disabled = true;
      reason = `Requires ${cost} coins`;
    } else if ((type === 'STEAL' || type === 'ASSASSINATE' || type === 'COUP') && livingOpponents.length === 0) {
      disabled = true;
      reason = 'No valid targets';
    }

    return {
      action: { type, playerId: player.id, claimedRole },
      label: type === 'FOREIGN_AID' ? 'Foreign Aid' : type.charAt(0) + type.slice(1).toLowerCase(),
      disabled,
      reason,
      claimedRole,
      cost,
    };
  });
}
