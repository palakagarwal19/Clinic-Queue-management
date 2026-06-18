# Clinic Queue System

A real-time clinic queue management system built for **Queue Cure '26** — Wooble Hackathon.

Live sync between the receptionist desk and the patient waiting room display — no refresh needed.

---

## Live Demo

> Run locally — see setup below.

---

## Features

- **Receptionist View** — Add patients, call next token, set average consultation time, remove no-shows
- **Patient Display** — Large token display, tokens ahead, real-time estimated wait time
- **Live sync** — Both screens update instantly via Socket.IO when "Call Next" is clicked
- **Concurrency safe** — MongoDB-level distributed lock prevents double-calling
- **Offline resilience** — Falls back to polling every 5s if socket disconnects
- **Wait time from real data** — Computed as `position × consultation time`, never hardcoded

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 6, Tailwind CSS 4 |
| Backend | Node.js (ESM), Express 4 |
| Real-time | Socket.IO 4 |
| Database | MongoDB Atlas (Mongoose 8) |

---

## Project Structure

```
clinic-queue-system/
├── client/                  # React frontend
│   └── src/
│       ├── pages/
│       │   ├── ReceptionistDashboard.jsx
│       │   └── PatientDisplay.jsx
│       ├── components/
│       │   ├── AddPatientForm.jsx
│       │   ├── QueueControls.jsx
│       │   ├── WaitingQueueList.jsx
│       │   └── TokenDisplay.jsx
│       ├── hooks/
│       │   └── useSocket.js      # Socket.IO + polling fallback
│       └── api/
│           └── client.js         # Fetch API wrapper
│
└── server/                  # Express backend
    └── src/
        ├── models/
        │   ├── Patient.js        # tokenNumber, name, status, timestamps
        │   └── Settings.js       # consultationTime, lastToken, queueLock
        ├── routes/
        │   ├── patients.js       # POST /api/patients, DELETE /api/patients/:id
        │   ├── queue.js          # GET /state, POST /next, POST /reset
        │   └── settings.js       # PUT /api/settings/consultation-time
        ├── services/
        │   └── queueService.js   # All queue logic + distributed lock
        ├── socket/
        │   └── index.js          # Socket.IO setup + broadcastQueueState
        └── index.js              # Server entry point
```

---

## Socket Event Diagram

```
Receptionist clicks "Call Next"
        │
        ▼
POST /api/queue/next
        │
        ▼
MongoDB lock acquired ──► Patient status: waiting → serving ──► Lock released
        │
        ▼
broadcastQueueState(io)
        │
        ├──► queue:state ──► Receptionist screen (instant update)
        └──► queue:state ──► Patient display (instant update)

New client connects:
  socket.on('connection') ──► socket.emit('queue:state', currentState)

Socket disconnects:
  Client polls GET /api/queue/state every 5 seconds
```

---

## Concurrency & Edge Cases

### Race condition (two receptionists clicking simultaneously)
Solved with a MongoDB atomic distributed lock. `findOneAndUpdate` with `queueLocked: false` condition ensures only one operation acquires the lock at a time. The second waits up to 5s in a poll loop.

### Server crash mid-operation (lock stuck)
On every server startup, stale locks (`queueLocked: true`) are automatically cleared before accepting traffic.

### Socket disconnect
The `useSocket` hook detects disconnect and immediately starts polling `GET /api/queue/state` every 5 seconds. The display never freezes.

### Orphaned serving patients
If more than one patient has `status: serving` (edge case from crash), the system detects it and returns `queueHealth: 'degraded'` — shown as a warning badge on the receptionist screen.

### Token number collision
Tokens are assigned via atomic `$inc` inside the queue lock, and backed by a MongoDB unique index on `tokenNumber`.

---

## Wait Time Calculation

```
estimatedWaitMinutes = position × consultationTimeMinutes
```

- `position` = real-time index in the waiting queue (from MongoDB)
- `consultationTimeMinutes` = set by the receptionist (default: 10 min)
- Recalculates automatically every time the queue changes
- Never hardcoded

---

## Setup & Running

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)

### 1. Clone & install
```bash
git clone <repo-url>
cd clinic-queue-system
npm run install:all
```

### 2. Environment variables

Create `server/.env`:
```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/clinic-queue?retryWrites=true&w=majority
PORT=3001
CLIENT_URL=http://localhost:5173
```

Create `client/.env`:
```
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

### 3. Run

Terminal 1:
```bash
npm run dev:server
```

Terminal 2:
```bash
npm run dev:client
```

Open:
- Receptionist: http://localhost:5173
- Patient Display: http://localhost:5173/display

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/queue/state` | Full queue state |
| POST | `/api/queue/next` | Call next patient |
| POST | `/api/queue/reset` | Reset queue for new session |
| POST | `/api/patients` | Add patient to queue |
| DELETE | `/api/patients/:id` | Remove patient (no-show) |
| PUT | `/api/settings/consultation-time` | Update avg consultation time |
| GET | `/api/health` | Server health check |

---

## Built by

Palak — Queue Cure '26 Hackathon submission
