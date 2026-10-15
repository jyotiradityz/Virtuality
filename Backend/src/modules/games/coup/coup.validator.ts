import { CoupError } from './coup.errors.js';
import { COUP_ACTION_RULES, MANDATORY_COUP_COIN_THRESHOLD } from './coup.rules.js';
import { CoupActionPayload, CoupGameState, CoupPlayerState, CoupRole } from './coup.types.js';

export function validateAction(
  state: CoupGameState,
  playerId: string,
  action: CoupActionPayload
): void {
  const player = state.players.find((p) => p.playerId === playerId);
  if (!player) {
    throw new CoupError('NOT_IN_GAME', 'Player is not in this game.');
  }

  if (!player.isAlive) {
    throw new CoupError('PLAYER_ELIMINATED', 'Eliminated players cannot perform actions.');
  }

  if (state.currentPlayerId !== playerId) {
    throw new CoupError('NOT_YOUR_TURN', 'It is not your turn.');
  }

  if (state.phase !== 'PLAYER_TURN') {
    throw new CoupError('INVALID_PHASE', `Cannot take action in phase ${state.phase}.`);
  }

  // Mandatory Coup Rule Check (Rule 21)
  if (player.coins >= MANDATORY_COUP_COIN_THRESHOLD && action.type !== 'COUP') {
    throw new CoupError(
      'MANDATORY_COUP_REQUIRED',
      'You have 10 or more coins and MUST perform a Coup.'
    );
  }

  const rule = COUP_ACTION_RULES[action.type];

  // Coin cost check
  if (player.coins < rule.cost) {
    throw new CoupError(
      'INSUFFICIENT_COINS',
      `Action ${action.type} requires ${rule.cost} coins (you have ${player.coins}).`
    );
  }

  // Target check
  if (rule.requiresTarget) {
    const targetPayload = action as Extract<
      CoupActionPayload,
      { targetPlayerId: string }
    >;
    if (!targetPayload.targetPlayerId) {
      throw new CoupError('INVALID_TARGET', 'Target player ID is required.');
    }
    if (targetPayload.targetPlayerId === playerId) {
      throw new CoupError('CANNOT_TARGET_SELF', 'You cannot target yourself.');
    }

    const target = state.players.find((p) => p.playerId === targetPayload.targetPlayerId);
    if (!target) {
      throw new CoupError('INVALID_TARGET', 'Target player does not exist.');
    }
    if (!target.isAlive) {
      throw new CoupError('INVALID_TARGET', 'Target player is eliminated.');
    }
  }
}

export function validateChallenge(state: CoupGameState, challengerId: string): void {
  const player = state.players.find((p) => p.playerId === challengerId);
  if (!player || !player.isAlive) {
    throw new CoupError('PLAYER_ELIMINATED', 'Eliminated players cannot challenge.');
  }

  if (state.phase !== 'ACTION_RESPONSE' && state.phase !== 'BLOCK_RESPONSE') {
    throw new CoupError('INVALID_PHASE', 'No challengeable action or block is active.');
  }

  if (state.pendingAction?.actorId === challengerId && state.phase === 'ACTION_RESPONSE') {
    throw new CoupError('INVALID_ACTION', 'You cannot challenge your own action.');
  }

  if (state.pendingAction?.block?.blockerId === challengerId && state.phase === 'BLOCK_RESPONSE') {
    throw new CoupError('INVALID_ACTION', 'You cannot challenge your own block.');
  }
}

export function validateBlock(
  state: CoupGameState,
  blockerId: string,
  claimedRole: CoupRole
): void {
  const player = state.players.find((p) => p.playerId === blockerId);
  if (!player || !player.isAlive) {
    throw new CoupError('PLAYER_ELIMINATED', 'Eliminated players cannot block.');
  }

  if (state.phase !== 'ACTION_RESPONSE' && state.phase !== 'BLOCK_RESPONSE') {
    throw new CoupError('INVALID_PHASE', 'Cannot declare block at this phase.');
  }

  const pending = state.pendingAction;
  if (!pending) {
    throw new CoupError('INVALID_ACTION', 'No active action to block.');
  }

  if (pending.actorId === blockerId) {
    throw new CoupError('INVALID_ACTION', 'You cannot block your own action.');
  }

  const rule = COUP_ACTION_RULES[pending.action.type];
  if (!rule.blockableBy || !rule.blockableBy.includes(claimedRole)) {
    throw new CoupError(
      'INVALID_ACTION',
      `Role ${claimedRole} cannot block action ${pending.action.type}.`
    );
  }

  // If action was targeted (e.g. Steal, Assassinate), only target can block
  if (pending.targetId && pending.targetId !== blockerId) {
    throw new CoupError('INVALID_ACTION', 'Only the target player can block this action.');
  }
}
