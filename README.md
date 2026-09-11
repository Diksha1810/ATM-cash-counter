# ATM Cash Counter — MERN Machine Task

Production-style reference implementation for the supplied machine task.

## Stack
- React + Vite
- Node.js + Express
- MongoDB + Mongoose
- Cookie-based `express-session` + `connect-mongo`
- IndexedDB for offline queue/cache
- Vercel deployment

## Requirements covered
- Login/logout/current session/protected APIs
- 10-minute server-side inactivity expiry
- Initial ATM inventory: 2000x4, 500x40, 200x20, 100x30, 50x10
- Dynamic bounded cash-distribution algorithm
- Multiple denominations when possible
- Minimal notes as a secondary objective
- Inventory preservation / avoids exhausting denominations where alternatives exist
- Transaction history + pagination
- MongoDB transaction for withdrawal consistency
- Offline local inventory + queued withdrawals
- Automatic synchronization
- `syncId` idempotency
- Conflict/failure states
- Responsive dashboard

## Important deployment note
MongoDB transactions require a replica set. MongoDB Atlas is the easiest deployment choice. The frontend can be deployed to Vercel. If frontend and API are on different sites, configure CORS and cookies for cross-site requests (`credentials: true`, `SameSite=None`, `Secure=true`).

## Local setup
### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Create a user with:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@example.com","password":"Password123!"}'
```

Then open the Vite URL and log in.

## API
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/atm/inventory`
- `POST /api/atm/withdraw`
- `POST /api/atm/sync`
- `GET /api/transactions?page=1&limit=10`
- `GET /api/transactions/:id`
- `GET /api/health`

## Withdrawal algorithm
The ATM has only five denominations, so a bounded dynamic-programming search is practical. For each reachable amount, the algorithm keeps candidate states containing:
1. a denomination bitmask,
2. number of notes,
3. a depletion penalty based on the quantity consumed relative to inventory.

Candidates are ranked lexicographically by:
1. more distinct denominations,
2. fewer total notes,
3. lower depletion penalty.

This means the implementation satisfies the task's preference for multiple denominations without sacrificing exactness. Because the maximum inventory value is only ₹35,500, DP by amount is comfortably bounded.

## Concurrency
Withdrawals run inside a MongoDB transaction. The authoritative inventory is read and updated within the transaction, then the transaction record is inserted before commit. Two simultaneous withdrawals therefore cannot both commit against the same inventory state.

## Offline model
IndexedDB stores the latest known inventory and pending withdrawal commands. The browser never overwrites the server with stale inventory. On reconnection, each pending command is sent with its unique `syncId`; the server re-validates it against authoritative inventory. A stale/invalid withdrawal becomes `CONFLICT` or `FAILED` rather than changing MongoDB incorrectly.

## Security
- Passwords are hashed with bcrypt.
- Authentication is an HTTP-only cookie session.
- No authentication token is stored in localStorage/sessionStorage.
- Production cookies use `Secure` and `SameSite=None` when frontend/API are cross-site.
- Helmet, CORS, validation, rate limiting and parameterized Mongoose queries are used.
- Secrets belong in environment variables.
