# 🎬 Book My Ticket

A simplified cinema seat booking platform built as part of the **Chai Code Hackathon**. Users can register, log in, and book seats for a movie session. Only authenticated users can book seats, and duplicate bookings are prevented at the database level.

---

## ✨ Features

- **User Registration** — sign up with name, email, and password (bcrypt hashed)
- **User Login** — returns a signed JWT access token
- **Protected Booking** — only logged-in users can book a seat
- **Duplicate Prevention** — row-level locking (`SELECT ... FOR UPDATE`) inside a transaction prevents double-bookings
- **Booking linked to user** — each booked seat stores the `user_id`
- **Mock fallback** — runs in-memory if the database is unavailable
- **Frontend included** — single-page cinema UI with auth gate and interactive seat grid

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express 5 |
| Database | PostgreSQL (via `pg` pool) |
| Auth | JWT (`jsonwebtoken`) |
| Password hashing | `bcrypt` |
| Validation | `joi` |
| Containerisation | Docker + Docker Compose |

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 15+ (or use Docker — see below)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/book-my-ticket.git
cd book-my-ticket
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp env.example .env
```

Open `.env` and set your values:

```env
PORT=5000

DB_HOST=127.0.0.1
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=sql_class_2_db

JWT_ACCESS_SECRET=your_strong_secret_here
JWT_ACCESS_EXPIRES_IN=15m
```

> **Tip:** Generate a strong secret with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 4. Run the dev server

```bash
npm run dev
```

The server starts on `http://localhost:5000`. The frontend is served at `/`.

---

## 🐳 Docker Setup

Run the entire stack (app + PostgreSQL) with one command:

```bash
docker compose up --build
```

> Update `JWT_ACCESS_SECRET` in `docker-compose.yml` before deploying to production.

The app will be available at `http://localhost:8080`.

---

## 📡 API Endpoints

### Auth

#### `POST /api/auth/register`
Register a new user.

**Request body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Success response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": { "id": 1, "name": "John Doe", "email": "john@example.com" }
}
```

---

#### `POST /api/auth/login`
Login and receive a JWT access token.

**Request body:**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Success response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": 1, "name": "John Doe", "email": "john@example.com" },
    "accessToken": "<jwt>"
  }
}
```

---

### Seats

#### `GET /seats`
Get all seats with their booking status. Public — no auth required.

**Response:**
```json
[
  { "id": 1, "isbooked": 0, "user_id": null },
  { "id": 2, "isbooked": 1, "user_id": 3 }
]
```

---

#### `PUT /seats/book/:id` 🔒 Protected
Book a seat by ID. Requires a valid JWT in the `Authorization` header.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Success response (200):**
```json
{ "message": "Seat booked successfully!" }
```

**Error — seat already booked (400):**
```json
{ "error": "Seat already booked" }
```

**Error — no token (401):**
```json
{ "success": false, "message": "Authentication required" }
```

---

## 🗂️ Project Structure

```
book-my-ticket/
├── index.mjs                    # App entry point, routes, error handler
├── index.html                   # Frontend (single-page cinema UI)
├── docker-compose.yml
├── env.example
└── src/
    ├── module/
    │   └── auth/
    │       ├── auth.route.js    # POST /api/auth/register + /login
    │       ├── auth.controller.js
    │       ├── auth.service.js  # Business logic (bcrypt, duplicate check)
    │       ├── auth.model.js    # DB queries (with mock fallback)
    │       └── auth.schema.js   # Joi validation schemas
    └── common/
        ├── config/
        │   ├── db.config.mjs    # Pool + initDB (creates tables, seeds seats)
        │   └── mock-state.js    # In-memory fallback when DB is down
        ├── middleware/
        │   └── auth.middleware.js
        └── utils/
            ├── api-error.js     # AppError class with static helpers
            ├── api-response.js  # Standardised JSON response helpers
            └── jwt.utils.js     # JWT sign + verify helpers
```

---

## 🔐 Auth Flow

```
Client                          Server
  │                               │
  ├─── POST /api/auth/register ──►│  validate → hash password → INSERT users
  │◄── 201 { user } ─────────────┤
  │                               │
  ├─── POST /api/auth/login ─────►│  validate → compare hash → sign JWT
  │◄── 200 { user, accessToken } ─┤
  │                               │
  ├─── PUT /seats/book/:id ──────►│  verify Bearer token → lock row → UPDATE
  │    Authorization: Bearer jwt  │  (transaction prevents double-booking)
  │◄── 200 { message } ───────────┤
```

---

## 🧪 Validation Rules

| Field | Rule |
|---|---|
| `name` | Required, 2–100 characters |
| `email` | Required, valid email format |
| `password` | Required, 6–128 characters (register only) |
