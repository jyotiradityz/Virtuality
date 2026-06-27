# Catan Online - Project Specification

## Objective

Build a production-quality multiplayer online version of Catan with support for custom expansions and scalable architecture.

This project should be built incrementally and follow clean architecture principles.

The code should always be modular, documented, strongly typed, and production-ready.

---

## Tech Stack

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
* Prisma ORM
* PostgreSQL
* Redis

Authentication

* JWT
* Google OAuth
* Email Login

Deployment

Frontend:
Vercel

Backend:
Railway

Database:
PostgreSQL

Redis:
Upstash

---

## Architecture

The server is the source of truth.

The frontend should never validate game rules.

Clients only send actions.

Server validates actions.

Server updates game state.

Server broadcasts updates to every player.

---

## Features

Phase 1

* Authentication
* Landing page
* Dashboard
* Lobby system
* Profile

Phase 2

* Classic 2–4 Player Catan

Phase 3

* 5–6 Player Expansion

Phase 4

* 7–8 Player Expansion

Phase 5

* Cities & Knights

Phase 6

* Seafarers

Future

* AI Bots
* Matchmaking
* Ranking
* Achievements
* Replay System
* Spectator Mode
* Voice Chat
* Friends List

---

## Coding Standards

Use TypeScript everywhere.

Avoid duplicate code.

Use reusable components.

Never hardcode player count.

All game logic belongs in backend.

Write clean folder structures.

Add comments for complex algorithms.

Create tests for game rules.

---

## Folder Structure

frontend/

backend/

shared/

docs/

---

## Current Goal

Implement only one phase at a time.

Never start the next phase until the previous phase is fully complete and tested.

After every completed feature:

* Update documentation.
* Add tests.
* Verify TypeScript passes.
* Ensure no lint errors.

Always ask before introducing additional libraries that are not already part of the approved stack.
