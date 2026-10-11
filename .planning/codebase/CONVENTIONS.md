# Coding Conventions

**Analysis Date:** 2026-10-11

## Naming Patterns

**Files:**
- Backend module files: Dot-separated scope notation `[feature].[role].ts` (e.g. `coup.engine.ts`, `coup.socket.ts`, `coup.types.ts`).
- React components: PascalCase matching the default export (e.g. `CoupGame.tsx`, `GameTable.tsx`, `ChallengeModal.tsx`).
- React hooks: camelCase starting with `use` (e.g. `useGame.ts`, `usePlayerPosition.ts`).
- Service classes: PascalCase with descriptive suffix (e.g. `CoupEngine`, `CoupService`, `CoupRepository`, `SocketTransport`).

**Functions & Methods:**
- camelCase for functions and class methods (e.g. `executeAction`, `promptLoseInfluence`, `dealInitialCards`, `handleActionDeclaration`).
- Event handlers prefixed with `handle` (e.g. `handleCreateLobby`, `handleJoinRoom`, `handleStartMultiplayerGame`).
- Factory/Creator methods: `createGame`, `createDeck`, `createInitialState`.

**Variables & Constants:**
- camelCase for variables, instances, and parameters (e.g. `nextState`, `currentPlayerId`, `reconnectToken`).
- UPPER_SNAKE_CASE for static configuration constants and enum-like mappings (e.g. `COUP_EVENTS`, `COUP_ACTION_RULES`, `MANDATORY_COUP_COIN_THRESHOLD`, `GAMES`).

**Types & Interfaces:**
- PascalCase for all types and interfaces (e.g. `CoupGameState`, `CoupPlayerState`, `CoupRole`, `CoupActionPayload`).
- Interface names for abstract contracts prefixed with `I` (e.g. `ITransport`).
- String union types in UPPER_SNAKE_CASE for states and actions (e.g. `type CoupRole = 'DUKE' | 'ASSASSIN' | 'CAPTAIN' | 'AMBASSADOR' | 'CONTESSA'`).

## Code Style

**Formatting:**
- 2-space indentation throughout TypeScript and JSON files.
- Single quotes preferred for strings in TypeScript; double quotes in JSON.
- Semicolons used consistently.
- Trailing commas in multi-line objects and arrays.

**Linting:**
- Frontend uses `oxlint` (`Frontend/.oxlintrc.json`).
- Plugins enabled: `react`, `typescript`, `oxc`.
- Strict React hooks validation enforced: `"react/rules-of-hooks": "error"`.
- Clean component exports: `"react/only-export-components": ["warn", { "allowConstantExport": true }]`.

## Import Organization

**Order:**
1. External library imports (`import express from 'express';`, `import { useState, useEffect } from 'react';`, `import { motion } from 'framer-motion';`)
2. Internal modules and services (`import { CoupEngine } from './coup.engine.js';`)
3. Component imports (`import { GameTable } from '../components/table/GameTable';`)
4. Type imports using TypeScript's `type` qualifier (`import type { GameState, GameAction } from '../types/game';`)
5. Stylesheet imports (`import '../styles/coup.css';`)

**Path Aliases & Extensions:**
- Backend uses NodeNext module resolution: relative local imports MUST include the `.js` extension (e.g. `import { CoupError } from './coup.errors.js';`).
- Frontend uses standard relative directory paths (`../components/`, `./pages/`).

## Error Handling

**Patterns:**
- Custom typed domain errors: `CoupError` in `Backend/src/modules/games/coup/coup.errors.ts` inherits from standard `Error` and provides a machine-readable `code` property:
  ```typescript
  export class CoupError extends Error {
    constructor(public code: string, message: string) {
      super(message);
      this.name = 'CoupError';
    }
  }
  ```
- Validation guards throw early: `validateAction()` throws `CoupError('NOT_YOUR_TURN', ...)` before any state mutation can occur.
- Catch at the transport layer: Socket handlers wrap service invocations in `try/catch` and emit structured error objects:
  ```typescript
  try {
    // execute action
  } catch (err: any) {
    socket.emit(COUP_EVENTS.ERROR, {
      code: err.code || 'ACTION_FAILED',
      message: err.message
    });
  }
  ```

## Logging

**Framework:**
- Built-in `console.log` and `console.error` utilized.
- Informational log messages with emojis used for server startup: `🎮 Virtuality Coup Backend listening on 0.0.0.0:${PORT}`.

**Patterns:**
- Errors in async handlers logged with context: `console.error('Failed to create room', e);`.
- Avoid logging sensitive user session secrets or credentials.

## Comments

**When to Comment:**
- Header blocks describing the rules or domain rationale (e.g., rule numbers from official Coup rules: `// Mandatory Coup Rule Check (Rule 21)` in `coup.validator.ts:27`).
- Sections separating distinct logic stages in large controllers (`// 1. Create Lobby`, `// 2. Join Lobby`, `// Action 1: INCOME`).

**JSDoc/TSDoc:**
- Used for exported public API methods and engine functions to document parameters and return structures.

## Function Design

**Size:**
- Engine methods are modular and single-responsibility.
- Complex state transitions decomposed into helper methods (e.g., `promptLoseInfluence`, `advanceTurn`, `resolveActionExecution`).

**Parameters:**
- Complex actions receive structured payload objects rather than multiple positional arguments (e.g. `action: CoupActionPayload`).

**Return Values:**
- Engine transition functions return a fresh state object: `(state: CoupGameState, ...) => CoupGameState`.
- Immutable cloning pattern used: `const nextState: CoupGameState = JSON.parse(JSON.stringify(state));` before modifying properties and incrementing `nextState.version += 1`.

## Module Design

**Exports:**
- Named exports preferred for domain logic, utility functions, and types (`export class CoupEngine`, `export function validateAction`).
- Default exports used for top-level React page components (`export default function CoupGame()`).

**Barrel Files:**
- Avoided where deep imports provide clearer traceability.

---

*Convention analysis: 2026-10-11*
