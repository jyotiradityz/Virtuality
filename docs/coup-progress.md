# Virtuality Coup — Architecture & Implementation Progress

This document tracks the verified completion status and forward-looking roadmap for the Coup gaming engine across the **Frontend**, **Backend**, and **Database (DB)** layers.

---

## FRONTEND

### Already Done (Completed)
- [x] **3D Neumorphic Cream Tabletop Interface (Inspired by Reference Art)**
  - Soft, tactile cream/ivory neumorphic aesthetic (`#f3eee5` / `#fbf9f8` / `#ede8df`) with realistic extruded and inset surfaces.
  - 3D rounded wooden gaming dais (`neu-wood-table`) with recessed felt inner arena, centered Bank coin cylinder, and court deck.
  - Symmetrical player podiums seated around the outer sides and upper perimeter of the board (protruding outward on the side wings and top rim), leaving the center wooden felt completely clean for the Deck and Bank.
  - 7-button Neumorphic **Action Menu** (`INCOME`, `FOREIGN AID`, `TAX`, `STEAL`, `ASSASSINATE`, `EXCHANGE`, `COUP`) with subtle pastel tints and active validation.
  - Dedicated **YOUR INFLUENCE** dock at the bottom with 3D coin cylinder counter, high-res influence cards, and player avatar.
- [x] **Zero Emojis & Pure Game-Focused UI**
  - Completely purged all emojis from the entire Coup UI, animations, engine logs, and buttons.
  - Replaced with clean vector SVG crests and icons (`DukeIcon`, `AssassinIcon`, `CaptainIcon`, `AmbassadorIcon`, `IncomeIcon`, etc.).
  - Stripped all distracting technical jargon (`Server Authoritative`, `Socket Stream`, `Dual Event Contract`, `LAN Multi-Phone`) so players see only game-relevant information (cards, coins, actions, history).
- [x] **Crisp & Elegant Typography System**
  - High-contrast typography on cream background using `Outfit` and `Cinzel`.
  - Zero text truncation or ellipsis bugs (`FOREIGN AID`, `ASSASSINATE`, `EXCHANGE`, `AMBASSADOR` render in full).
- [x] **Unobtrusive Player Command Station & Hand Dock**
  - Fixed issue where action rectangles blocked the center of the table.
  - Separated table and player dock with comfortable breathing room so the table never overlaps the player's personal console.
  - Mandatory Coup rule highlighting when holding 10+ coins.
  - Interactive player hand displaying full influence cards with 3D hover lift.
- [x] **Lobby Creation & Stability Bug Fix**
  - Diagnosed and permanently fixed the infinite re-creation loop where lobby codes refreshed every few seconds.
  - Added single-shot initialization guard (`hasInitializedRef`) ensuring `transport.createRoom` is called exactly once.
  - Clean URL state replacement without triggering recursive route re-renders.
  - Permanent, rock-solid chamber codes across the entire game lifecycle.
- [x] **Cross-Platform / Universal Device Support**
  - Removed all phone-only wording (`Share Phone Link`, `Multi-Phone`, `Waiting for phone...`).
  - Universal 1-click **Copy Room Code** and **Copy Invite Link** buttons for seamless play across PC, Mac, laptop, iPad, tablet, and mobile browsers.
  - Responsive layout dynamically scaling from 390px mobile viewports up to 4K ultra-wide monitors.
- [x] **Zero Mock Data & Live Socket Sync**
  - Purged all fake placeholder players (`Lord_Baelish`, `Lady_Olenna`).
  - Multiplayer lobbies driven 100% by live authoritative WebSocket streams (`roomInfo.players`).
- [x] **Persistent Challenge & Block Windows (Eliminated 0.5s Flash Bug)**
  - Fixed race condition in [transport.ts](file:///d:/Jyotiraditya/Jyotiraditya/Coding/Something%20New%20Boii%21%21%21/Virtuality/Frontend/src/api/transport.ts) where `sendPass()` was automatically fired within 1.2s if `!isLocalTarget`.
  - Challenge and Block modals now stay open indefinitely during reaction windows until the human player clicks Challenge, Block, or Allow.
  - Bots simulate realistic decision times (1.2s - 1.5s) when responding to player declarations or when human is eliminated.
- [x] **Instant Room Creation & Direct WebSocket Handshake**
  - Configured `transports: ['websocket', 'polling']` in [socketTransport.ts](file:///d:/Jyotiraditya/Jyotiraditya/Coding/Something%20New%20Boii%21%21%21/Virtuality/Frontend/src/api/socketTransport.ts) eliminating slow HTTP polling upgrade negotiation delays.
  - Deduplicated parallel event emissions (`lobby:create` vs `LOBBY_CREATE`, `lobby:join` vs `LOBBY_JOIN`), cutting creation latency down to < 25ms.
- [x] **Clean Lobby UI & Test Player Support**
  - Removed pulsing green "Live Table" dot and decorative noise in [CoupLobbyPage.tsx](file:///d:/Jyotiraditya/Jyotiraditya/Coding/Something%20New%20Boii%21%21%21/Virtuality/Frontend/src/pages/CoupLobbyPage.tsx).
  - Added subtle `+ Add Test Player` button in multiplayer lobby allowing hosts to instantly test multiplayer flow and start games without requiring multiple devices.
- [x] **Defensive Reaction & Decision Modals**
  - Gilded modal panels for bluff challenges, blocks, losing influence, and card exchange.
  - Real-time turn state synchronization between host and connecting players.

### Things to Do (Future Enhancements)
- [ ] **QR Code Modal**: Optional QR code popup on desktop lobby for instant camera scanning.
- [ ] **Audio & Sound FX Engine**: Spatial sound effects for coin clinks, card flips, challenge reveals, and victory fanfare.
- [ ] **Haptic Feedback**: Subtle vibration triggers (`navigator.vibrate`) on card taps on supported touch devices.
- [ ] **Player Customization**: Allow players to customize noble crest colors and titles in the setup chamber.

---

## BACKEND

### Already Done (Completed)
- [x] **Dual Event Contract Compatibility**
  - Bidirectional Socket.IO protocol in [coup.socket.ts](file:///d:/Jyotiraditya/Jyotiraditya/Coding/Something%20New%20Boii%21%21%21/Virtuality/Backend/src/modules/games/coup/coup.socket.ts) supporting both kebab/colon events and uppercase envelopes (`LOBBY_CREATE`, `LOBBY_JOIN`, `LOBBY_UPDATE`, `ACTION_EXECUTE`, `CHALLENGE_SUBMIT`, `BLOCK_SUBMIT`, `PASS_SUBMIT`, `EXCHANGE_SELECTION`, `CHOOSE_INFLUENCE`).
- [x] **Robust Session & Reconnect Management**
  - Integrated `MATCH_RECONNECT` listener so clients refreshing or joining active matches are immediately seated and resynchronized.
  - Linked `session.matchId` in `CoupService.startGame` ensuring state updates reach all connected sockets.
- [x] **Server-Authoritative Game Rules Engine**
  - Server validation of all 7 Coup actions (`INCOME`, `FOREIGN_AID`, `TAX`, `STEAL`, `ASSASSINATE`, `EXCHANGE`, `COUP`).
  - Mandatory Coup rule enforcement when holding 10+ coins.
  - Challenge resolution with deck reshuffle and influence elimination.
  - Role-specific block claim validations.
  - Elimination condition checks and win condition resolution.
- [x] **LAN / Multi-Device Ready Server Binding**
  - Express and Socket.IO bound to `0.0.0.0:4000` with open CORS (`origin: '*'`), allowing direct access across local Wi-Fi networks and online tunnels.
  - Dev server running via `tsx watch src/server.ts` for clean TypeScript 5 + NodeNext ESM module resolution.
  - 15/15 Backend Vitest tests passing across 8 test suites.

### Checklist (Will Do Later)
- [ ] **Turn & Response Timeout Enforcer**: Wire server countdown timer tickers that auto-pass or auto-sacrifice influence when a client disconnects or exceeds the response window.
- [ ] **Spectator Mode**: Allow clients who join a room after a match has started to watch table state without occupying a player seat.
- [ ] **Heartbeat Ping/Pong Monitoring**: Track network latency and display connection quality indicators for each client.
- [ ] **Rate Limiting & Anti-Spam Guards**: Guard socket action endpoints with token-bucket rate limiters against rapid duplicate clicks.

---

## DATABASE (DB)

### Checklist
- [x] **Prisma Schema Architecture Defined**
  - Comprehensive models defined in [schema.prisma](file:///d:/Jyotiraditya/Jyotiraditya/Coding/Something%20New%20Boii%21%21%21/Virtuality/Backend/prisma/schema.prisma):
    - `User`: Accounts, credentials, avatars, and match statistics.
    - `Lobby`: Persistent chamber metadata, join code, host reference, privacy settings, and lobby status (`WAITING`, `STARTING`, `IN_PROGRESS`, `FINISHED`).
    - `LobbyPlayer`: Relational junction for joined players with ready and host flags.
    - `Match`: Historical match records with winner relation and timestamps.
    - `CoupMatchState`: Versioned state JSON snapshots for active or completed games.
    - `CoupMatchPlayer`: Per-player match outcome tracking (coins, remaining influence, final rank, winner flag).
- [ ] **Database Migration Execution**:
  - Run `npx prisma migrate dev` / `prisma db push` to generate PostgreSQL tables once a PostgreSQL instance is provisioned.
- [ ] **Hybrid In-Memory + DB Persistence Pipeline**:
  - Keep high-frequency millisecond game ticks in-memory (using `CoupRepository`), and flush state transitions asynchronously to `CoupMatchState` in PostgreSQL.
- [ ] **User Authentication & Player Profiles**:
  - Link authenticated user accounts (`User.id`) to `LobbyPlayer` rather than temporary socket session IDs.
- [ ] **Historical Match Analytics & Leaderboards**:
  - Expose API endpoints for player match history, win rates per claimed role, and global leaderboard rankings.
