# CodeArena

Local development environment for practicing Java coding problems using a HackerRank-style interface.

The backend exposes routes for fetching challenges, executing Java code in a sandboxed directory and submitting solutions for automated evaluation. A simple test harness compares outputs against provided test cases and returns a score. The dataset currently contains over one hundred stub problems copied from a single example so that the UI can be exercised offline.

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

### Running Tests

```bash
# backend unit/integration tests
cd backend && npm test

# frontend tests
cd ../frontend && npm test
```

## Folder Map

```
CodeArena/
├── frontend/   # React client
└── backend/    # Express + Java runner
```

The UI uses a dark theme with Tailwind color tokens defined in `tailwind.config.js`. Bookmarks and progress data are stored in `localStorage` so everything works without network access once dependencies are installed.

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
