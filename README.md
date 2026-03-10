# Q-Up

A full-stack event management app built with QR code-based attendance tracking. Event creators generate a QR code for their event, attendees scan it to sign up, and creators can manage signups in real time.

## Tech Stack

**Frontend** — React 19, TypeScript, Vite, React Router 7, custom CSS with design tokens

**Backend** — Node.js, Express, TypeScript (ES modules)

**Database** — Redis (key-value and hash storage with TTL-based auto-expiry)

**Auth** — bcrypt password hashing, httpOnly cookie sessions stored in Redis

**Real-Time** — Server-Sent Events (SSE) for live attendee updates

**Security** — Helmet, CORS, express-rate-limit

**QR** — react-qr-code (generation), @yudiel/react-qr-scanner (camera scanning)

**Infrastructure** — Google Cloud Run, Docker

## Features

- Create and manage events with automatic expiration
- Generate QR codes for event check-in
- Scan QR codes via device camera to sign up for events
- Real-time attendee list with search and print support
- Cookie-based auth with session persistence
- Creator-only controls (delete event, remove attendees)
- Responsive dark UI

## Getting Started

### Prerequisites

- Node.js 18+
- Redis instance (local or remote)

### Environment

Create `server/.env`:

```
PORT=3000
ORIGINS=http://localhost:5173
PRODUCTION=false
REDIS_HOST=your-redis-host
REDIS_PORT=your-redis-port
REDIS_USERNAME=your-redis-username
REDIS_PASSWORD=your-redis-password
```

### Install & Run

```bash
npm install
cd client && npm install
cd ../server && npm install
cd ..

# Start both client (:5173) and server (:3000)
npm run dev

# Seed test data (server must be running)
npm run seed
```

### Other Commands

```bash
npm run build           # Build client and server
npm start               # Run production server
npm run reset           # Flush Redis and re-seed
cd client && npm run lint
```

## Project Structure

```
client/src/
  components/     Reusable UI components (Button, TextInput, Navbar, Toast, etc.)
  constants/      Routes, TypeScript interfaces, error enums
  context/        React context for auth state
  hooks/          useCredentials, useFetch, useAppNavigation, useToast
  pages/          Login, Home, Profile, Event Management, QR Scanner, etc.
  css/            Single stylesheet with CSS custom properties

server/src/
  server.ts         Express app setup and middleware
  endpoints.ts      Route definitions with auth middleware
  authentication.ts User creation, login, session management
  events.ts         Event CRUD and signup operations
  database.ts       Redis client wrapper with reconnection logic
  util.ts           Standard API response format

server/scripts/
  seed.ts           Populate test data via HTTP
  reset.ts          Flush Redis and re-seed from scratch
```
