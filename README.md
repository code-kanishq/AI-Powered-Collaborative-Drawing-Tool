# AI-Powered Collaborative Drawing Tool

An AI-driven collaborative drawing application inspired by Excalidraw, built with **Next.js**, **Express.js**, **WebSockets**, **Prisma**, and **PostgreSQL (Neon)**. The platform enables multiple users to draw together in real time and also allows users to generate shapes through **natural-language AI commands**.

## Overview

This project combines real-time collaboration and AI-assisted drawing in a single full-stack application. Users can sign up, create or join drawing rooms, sketch manually on a shared canvas, and use AI prompts to generate shapes directly on the canvas.

The main highlights of the project are:

- **Real-time multi-user collaboration** using WebSockets
- **AI-based natural language drawing** for shape generation
- **Room-based shared canvas**
- **Persistent storage** of room data using PostgreSQL
- **Authentication flow** with sign up and sign in
- **Monorepo architecture** using Turborepo and pnpm

---

## Features

- User authentication
- Create and join collaborative drawing rooms
- Shared whiteboard with real-time synchronization
- Manual drawing tools such as:
  - Pencil
  - Rectangle
  - Circle
- AI assistant to convert prompts like:
  - `draw a circle in the middle`
  - `draw two rectangles side by side`
  - `draw a house using rectangles`
- Persistent room data and stored shapes
- Multi-service architecture with separate frontend, HTTP backend, and WebSocket backend

---

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend
- Express.js
- WebSocket Server
- JWT Authentication

### Database
- PostgreSQL (Neon)
- Prisma ORM

### AI Integration
- Gemini API

### Tooling
- Turborepo
- pnpm

---

## Project Structure

```bash
apps/
  frontend/        # Main Next.js frontend
  http-backend/    # Express backend for auth, rooms, chats, AI routes
  ws-backend/      # WebSocket backend for real-time collaboration

packages/
  db/              # Prisma schema, migrations, and db client
  common/          # Shared common code
  backend-common/  # Shared backend utilities/config
