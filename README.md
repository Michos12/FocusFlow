# FocusFlow

A task manager that keeps your work split between pending and completed. Each
user signs up, logs in, and sees only their own tasks.

Full-stack TypeScript: a React + Vite frontend styled with Tailwind, an Express
REST API, and MySQL running in Docker. Authentication is JWT-based with bcrypt
password hashing.

## Stack

| Layer    | Technology                                             |
| -------- | ------------------------------------------------------ |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Router  |
| Backend  | Node.js, Express 5, TypeScript                          |
| Database | MySQL 8 (Docker)                                       |
| Auth     | JSON Web Tokens, bcrypt                                |

## Requirements

- Node.js 18 or newer
- Docker Desktop (for the MySQL container)

## Getting started

The app is three pieces: the database, the API, and the web client. Start them
in that order.

### 1. Start the database

From the repository root:

```bash
docker compose up -d
```

The container publishes MySQL on **host port 3307** (port 3306 inside the
container) and creates the `todo_app` database. The tables in
`serverSide/src/database/schema.sql` are created automatically the first time
the volume is initialised, so there is nothing to import by hand.

### 2. Configure and run the API

```bash
cd serverSide
npm install
cp .env.example .env
```

Open `.env` and set `JWT_SECRET`. Generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

The server refuses to start without it, on purpose — there is no insecure
default. Then:

```bash
npm start
```

The API listens on http://localhost:4000. `npm start` compiles TypeScript to
`dist/` first, then runs it under nodemon.

### 3. Run the web client

In a second terminal:

```bash
cd clientSide
npm install
npm start
```

Open http://localhost:5173 and register an account.

## Environment variables

All of these live in `serverSide/.env`. See `serverSide/.env.example`.

| Variable         | Purpose                                    | Example     |
| ---------------- | ------------------------------------------ | ----------- |
| `DB_HOST`        | MySQL host                                 | `127.0.0.1` |
| `DB_PORT`        | Host port from `docker-compose.yml`        | `3307`      |
| `DB_USER`        | MySQL user                                 | `root`      |
| `DB_PASSWORD`    | MySQL password                             | `root123`   |
| `DB_NAME`        | Database name                              | `todo_app`  |
| `JWT_SECRET`     | Secret used to sign tokens. **Required.**  | —           |
| `JWT_EXPIRES_IN` | Token lifetime                             | `2h`        |

`.env` is gitignored and must never be committed.

## Scripts

**serverSide**

| Command         | What it does                                       |
| --------------- | -------------------------------------------------- |
| `npm start`     | Compiles to `dist/`, then runs it with nodemon      |
| `npm run dev`   | Runs the TypeScript sources directly with reloading |
| `npm run build` | Compiles to `dist/`                                 |

**clientSide**

| Command           | What it does                       |
| ----------------- | ---------------------------------- |
| `npm start`       | Vite dev server on port 5173       |
| `npm run dev`     | Same as `npm start`                |
| `npm run build`   | Type-checks and builds to `dist/`  |
| `npm run lint`    | Runs ESLint                        |
| `npm run preview` | Serves the production build        |

## API

Base URL: `http://localhost:4000/api`

### Auth

| Method   | Endpoint         | Auth | Description                     |
| -------- | ---------------- | ---- | ------------------------------- |
| `POST`   | `/auth/register` | No   | Create an account               |
| `POST`   | `/auth/login`    | No   | Log in, returns a JWT           |
| `GET`    | `/auth/me`       | Yes  | The current user's profile      |
| `PATCH`  | `/auth/me`       | Yes  | Update your own email/password  |
| `DELETE` | `/auth/me`       | Yes  | Delete your own account         |

### Tasks

All task routes require authentication and act only on the caller's own tasks.

| Method   | Endpoint                    | Description                  |
| -------- | --------------------------- | ---------------------------- |
| `GET`    | `/todos`                    | List your tasks              |
| `POST`   | `/todos`                    | Create a task                |
| `PATCH`  | `/todos/:id/status`         | Mark complete or incomplete  |
| `PATCH`  | `/todos/:id/description`    | Change the description       |
| `DELETE` | `/todos/:id`                | Delete a task                |

Send the token as a header: `Authorization: Bearer <token>`. Requests without a
valid token get `401`; requests for a task belonging to someone else get `404`.

## Project structure

```
FocusFlow/
├── docker-compose.yml        MySQL container and schema bootstrap
├── clientSide/
│   └── src/
│       ├── context/          Auth state and session handling
│       ├── interface/        Shared TypeScript types
│       ├── pages/            Login, register, dashboard
│       └── services/         API client
└── serverSide/
    └── src/
        ├── config/           Validated environment variables
        ├── controllers/      Request handling and validation
        ├── database/         Connection pool and schema.sql
        ├── interface/        Shared TypeScript types
        ├── middleware/       JWT authentication
        ├── routes/           Route definitions
        └── services/         Database queries and business logic
```

## Troubleshooting

**`ECONNREFUSED 127.0.0.1:3306`** — `DB_PORT` must be `3307`. The `3307:3306`
mapping in `docker-compose.yml` means 3306 is the port *inside* the container;
3307 is the one reachable from your machine.

**`JWT_SECRET is not defined`** — copy `.env.example` to `.env` and set a value.

**Tables are missing** — the schema only runs when the volume is created. If you
have an older volume from before, recreate it (this deletes all stored data):

```bash
docker compose down -v && docker compose up -d
```

**Changing `docker-compose.yml` did nothing** — same reason. Recreate the
volume with the command above.
