# Clinic Queue Management System

A real-time clinic queue management app with a receptionist dashboard and a patient display screen. Built with Express, Socket.IO, MongoDB, React, and Tailwind CSS.

## Features

- **Receptionist dashboard** — add patients, call the next token, set average consultation time
- **Patient display screen** — shows current token, tokens ahead, and estimated wait time
- **Real-time sync** — Socket.IO broadcasts queue updates instantly to all connected clients
- **MongoDB persistence** — patients and settings survive server restarts

## Folder Structure

```
clinic-queue-system/
├── package.json                 # Root scripts (dev, install:all)
├── .env.example                 # Server environment template
├── .gitignore
├── README.md
│
├── server/
│   ├── package.json
│   └── src/
│       ├── index.js             # Express + Socket.IO entry point
│       ├── config/
│       │   └── db.js            # MongoDB connection
│       ├── models/
│       │   ├── Patient.js       # Patient/token schema
│       │   └── Settings.js      # Consultation time & token counter
│       ├── routes/
│       │   ├── patients.js      # POST /api/patients
│       │   ├── queue.js         # GET /api/queue/state, POST /api/queue/next
│       │   └── settings.js      # PUT /api/settings/consultation-time
│       ├── services/
│       │   └── queueService.js  # Queue business logic
│       └── socket/
│           └── index.js         # Socket.IO setup & broadcast
│
└── client/
    ├── package.json
    ├── index.html
    ├── vite.config.js
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── App.jsx              # Router + navigation
        ├── index.css            # Tailwind imports
        ├── api/
        │   └── client.js        # REST API helpers
        ├── hooks/
        │   └── useSocket.js     # Socket.IO React hook
        ├── components/
        │   ├── AddPatientForm.jsx
        │   ├── QueueControls.jsx
        │   ├── TokenDisplay.jsx
        │   └── WaitingQueueList.jsx
        └── pages/
            ├── ReceptionistDashboard.jsx
            └── PatientDisplay.jsx
```

## Prerequisites

- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas connection string)

## Setup

1. **Install dependencies**

   ```bash
   npm run install:all
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   cp client/.env.example client/.env
   ```

   Edit `.env` if your MongoDB URI or ports differ.

3. **Start MongoDB** (if running locally)

   ```bash
   mongod
   ```

4. **Run the app**

   ```bash
   npm run dev
   ```

   - Receptionist dashboard: http://localhost:5173/
   - Patient display screen: http://localhost:5173/display
   - API server: http://localhost:3001

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/patients` | Add a patient to the queue |
| POST | `/api/queue/next` | Call the next waiting token |
| GET | `/api/queue/state` | Get current queue state |
| PUT | `/api/settings/consultation-time` | Set avg. consultation minutes |

## Socket.IO Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `queue:state` | Server → Client | Full queue state object |

## Estimated Wait Time

```
estimated wait = tokens ahead × consultation time (minutes)
```
