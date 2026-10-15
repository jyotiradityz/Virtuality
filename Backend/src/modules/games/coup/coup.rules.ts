import { CoupActionType, CoupRole } from './coup.types.js';

export interface ActionRuleDefinition {
  cost: number;
  claimedRole?: CoupRole;
  blockableBy?: CoupRole[];
  isChallengable: boolean;
  requiresTarget: boolean;
}

export const COUP_ACTION_RULES: Record<CoupActionType, ActionRuleDefinition> = {
  INCOME: {
    cost: 0,
    isChallengable: false,
    requiresTarget: false,
  },
  FOREIGN_AID: {
    cost: 0,
    blockableBy: ['DUKE'],
    isChallengable: false,
    requiresTarget: false,
  },
  TAX: {
    cost: 0,
    claimedRole: 'DUKE',
    isChallengable: true,
    requiresTarget: false,
  },
  STEAL: {
    cost: 0,
    claimedRole: 'CAPTAIN',
    blockableBy: ['CAPTAIN', 'AMBASSADOR'],
    isChallengable: true,
    requiresTarget: true,
  },
  EXCHANGE: {
    cost: 0,
    claimedRole: 'AMBASSADOR',
    isChallengable: true,
    requiresTarget: false,
  },
  ASSASSINATE: {
    cost: 3,
    claimedRole: 'ASSASSIN',
    blockableBy: ['CONTESSA'],
    isChallengable: true,
    requiresTarget: true,
  },
  COUP: {
    cost: 7,
    isChallengable: false,
    requiresTarget: true,
  },
};

export const MANDATORY_COUP_COIN_THRESHOLD = 10;
export const ASSASSINATION_COST = 3;
export const COUP_COST = 7;
export const GRACE_PERIOD_SECONDS = 60;
export const RESPONSE_TIMEOUT_MS = 30000;
