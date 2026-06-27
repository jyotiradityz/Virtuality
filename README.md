

# Project Name

## Virtuality

A modern multiplayer gaming platform where users can play multiple real-time strategy and party games from a single account.

The architecture must be designed so new games can be added without changing the existing platform.

---

# Vision

Build a scalable gaming platform similar to Steam, Board Game Arena, or Chess.com, but focused on modern browser-based multiplayer games.

Users should only create one account and gain access to every game available on the platform.

The platform should support:

* Authentication
* Friends
* Lobby System
* Invitations
* Voice/Text Chat (Future)
* Match History
* Rankings
* Achievements
* Cross-platform support (Web & Mobile)

Every game should plug into the same backend infrastructure.

---

# Initial Games

## 1. Hexo

Inspired by classic hex-based resource management board games.

Features:

* 2-4 Players
* 5-6 Player Expansion
* 7-8 Player Expansion
* Custom Maps
* Custom Rules
* AI Bots (Future)
* Spectator Mode
* Replay System

All rules should be implemented on the backend.

The frontend should only render the current game state.

---

## 2. Mafia

Features

* Public Lobby
* Private Lobby
* Custom Roles
* Host Controls
* Timer
* Day/Night Cycle
* Voting
* Voice Integration (Future)
* Spectator Mode

Support 5-20 players.

Allow creation of custom role presets.

---

# Platform Features

Authentication

* Google Login
* Email Login
* JWT Authentication

Profiles

* Username
* Avatar
* Friends
* Statistics
* Match History
* Achievements

Lobby

* Public Lobbies
* Private Lobbies
* Invite Friends
* Password Protected Rooms
* Ready System
* Host Controls

Realtime

All multiplayer communication must use WebSockets.

REST APIs should only be used for:

* Authentication
* Profile
* Friends
* Statistics
* Match History
* Settings

---

# Tech Stack

Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Zustand
* React Query
* React Router
* Socket.IO Client
* Framer Motion

Backend

* Node.js
* Express
* Socket.IO
* Prisma
* PostgreSQL
* Redis

Testing

* Vitest
* Playwright

Deployment

Frontend

* Vercel

Backend

* Railway

Database

* PostgreSQL

Redis

* Upstash

---

# Folder Structure

apps/
web/

server/

packages/
shared/
ui/
game-engine/
socket/
types/

games/
hexo/
mafia/

docs/

---

# Architecture

The project must use a modular architecture.

Platform services must remain independent from game logic.

Platform Layer

* Authentication
* Friends
* Lobby
* Chat
* Notifications
* Matchmaking
* Statistics

Game Layer

Each game owns:

* Rules
* State
* Validation
* Events
* Win Conditions
* Rendering Data

Games must not directly depend on one another.

---

# Lobby System

One lobby system should support every game.

Lobby Settings

* Game Type
* Maximum Players
* Password
* Public / Private
* Host
* Ready Status
* Region (Future)

Flow

Create Lobby

↓

Select Game

↓

Configure Settings

↓

Players Join

↓

Ready

↓

Server Creates Match

↓

Game Starts

---

# Database

Core Tables

Users

Friends

Friend Requests

Lobbies

Lobby Players

Matches

Achievements

Statistics

Notifications

Each game may create additional tables if necessary.

---

# Coding Standards

Use TypeScript everywhere.

Never use JavaScript.

Use reusable UI components.

Never duplicate business logic.

Backend is always the source of truth.

Use strict typing.

Prefer composition over inheritance.

Document complex algorithms.

Write unit tests for all game logic.

---

# Development Phases

Phase 1

Platform Foundation

* Authentication
* UI
* Dashboard
* User Profiles
* Friends
* Lobby System

Phase 2

Hexo

* Complete gameplay
* Multiplayer
* Save/Resume
* Match History

Phase 3

Mafia

* Multiplayer
* Role Engine
* Voting
* Timers
* Win Conditions

Phase 4

Platform Improvements

* Rankings
* Notifications
* Achievements
* Chat
* Replay System

Phase 5

Mobile Application

Build a React Native app using the same backend APIs and WebSocket infrastructure.

---

# AI Agent Instructions

Always work on one feature at a time.

Never modify completed features unless fixing bugs.

Do not introduce new libraries without approval.

Maintain clean folder structures.

Run linting and type checks before considering a task complete.

Generate modular, maintainable, and production-ready code.

Keep documentation updated whenever a feature is completed.
