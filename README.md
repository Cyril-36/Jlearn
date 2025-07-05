# CodeArena

Local development environment for practicing Java coding problems using a HackerRank-style interface.

The backend exposes routes for fetching challenges, executing arbitrary Java code in a sandboxed directory and submitting solutions for automated evaluation. A simple test harness compares outputs against provided test cases and returns a score.

## Directory Structure

- `frontend/` - Vite + React + Tailwind application
- `backend/` - Node.js + Express server with Java execution engine

## Prerequisites

- Node.js 18+
- Java 17

## Installation

```bash
# install backend dependencies
cd backend && npm install
# install frontend dependencies
cd ../frontend && npm install
```

## Development

```bash
# run the API server
cd backend && npm start

# in another terminal start the React dev server
cd ../frontend && npm run dev
```

## Folder Map

```
CodeArena/
├── frontend/   # React client
└── backend/    # Express + Java runner
```

## Architecture

```
+-----------+       HTTP/JSON       +-----------+
|  React UI | <------------------> |  Express  |
| (Vite)    |                       |   API     |
+-----------+                       +-----------+
                                         |
                                         | spawnSync
                                   +-------------+
                                   |   Java 17   |
                                   | Runner &    |
                                   | Evaluator   |
                                   +-------------+
```
