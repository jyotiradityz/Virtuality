import type { GameState, GameAction, Role } from '../types/game';
import {
  createInitialState,
  handleActionDeclaration,
  handlePassResponse,
  handleBlockAction,
  handleChallengeAction,
  handleLoseInfluence,
  handleExchangeSelection,
} from '../game/engine';
import { getLegalActions } from '../game/rules';

export interface ITransport {
  sendAction(action: GameAction): Promise<void>;
  sendPass(): Promise<void>;
  sendBlock(blockerId: string, claimedRole: Role): Promise<void>;
  sendChallenge(challengerId: string): Promise<void>;
  sendLoseInfluence(playerId: string, cardId: string): Promise<void>;
  sendExchange(keptCardIds: string[]): Promise<void>;
  onStateUpdate(callback: (state: GameState) => void): void;
  connect(): Promise<void>;
  disconnect(): void;
}

export class MockTransport implements ITransport {
  private stateCallback: ((state: GameState) => void) | null = null;
  private state: GameState;

  constructor(playerCount: number = 4) {
    this.state = createInitialState(playerCount);
  }

  async connect(): Promise<void> {
    console.log('Connected to Mock Coup Transport');
    this.emitState();
    this.scheduleBotActionIfNeeded();
  }

  disconnect(): void {
    console.log('Disconnected from Mock Coup Transport');
  }

  onStateUpdate(callback: (state: GameState) => void): void {
    this.stateCallback = callback;
    if (this.state) {
      callback(this.state);
    }
  }

  private emitState(): void {
    if (this.stateCallback) {
      this.stateCallback(this.state);
    }
  }

  async sendAction(action: GameAction): Promise<void> {
    this.state = handleActionDeclaration(this.state, action);
    this.emitState();
    this.scheduleBotActionIfNeeded();
  }

  async sendPass(): Promise<void> {
    this.state = handlePassResponse(this.state);
    this.emitState();
    this.scheduleBotActionIfNeeded();
  }

  async sendBlock(blockerId: string, claimedRole: Role): Promise<void> {
    this.state = handleBlockAction(this.state, blockerId, claimedRole);
    this.emitState();
    this.scheduleBotActionIfNeeded();
  }

  async sendChallenge(challengerId: string): Promise<void> {
    this.state = handleChallengeAction(this.state, challengerId);
    this.emitState();
    this.scheduleBotActionIfNeeded();
  }

  async sendLoseInfluence(playerId: string, cardId: string): Promise<void> {
    this.state = handleLoseInfluence(this.state, playerId, cardId);
    this.emitState();
    this.scheduleBotActionIfNeeded();
  }

  async sendExchange(keptCardIds: string[]): Promise<void> {
    this.state = handleExchangeSelection(this.state, keptCardIds);
    this.emitState();
    this.scheduleBotActionIfNeeded();
  }

  private scheduleBotActionIfNeeded(): void {
    if (this.state.phase === 'GAME_OVER') return;

    // 1. If it's a Bot's turn in ACTION_SELECTION
    const currentTurnPlayer = this.state.players[this.state.turnIndex];
    if (this.state.phase === 'ACTION_SELECTION' && !currentTurnPlayer.isLocalPlayer && currentTurnPlayer.isAlive) {
      setTimeout(() => {
        const legal = getLegalActions(this.state, currentTurnPlayer);
        const validOptions = legal.filter((opt) => !opt.disabled);
        if (validOptions.length > 0) {
          const chosenOption = validOptions[Math.floor(Math.random() * validOptions.length)];
          const action = { ...chosenOption.action };

          // Attach target if needed
          if (action.type === 'STEAL' || action.type === 'ASSASSINATE' || action.type === 'COUP') {
            const livingOpponents = this.state.players.filter(
              (p) => p.isAlive && p.id !== currentTurnPlayer.id
            );
            if (livingOpponents.length > 0) {
              action.targetId =
                livingOpponents[Math.floor(Math.random() * livingOpponents.length)].id;
            }
          }
          this.sendAction(action);
        }
      }, 1000);
      return;
    }

    // 2. If RESPONSE_WINDOW or BLOCK_RESPONSE_WINDOW and waiting for response
    if (this.state.phase === 'RESPONSE_WINDOW' || this.state.phase === 'BLOCK_RESPONSE_WINDOW') {
      const pending = this.state.pendingAction;
      const isLocalActor = this.state.players.find(
        (p) => p.id === pending?.sourcePlayerId
      )?.isLocalPlayer;
      const isLocalTarget = this.state.players.find(
        (p) => p.id === pending?.targetPlayerId
      )?.isLocalPlayer;

      // If local player isn't involved in responding, pass after short delay
      if (!isLocalActor && !isLocalTarget) {
        setTimeout(() => {
          this.sendPass();
        }, 1200);
      }
    }

    // 3. If LOSE_INFLUENCE_PENDING for a bot
    if (this.state.phase === 'LOSE_INFLUENCE_PENDING' && this.state.pendingLoseInfluence) {
      const targetPlayer = this.state.players.find(
        (p) => p.id === this.state.pendingLoseInfluence?.playerId
      );
      if (targetPlayer && !targetPlayer.isLocalPlayer && targetPlayer.isAlive) {
        setTimeout(() => {
          const activeCard = targetPlayer.cards.find((c) => !c.isRevealed);
          if (activeCard) {
            this.sendLoseInfluence(targetPlayer.id, activeCard.id);
          }
        }, 1200);
      }
    }

    // 4. If EXCHANGE_PENDING for a bot
    if (this.state.phase === 'EXCHANGE_PENDING' && this.state.pendingExchange) {
      const targetPlayer = this.state.players.find(
        (p) => p.id === this.state.pendingExchange?.playerId
      );
      if (targetPlayer && !targetPlayer.isLocalPlayer) {
        setTimeout(() => {
          const activeCards = targetPlayer.cards.filter((c) => !c.isRevealed);
          const pool = [...activeCards, ...this.state.pendingExchange!.drawnCards];
          const keptIds = pool.slice(0, activeCards.length).map((c) => c.id);
          this.sendExchange(keptIds);
        }, 1200);
      }
    }
  }
}
