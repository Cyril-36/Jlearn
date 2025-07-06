# Jlearn

Full-stack code playground for Java challenges.

## Setup

```bash
cd backend && npm install
cd ../frontend && npm install --legacy-peer-deps
```

Create a `.env` file in `backend` with:

```
MONGODB_URI=mongodb://localhost:27017/jlearn
```

Then start the app:

```bash
cd backend && npm start &
cd ../frontend && npm run dev
```
