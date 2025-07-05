# CodeArena

Local development environment for practicing Java coding problems using a HackerRank-style interface.

The backend exposes routes for fetching challenges, executing arbitrary Java code in a
sandboxed directory and submitting solutions for automated evaluation. A simple
test harness compares outputs against provided test cases and returns a score.

## Directory Structure

- `frontend/` - Vite + React + Tailwind application
- `backend/` - Node.js + Express server with Java execution engine

