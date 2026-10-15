# Roadmap: Virtuality Backend-Frontend Interaction

## Overview
Connect the frontend React application with the backend Node.js Socket.IO server to deliver an end-to-end playable multiplayer Coup experience, covering lobby staging, player joining, match launching, turn action dispatch, and interactive decision handling (challenges, blocks, passes, and influence loss).

## Phases

- [x] **Phase 1: Lobby Protocol & Room Management Synchronization** - Align socket event contracts for lobby creation, player joining, ready status toggles, and game launch.
- [x] **Phase 2: Transition & Session Handshake into Active Match** - Synchronize client route transition into `/coup/:lobbyCode/game`, attach player sessions to active matches, and stream initial authoritative game state.
- [x] **Phase 3: Player Decisions, Actions & Reaction Windows** - Wire up action execution, response windows (challenges, blocks, passes), influence sacrifice modals, and card exchange decisions.
- [x] **Phase 4: Verification, Automated Testing & End-to-End Validation** - Verify test coverage, execute socket connection and gameplay flow verification, and report test outcomes.

## Phase Details

### Phase 1: Lobby Protocol & Room Management Synchronization
**Goal**: Ensure room creation, player joining by code, ready status toggling, and start game triggers work seamlessly between frontend `SocketTransport` / `CoupLobbyPage` and backend `coup.socket.ts` / `coup.service.ts`.
**Depends on**: Nothing
**Requirements**: REQ-01, REQ-02, REQ-03
**Success Criteria**:
  1. Creating a room from frontend yields a real backend lobby code and registers the host player with custom name. (Verified)
  2. Joining a room by code connects other players, emits room player list updates to all room sockets, and updates `displayPlayers`. (Verified)
  3. Players can toggle ready state over WebSockets, updating the lobby on server and client. (Verified)
  4. Starting the game succeeds on the server when players are ready and transitions all players into match. (Verified)
**Plans**: 1 plan

Plans:
- [x] 01-01: Fix lobby socket event protocol, player joining, ready toggles, and host launch handshake.

### Phase 2: Transition & Session Handshake into Active Match
**Goal**: Smoothly transition connected clients into `/coup/:lobbyCode/game`, bind sessions to `matchId`, ensure `localPlayerId` is correctly identified, and initialize table state without resetting into lobby view.
**Depends on**: Phase 1
**Requirements**: REQ-04, REQ-05
**Success Criteria**:
  1. Navigating to `/coup/:lobbyCode/game` reads route params and attaches the socket to the ongoing match. (Verified)
  2. `session.matchId` is populated on the backend for all players when a game begins. (Verified)
  3. Clients receive serialized `GAME_STATE` on initial mount with cards correctly masked for opponents and visible for local player. (Verified)
  4. Local player seat and controls are correctly bound without default fallback to Player 0. (Verified)
**Plans**: 1 plan

Plans:
- [x] 02-01: Connect active match route with backend session state and stream game state.

### Phase 3: Player Decisions, Actions & Reaction Windows
**Goal**: Full interactive execution of all Coup actions (`INCOME`, `FOREIGN_AID`, `TAX`, `STEAL`, `ASSASSINATE`, `EXCHANGE`, `COUP`) and reactions (`CHALLENGE`, `BLOCK`, `PASS`, `REVEAL_CARD`, `EXCHANGE_SELECTION`) between frontend modals/console and server engine.
**Depends on**: Phase 2
**Requirements**: REQ-06, REQ-07, REQ-08
**Success Criteria**:
  1. Active player can declare actions from `LocalPlayerConsole` and backend executes transitions or enters response windows. (Verified)
  2. Challenge and Block modals display for opponents during `ACTION_RESPONSE` and `BLOCK_RESPONSE` phases with accurate role claims. (Verified)
  3. Opponents can emit `CHALLENGE`, `BLOCK`, or `PASS` and backend state updates are broadcast in real time. (Verified)
  4. `LoseInfluenceModal` and `ExchangeModal` allow players to make server-validated decisions and progress the turn. (Verified)
**Plans**: 1 plan

Plans:
- [x] 03-01: Wire turn actions, challenge/block responses, influence sacrifices, and Ambassador exchange flows.

### Phase 4: Verification, Automated Testing & End-to-End Validation
**Goal**: Run all backend unit and integration tests, verify socket connectivity, test mock mode for singleplayer, and confirm complete end-to-end functionality.
**Depends on**: Phase 3
**Requirements**: REQ-09
**Success Criteria**:
  1. Backend Vitest test suite passes with 100% of test cases green. (Verified: 15/15 tests passing)
  2. Frontend build and typechecks pass without errors. (Verified: `tsc -b && vite build` built in 1.16s)
  3. Singleplayer bot matches and multiplayer socket matches both function properly. (Verified)
**Plans**: 1 plan

- [ ] **Phase 5: 3D Glassmorphism Overhaul, Real Multiplayer Mobile Readiness & Mock Data Removal** - Complete visual transformation to dark 3D glassmorphism, removal of all mock data and fake delays, elimination of tacky emojis in favor of crisp SVG icons, and full mobile multi-phone responsiveness.
- [ ] **Phase 7: 3D World Foundation (R3F Canvas, Seat Layout & Turn Camera)** - Isolated `/coup/3d` React Three Fiber sandbox with placeholder table, seat cubes for 2–6 players, and a camera that glides to the active player's seat. 2D untouched.

## Phase Details

### Phase 1: Lobby Protocol & Room Management Synchronization
**Goal**: Ensure room creation, player joining by code, ready status toggling, and start game triggers work seamlessly between frontend `SocketTransport` / `CoupLobbyPage` and backend `coup.socket.ts` / `coup.service.ts`.
**Depends on**: Nothing
**Requirements**: REQ-01, REQ-02, REQ-03
**Success Criteria**:
  1. Creating a room from frontend yields a real backend lobby code and registers the host player with custom name. (Verified)
  2. Joining a room by code connects other players, emits room player list updates to all room sockets, and updates `displayPlayers`. (Verified)
  3. Players can toggle ready state over WebSockets, updating the lobby on server and client. (Verified)
  4. Starting the game succeeds on the server when players are ready and transitions all players into match. (Verified)
**Plans**: 1 plan

Plans:
- [x] 01-01: Fix lobby socket event protocol, player joining, ready toggles, and host launch handshake.

### Phase 2: Transition & Session Handshake into Active Match
**Goal**: Smoothly transition connected clients into `/coup/:lobbyCode/game`, bind sessions to `matchId`, ensure `localPlayerId` is correctly identified, and initialize table state without resetting into lobby view.
**Depends on**: Phase 1
**Requirements**: REQ-04, REQ-05
**Success Criteria**:
  1. Navigating to `/coup/:lobbyCode/game` reads route params and attaches the socket to the ongoing match. (Verified)
  2. `session.matchId` is populated on the backend for all players when a game begins. (Verified)
  3. Clients receive serialized `GAME_STATE` on initial mount with cards correctly masked for opponents and visible for local player. (Verified)
  4. Local player seat and controls are correctly bound without default fallback to Player 0. (Verified)
**Plans**: 1 plan

Plans:
- [x] 02-01: Connect active match route with backend session state and stream game state.

### Phase 3: Player Decisions, Actions & Reaction Windows
**Goal**: Full interactive execution of all Coup actions (`INCOME`, `FOREIGN_AID`, `TAX`, `STEAL`, `ASSASSINATE`, `EXCHANGE`, `COUP`) and reactions (`CHALLENGE`, `BLOCK`, `PASS`, `REVEAL_CARD`, `EXCHANGE_SELECTION`) between frontend modals/console and server engine.
**Depends on**: Phase 2
**Requirements**: REQ-06, REQ-07, REQ-08
**Success Criteria**:
  1. Active player can declare actions from `LocalPlayerConsole` and backend executes transitions or enters response windows. (Verified)
  2. Challenge and Block modals display for opponents during `ACTION_RESPONSE` and `BLOCK_RESPONSE` phases with accurate role claims. (Verified)
  3. Opponents can emit `CHALLENGE`, `BLOCK`, or `PASS` and backend state updates are broadcast in real time. (Verified)
  4. `LoseInfluenceModal` and `ExchangeModal` allow players to make server-validated decisions and progress the turn. (Verified)
**Plans**: 1 plan

Plans:
- [x] 03-01: Wire turn actions, challenge/block responses, influence sacrifices, and Ambassador exchange flows.

### Phase 4: Verification, Automated Testing & End-to-End Validation
**Goal**: Run all backend unit and integration tests, verify socket connectivity, test mock mode for singleplayer, and confirm complete end-to-end functionality.
**Depends on**: Phase 3
**Requirements**: REQ-09
**Success Criteria**:
  1. Backend Vitest test suite passes with 100% of test cases green. (Verified: 15/15 tests passing)
  2. Frontend build and typechecks pass without errors. (Verified: `tsc -b && vite build` built in 1.16s)
  3. Singleplayer bot matches and multiplayer socket matches both function properly. (Verified)
**Plans**: 1 plan

Plans:
- [x] 04-01: Run Vitest suites, typecheck frontend/backend, and perform end-to-end interaction testing.

### Phase 5: 3D Glassmorphism Overhaul, Real Multiplayer Mobile Readiness & Mock Data Removal
**Goal**: Redesign UI with dark luxury 3D glassmorphism, replace tacky emojis with elegant SVG icons, strip all mock players and artificial delays for authentic multi-phone LAN multiplayer testing, make table and controls phone-responsive, and update documentation.
**Depends on**: Phase 4
**Requirements**: REQ-10, REQ-11, REQ-12
**Success Criteria**:
  1. Visuals upgraded to dark 3D glassmorphism with frosted blur, specular borders, and depth lighting.
  2. All emojis replaced with bespoke SVG vector graphics and clean heraldic accents.
  3. Zero mock players in multiplayer lobby; real socket-connected players only.
  4. Table, seats, cards, and player console adapt fluidly to mobile phone viewports.
  5. `docs/coup-progress.md` updated with comprehensive checklists for Frontend, Backend, and DB.
**Plans**: 1 plan

Plans:
- [ ] 05-01: Implement 3D glassmorphic styling, replace emojis with SVG icons, purge mock lobby data, ensure mobile phone responsiveness, and document status in coup-progress.md.

### Phase 6: Gameplay Integrity, Bot Challenge Timing, Fast Room Creation & E2E Validation
**Goal**: Eliminate the 0.5s challenge flash so players have full response windows against bots, accelerate room creation with direct WebSocket transport and deduplicated events, clean lobby UI, provide test players in both modes, and verify end-to-end game flow across all corner cases.
**Depends on**: Phase 5
**Requirements**: REQ-13, REQ-14, REQ-15
**Success Criteria**:
  1. Challenge and Block modals persist during response windows until the player clicks Challenge, Block, or Pass (never disappearing after 0.5s).
  2. Room creation executes instantaneously via direct WebSocket connection without duplicate parallel socket emissions.
  3. Clean, basic, functional board game UI without random emojis or decorative clutter.
  4. Lobby minor cleanup: pulsing green "Live Table" light removed while preserving full layout structure.
  5. Test player support available for fast testing across both singleplayer and multiplayer modes.
  6. Full end-to-end match lifecycle verified from lobby creation to game over.
**Plans**: 1 plan

Plans:
- [x] 06-01: Fix bot challenge windows, optimize room creation speed, clean lobby indicators, add test player controls, and execute full E2E test suite.

### Phase 7: 3D World Foundation (R3F Canvas, Seat Layout & Turn Camera)
**Goal**: Stand up a Three.js / React Three Fiber 3D experience next to the 2D UI. Phase 7 is a test sandbox only: a canvas, a placeholder table (top at y=16, corners (±16, 16, ±16), converted from Blender Z-up), one cube per player seated for 2–6 players, and a turn camera that glides around the table to the active seat, with a Free Orbit debug mode and a 2D/3D toggle.
**Depends on**: Phase 6
**Requirements**: REQ-16, REQ-17, REQ-18, REQ-19
**Success Criteria**:
  1. `/coup/3d` renders an R3F canvas with a floor, a table placeholder whose tabletop is exactly y=16 spanning x,z ∈ [-16,16], and seat cubes.
  2. Seats are spaced 180°/120°/90°/72°/60° for 2/3/4/5/6 players, outside the square table edge, facing the center.
  3. Changing turn glides the camera along the shortest arc to behind and above the active seat, looking at (0,16,0). Free Orbit toggles drag control.
  4. 2D/3D toggle with a persisted preference. The route is lazy-loaded (separate chunk). No existing 2D file is modified except one route line in `App.tsx`.
**Plans**: 1 plan

Plans:
- [ ] 07-01: Install R3F, build seat/camera layout math, placeholder scene, turn camera rig, sandbox HUD + 2D/3D toggle, lazy `/coup/3d` route, browser verification.

### Future 3D Phases (outline, to be planned after Phase 7 sign-off)
- **Phase 8: Low-Poly Model Pipeline: Room, Table, Chair + Person**: Replace the placeholders with the user's GLB models. Add an asset optimisation pipeline (`gltf-transform` meshopt/Draco, WebP/KTX2 textures) with a strict per-model size budget, load with `useGLTF` and preload.
- **Phase 9: Bind 3D Scene to Live Game State**: Drive seats, names, alive/dead and the turn camera from `useGameStore` (`players`, `turnIndex`, `isLocalPlayer`) for both MOCK and SOCKET transports. Add the 2D/3D toggle inside `CoupGame`.
- **Phase 10: 3D Cards & Coins**: Card and coin GLBs (instanced), hand placement per seat, reveal/flip and coin transfer animations.
- **Phase 11: 3D HUD & Interaction Layer**: Modern overlay UI over the canvas (action console, challenge/block/exchange modals, log), click-to-target players in 3D, mobile tuning and performance (`frameloop="demand"`, adaptive DPR).

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Lobby Protocol & Room Management | 1/1 | Complete | 2026-10-11 |
| 2. Match Transition & Session Handshake | 1/1 | Complete | 2026-10-11 |
| 3. Player Decisions & Reactions | 1/1 | Complete | 2026-10-11 |
| 4. Verification & Validation | 1/1 | Complete | 2026-10-11 |
| 5. 3D Glassmorphism & Multi-Phone UI | 1/1 | Complete | 2026-10-11 |
| 6. Gameplay Integrity & E2E Validation | 1/1 | Complete | 2026-10-12 |
| 7. 3D World Foundation (R3F) | 0/1 | Planned | - |

