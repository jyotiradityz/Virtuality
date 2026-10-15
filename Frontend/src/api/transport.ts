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
  setReady?(isReady: boolean): Promise<void>;
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

    const localPlayer = this.state.players.find((p) => p.isLocalPlayer);
    const isLocalAlive = !!(localPlayer && localPlayer.isAlive);

    // 1. If it's a Bot's turn in ACTION_SELECTION
    const currentTurnPlayer = this.state.players[this.state.turnIndex];
    if (this.state.phase === 'ACTION_SELECTION' && !currentTurnPlayer.isLocalPlayer && currentTurnPlayer.isAlive) {
      setTimeout(() => {
        if (this.state.phase !== 'ACTION_SELECTION') return;
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
      }, 1200);
      return;
    }

    // 2. RESPONSE_WINDOW (Action declared, waiting for challenges or blocks)
    if (this.state.phase === 'RESPONSE_WINDOW') {
      const pending = this.state.pendingAction;
      if (!pending) return;

      const isLocalActor = localPlayer && pending.sourcePlayerId === localPlayer.id;

      // Case A: Local human is the actor -> BOTS must decide whether to challenge or block
      if (isLocalActor) {
        setTimeout(() => {
          if (this.state.phase !== 'RESPONSE_WINDOW') return;

          const actionType = pending.action.type;
          const targetBot = this.state.players.find(
            (p) => p.id === pending.targetPlayerId && !p.isLocalPlayer && p.isAlive
          );
          const livingBots = this.state.players.filter(
            (p) => !p.isLocalPlayer && p.isAlive && p.id !== pending.sourcePlayerId
          );

          // Chance for bot to challenge claimed role (Tax, Steal, Assassinate, Exchange)
          const isClaim = actionType === 'TAX' || actionType === 'STEAL' || actionType === 'ASSASSINATE' || actionType === 'EXCHANGE';
          if (isClaim && Math.random() < 0.25 && livingBots.length > 0) {
            const challenger = livingBots[Math.floor(Math.random() * livingBots.length)];
            this.sendChallenge(challenger.id);
            return;
          }

          // Chance for bot to block
          if (actionType === 'FOREIGN_AID') {
            // Any bot with Duke (or 30% bluff) blocks with Duke
            const dukeBot = livingBots.find(b => b.cards.some(c => !c.isRevealed && c.role === 'Duke')) || (Math.random() < 0.25 ? livingBots[0] : null);
            if (dukeBot) {
              this.sendBlock(dukeBot.id, 'Duke');
              return;
            }
          } else if (actionType === 'STEAL' && targetBot) {
            // Target bot blocks with Captain or Ambassador
            const hasBlockCard = targetBot.cards.some(c => !c.isRevealed && (c.role === 'Captain' || c.role === 'Ambassador'));
            if (hasBlockCard || Math.random() < 0.35) {
              this.sendBlock(targetBot.id, 'Captain');
              return;
            }
          } else if (actionType === 'ASSASSINATE' && targetBot) {
            // Target bot blocks with Contessa
            const hasContessa = targetBot.cards.some(c => !c.isRevealed && c.role === 'Contessa');
            if (hasContessa || Math.random() < 0.35) {
              this.sendBlock(targetBot.id, 'Contessa');
              return;
            }
          }

          // If no bot challenged or blocked -> bots pass
          this.sendPass();
        }, 1500);
        return;
      }

      // Case B: A BOT is the actor -> Human player is eligible to respond!
      // If local player is alive, DO NOT AUTO-PASS! Let human player decide (Challenge, Block, or Allow)!
      if (isLocalAlive) {
        // Human player sees the modal and responds manually. No timeout.
        return;
      }

      // Case C: Local player is dead/eliminated -> bots simulate amongst themselves
      setTimeout(() => {
        if (this.state.phase !== 'RESPONSE_WINDOW') return;
        this.sendPass();
      }, 1200);
      return;
    }

    // 3. BLOCK_RESPONSE_WINDOW (Block declared, waiting for challenge to block)
    if (this.state.phase === 'BLOCK_RESPONSE_WINDOW') {
      const pending = this.state.pendingAction;
      const blocker = this.state.players.find(p => p.id === pending?.block?.blockerPlayerId);

      // If local player was the one who blocked -> bots decide whether to challenge
      if (blocker?.isLocalPlayer) {
        setTimeout(() => {
          if (this.state.phase !== 'BLOCK_RESPONSE_WINDOW') return;
          const livingBots = this.state.players.filter(p => !p.isLocalPlayer && p.isAlive);
          // 25% chance a bot challenges the human's block
          if (Math.random() < 0.25 && livingBots.length > 0) {
            const challenger = livingBots[Math.floor(Math.random() * livingBots.length)];
            this.sendChallenge(challenger.id);
          } else {
            this.sendPass();
          }
        }, 1500);
        return;
      }

      // If a bot blocked -> Human player is eligible to challenge the bot's block!
      if (isLocalAlive) {
        // Human player sees the Challenge Block modal and responds manually. Do not auto-pass!
        return;
      }

      // If local player is dead -> bots pass
      setTimeout(() => {
        if (this.state.phase !== 'BLOCK_RESPONSE_WINDOW') return;
        this.sendPass();
      }, 1200);
      return;
    }

    // 4. LOSE_INFLUENCE_PENDING for a bot
    if (this.state.phase === 'LOSE_INFLUENCE_PENDING' && this.state.pendingLoseInfluence) {
      const targetPlayer = this.state.players.find(
        (p) => p.id === this.state.pendingLoseInfluence?.playerId
      );
      if (targetPlayer && !targetPlayer.isLocalPlayer && targetPlayer.isAlive) {
        setTimeout(() => {
          if (this.state.phase !== 'LOSE_INFLUENCE_PENDING') return;
          const activeCard = targetPlayer.cards.find((c) => !c.isRevealed);
          if (activeCard) {
            this.sendLoseInfluence(targetPlayer.id, activeCard.id);
          }
        }, 1200);
      }
      return;
    }

    // 5. EXCHANGE_PENDING for a bot
    if (this.state.phase === 'EXCHANGE_PENDING' && this.state.pendingExchange) {
      const targetPlayer = this.state.players.find(
        (p) => p.id === this.state.pendingExchange?.playerId
      );
      if (targetPlayer && !targetPlayer.isLocalPlayer) {
        setTimeout(() => {
          if (this.state.phase !== 'EXCHANGE_PENDING') return;
          const activeCards = targetPlayer.cards.filter((c) => !c.isRevealed);
          const pool = [...activeCards, ...this.state.pendingExchange!.drawnCards];
          const keptIds = pool.slice(0, activeCards.length).map((c) => c.id);
          this.sendExchange(keptIds);
        }, 1200);
      }
      return;
    }
  }
}
