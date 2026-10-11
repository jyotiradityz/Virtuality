# Testing Patterns

**Analysis Date:** 2026-10-11

## Test Framework

**Runner:**
- Vitest 1.3.1 (`Backend/package.json:30`)
- Config: Configured via NPM scripts in `Backend/package.json`:
  ```json
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
  ```

**Assertion Library:**
- Vitest built-in assertions (`describe`, `it`, `expect`, `beforeEach`).

**Run Commands:**
```bash
cd Backend && npm test         # Run all unit and integration tests once
cd Backend && npm run test:watch # Run Vitest in interactive watch mode
```

## Test File Organization

**Location:**
- Co-located within the module's `__tests__/` directory:
  - `Backend/src/modules/games/coup/__tests__/`

**Naming:**
- Named with `.test.ts` extension reflecting the component under test:
  - `coup.actions.test.ts`
  - `coup.blocks.test.ts`
  - `coup.challenges.test.ts`
  - `coup.engine.test.ts`
  - `coup.reconnect.test.ts`
  - `coup.rules.test.ts`
  - `coup.e2e.test.ts`

**Structure:**
```
Backend/src/modules/games/coup/
├── coup.engine.ts
├── coup.validator.ts
└── __tests__/
    ├── coup.actions.test.ts
    ├── coup.blocks.test.ts
    ├── coup.challenges.test.ts
    ├── coup.e2e.test.ts
    ├── coup.engine.test.ts
    ├── coup.reconnect.test.ts
    └── coup.rules.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, expect, it } from 'vitest';
import { CoupEngine } from '../coup.engine.js';

describe('CoupEngine - Actions (Tax, Steal, Foreign Aid)', () => {
  it('opens challenge window on Tax claim', () => {
    const players = [
      { playerId: 'p1', userId: 'u1', username: 'Alice' },
      { playerId: 'p2', userId: 'u2', username: 'Bob' },
    ];
    const game = CoupEngine.createGame('m1', 'K7M4QX', players);

    const nextState = CoupEngine.executeAction(game, 'p1', { type: 'TAX' });

    expect(nextState.phase).toBe('ACTION_RESPONSE');
    expect(nextState.pendingAction?.claimedRole).toBe('DUKE');
  });

  it('opens block response window on Foreign Aid claim', () => {
    const players = [
      { playerId: 'p1', userId: 'u1', username: 'Alice' },
      { playerId: 'p2', userId: 'u2', username: 'Bob' },
    ];
    const game = CoupEngine.createGame('m1', 'K7M4QX', players);

    const nextState = CoupEngine.executeAction(game, 'p1', { type: 'FOREIGN_AID' });

    expect(nextState.phase).toBe('BLOCK_RESPONSE');
    expect(nextState.pendingAction?.action.type).toBe('FOREIGN_AID');
  });
});
```

**Patterns:**
- State setup: Factory creation using `CoupEngine.createGame(matchId, roomCode, players)`.
- Immutability assertions: Verifying `nextState` properties change while original state is unaffected.
- Phase checks: Asserting that actions transition the engine into the correct phase (`ACTION_RESPONSE`, `BLOCK_RESPONSE`, `CHOOSE_INFLUENCE`, `FINISHED`).

## Mocking

**Framework:**
- Vitest built-in mocks (`vi.fn()`, `vi.spyOn()`).

**Client Mock Simulation:**
- `Frontend/src/api/transport.ts` (`MockTransport`) simulates a complete standalone Coup server in the browser:
```typescript
export class MockTransport implements ITransport {
  private state: GameState;
  constructor(playerCount: number = 4) {
    this.state = createInitialState(playerCount);
  }
  async sendAction(action: GameAction): Promise<void> {
    this.state = handleActionDeclaration(this.state, action);
    this.emitState();
    this.scheduleBotActionIfNeeded();
  }
}
```

**What to Mock:**
- Timer intervals and response deadlines (`vi.useFakeTimers()`).
- Socket network emissions when testing service methods in isolation.

**What NOT to Mock:**
- Game rules, deck management, and state transitions in `CoupEngine`. The engine is pure TypeScript logic and should be tested with actual card calculations.

## Fixtures and Factories

**Test Data Generation:**
- Pre-configured player arrays:
```typescript
const players = [
  { playerId: 'p1', userId: 'u1', username: 'Alice' },
  { playerId: 'p2', userId: 'u2', username: 'Bob' },
  { playerId: 'p3', userId: 'u3', username: 'Charlie' },
];
```
- Custom dealt hands for testing deterministic challenge scenarios (e.g. forcing player card assignments in `coup.challenges.test.ts` and `coup.e2e.test.ts`).

## Coverage

**Requirements:**
- Currently all 14 Coup engine and e2e test cases are passing (`Backend/src/modules/games/coup/Summary/game_story_e2e.md:8`).

**View Coverage:**
```bash
cd Backend && npx vitest run --coverage
```

## Test Types

**Unit Tests:**
- Validate rule definitions: `coup.rules.test.ts` (verifies action costs, card requirements, coin limits).
- Validate individual action steps: `coup.actions.test.ts`, `coup.blocks.test.ts`, `coup.challenges.test.ts`.

**Integration / E2E Tests:**
- Complete match simulation: `coup.e2e.test.ts` runs a full 6-player Coup match across multiple rounds, verifying Income, Tax, Foreign Aid, Assassinations, Contessa blocks, failed bluffs, card loss, player eliminations, and victory conditions.

**Reconnection Tests:**
- Token verification and session restoration: `coup.reconnect.test.ts`.

## Common Patterns

**Error / Exception Testing:**
```typescript
expect(() => {
  CoupEngine.executeAction(game, 'p1', { type: 'INCOME' });
}).toThrowError('NOT_YOUR_TURN');
```

**Challenge Resolution Testing:**
```typescript
// Lie scenario
const stateAfterLie = CoupEngine.declareChallenge(stateWithBluff, 'challenger_id');
expect(stateAfterLie.pendingLoseInfluence?.playerId).toBe('actor_id');
```

---

*Testing analysis: 2026-10-11*
