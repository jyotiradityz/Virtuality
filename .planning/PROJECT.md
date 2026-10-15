# Project: Virtuality — Backend & Frontend Interaction Fix

## Vision
Virtuality is a real-time multiplayer gaming platform. This milestone focuses on fixing the communication and state synchronization between the Frontend React UI and the Backend Node.js/Socket.IO game server for Coup, enabling end-to-end lobby creation, player joining, ready toggles, match transitions, action executions, reaction windows (challenges, blocks, passes), and influence/exchange decisions.

## Goals
- **Lobby Management:** Robust lobby creation, room joining, player list updates, and ready toggles via Socket.IO.
- **Match Lifecycle:** Seamless transition from lobby into active game view (`/coup/:lobbyCode/game`) with session preservation and room subscription.
- **Player Decisions & Reactions:** Authoritative handling of turn actions, block declarations, challenges, influence loss selections, and Ambassador card exchanges.
- **Integrity & Stability:** Preserve existing UI aesthetics and animations; pass all backend Vitest tests and verify socket communication.

## Scope & Boundaries
- Focus strictly on fixing Coup multiplayer and singleplayer backend-frontend interaction.
- Do not introduce unrelated third-party dependencies.
- Keep the server as the single source of truth.
