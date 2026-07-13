# Monad

Monad is a small workflow orchestration system built to explore asynchronous execution, service communication, persistent workflow state, and real-time updates.

Users can create reusable multi-step workflow blueprints, start workflow runs, and inspect each task's status, input, and output from a Next.js dashboard. The Fiber API stores state in PostgreSQL and publishes work to RabbitMQ. Separate Go workers consume those messages, execute tasks, and report the results back to PostgreSQL.

Monad is intentionally smaller than systems such as Temporal, Airflow, or n8n. It is a portfolio project focused on making the core architecture understandable and functional without hiding it behind a large orchestration framework.

## Features

- User registration and login with bcrypt password hashing and JWT authentication
- HTTP-only authentication cookies and Bearer token support
- User-scoped workflows, runs, and task history
- Visual workflow builder with task-specific form controls
- Sequential multi-step workflow execution
- Typed references to output from the preceding task
- RabbitMQ-backed asynchronous task delivery
- Separate API and worker binaries written in Go
- Configurable worker concurrency using goroutines
- PostgreSQL-backed workflow and task state
- Live workflow-run updates over WebSockets
- Persistent run history with task inputs and outputs
- Docker Compose environment for the complete application

## Architecture

```mermaid
flowchart LR
    Browser[Browser] --> Frontend[Next.js frontend]
    Frontend --> API[Fiber API]
    API --> Postgres[(PostgreSQL)]
    API --> RabbitMQ[RabbitMQ]
    RabbitMQ --> Workers[Go workers]
    Workers --> Postgres
    Postgres -- LISTEN / NOTIFY --> API
    API -- WebSocket updates --> Frontend
```

PostgreSQL is the source of truth. RabbitMQ transports executable task messages, but it does not replace persistent workflow state. This allows Monad to retain run history, recover task information after messages are acknowledged, and show current state to the frontend.

## Execution Flow

1. A user creates a workflow containing one or more ordered steps.
2. The API stores the workflow and its step definitions in PostgreSQL.
3. Starting the workflow creates a workflow run and one task row per step.
4. The API publishes the first task as JSON to RabbitMQ.
5. A worker consumes the task and changes its status to `RUNNING`.
6. The worker executes the task and stores its output as `COMPLETED` or `FAILED`.
7. If another step exists, the worker resolves references to the previous output and publishes the next task.
8. When no tasks remain, the workflow run becomes `COMPLETED`.
9. PostgreSQL notifications trigger a fresh run snapshot that is broadcast to the frontend over WebSockets.

### Workflow Steps And Tasks

A **workflow step** belongs to the reusable blueprint. A **task** is the executable instance created from that step for a specific workflow run.

```text
Workflow blueprint
└── Step 1: HTTP request

Workflow run A
└── Task 1: HTTP request (COMPLETED)

Workflow run B
└── Task 1: HTTP request (RUNNING)
```

The same workflow step can therefore produce many task executions over time.

## Supported Task Types

| Task type | Purpose | Example output |
| --- | --- | --- |
| `print-message` | Writes a message to the worker log | `{ "message": "hello" }` |
| `wait` | Pauses execution for a number of seconds | `{ "waited_seconds": 3 }` |
| `http-request` | Sends an HTTP request and captures its response | `{ "status_code": 200, "headers": {}, "body": {} }` |
| `json-transform` | Extracts and reshapes JSON values using dot paths | `{ "name": "Ada" }` |

HTTP responses are limited to 1 MiB and requests time out after 15 seconds.

## Chaining Task Output

A later step can use the output produced by the task immediately before it. The frontend exposes this as a **Fixed value / Previous step** control and generates the reference internally.

For example, an HTTP request returns:

```json
{
  "status_code": 200,
  "body": {
    "title": "Learn Monad"
  }
}
```

The following print-message step can reference `body.title`:

```json
{
  "message": {
    "$previous": "body.title"
  }
}
```

Before the task is queued, the worker resolves the marker and persists the concrete payload:

```json
{
  "message": "Learn Monad"
}
```

References preserve JSON types, so strings, numbers, booleans, arrays, and objects can move between compatible task inputs.

## Tech Stack

### Backend

- Go 1.25
- Fiber v3
- pgx and pgxpool
- PostgreSQL 16
- RabbitMQ
- goroutines and worker pools
- JWT and bcrypt
- PostgreSQL `LISTEN` / `NOTIFY`
- WebSockets

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Axios
- Simple Icons
- Bun

### Infrastructure

- Docker
- Docker Compose

## Project Structure

```text
.
├── docker-compose.yml
├── monad/                         # Next.js frontend
│   ├── app/                       # Pages and layouts
│   ├── components/                # Forms, workflow views, and shared UI
│   ├── constants/                 # Navigation, tasks, and homepage content
│   ├── lib/                       # API and realtime clients
│   └── types/                     # Frontend domain types
└── server/                        # Go backend
    ├── cmd/
    │   ├── api/                   # Fiber API binary
    │   └── worker/                # RabbitMQ worker binary
    ├── internal/
    │   ├── api/                   # Route registration
    │   ├── auth/                  # JWT and password helpers
    │   ├── handlers/              # HTTP and WebSocket handlers
    │   ├── queue/                 # RabbitMQ publisher and consumer
    │   ├── realtime/              # PostgreSQL listener and WebSocket hub
    │   ├── tasks/                 # Task executors
    │   └── workflow/              # Database and workflow state helpers
    └── models/                    # Shared backend models
```

## Data Model

- `users` stores accounts and password hashes.
- `workflows` stores user-owned workflow blueprints.
- `workflow_steps` stores ordered task definitions for each workflow.
- `workflow_runs` stores individual executions of a workflow.
- `tasks` stores the executable task instances, payloads, outputs, statuses, and timestamps for each run.

Task and run statuses are:

```text
PENDING -> RUNNING -> COMPLETED
                   -> FAILED
```

## Getting Started With Docker

### Prerequisites

- Docker Engine
- Docker Compose

### 1. Configure Authentication

Create `server/.env.local`:

```env
JWT_SECRET=replace-with-a-long-random-secret
```

You can generate a suitable development secret with:

```bash
openssl rand -hex 32
```

Environment files are ignored by Git.

### 2. Start The Application

From the repository root:

```bash
docker compose up --build
```

The services become available at:

| Service | Address |
| --- | --- |
| Frontend | `http://localhost:3010` |
| Fiber API | `http://localhost:3000` |
| API health check | `http://localhost:3000/health` |
| RabbitMQ management | `http://localhost:15672` |
| PostgreSQL | `localhost:5433` |

RabbitMQ uses `guest` / `guest` in the local Compose environment.

Run the stack in the background with:

```bash
docker compose up -d --build
```

Inspect logs with:

```bash
docker compose logs -f api worker
```

Stop the application without deleting database data:

```bash
docker compose down
```

To also remove the PostgreSQL volume and all stored Monad data:

```bash
docker compose down -v
```

## Local Development

Start PostgreSQL and RabbitMQ:

```bash
docker compose up -d postgres rabbitmq
```

Run the API:

```bash
cd server
JWT_SECRET=development-secret go run ./cmd/api
```

Run the worker in another terminal:

```bash
cd server
WORKER_CONCURRENCY=2 go run ./cmd/worker
```

Run the frontend in a third terminal:

```bash
cd monad
bun install
bun run dev
```

The local defaults connect Go to PostgreSQL on port `5433`, RabbitMQ on port `5672`, and the frontend to the API on port `3000`.

## Environment Variables

| Variable | Used by | Default / purpose |
| --- | --- | --- |
| `JWT_SECRET` | API | Required signing secret for authentication tokens |
| `DATABASE_URL` | API, worker | Local PostgreSQL connection on port `5433` |
| `RABBITMQ_URL` | API, worker | `amqp://guest:guest@localhost:5672/` |
| `RABBITMQ_QUEUE` | API, worker | `tasks` |
| `WORKER_CONCURRENCY` | Worker | `1` |
| `PORT` | API, frontend | API defaults to `3000`; frontend image uses `3010` |
| `INTERNAL_API_URL` | Frontend server | Internal destination used by the `/api` rewrite |
| `NEXT_PUBLIC_API_URL` | Frontend | Optional API URL for server-side requests |
| `NEXT_PUBLIC_WS_URL` | Frontend | Optional explicit WebSocket base URL |

## API Routes

### Public

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Check API and database availability |
| `POST` | `/auth/register` | Create an account |
| `POST` | `/auth/login` | Authenticate and set the access cookie |

### Authenticated

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/workflows` | Create a workflow and its steps |
| `GET` | `/workflows` | List the current user's workflows |
| `GET` | `/workflows/:id` | Get one workflow and its steps |
| `DELETE` | `/workflows/:id` | Delete a workflow and its execution history |
| `POST` | `/workflows/run` | Start a workflow run |
| `GET` | `/workflows/run` | List workflow runs |
| `GET` | `/workflows/run/:id` | Get one workflow run |
| `GET` | `/tasks` | List tasks |
| `GET` | `/tasks/:id` | Get one task |
| `GET` | `/ws/workflow-runs/:id` | Stream live updates for a workflow run |

Protected routes accept either the HTTP-only `access_token` cookie or an `Authorization: Bearer <token>` header.

## API Example

Register and log in while saving the authentication cookie:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "developer@example.com",
    "password": "password123"
  }'

curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -c monad.cookies \
  -d '{
    "email": "developer@example.com",
    "password": "password123"
  }'
```

Create a chained workflow:

```bash
curl -X POST http://localhost:3000/workflows \
  -H "Content-Type: application/json" \
  -b monad.cookies \
  -d '{
    "name": "Fetch and print todo",
    "steps": [
      {
        "step_order": 1,
        "task_type": "http-request",
        "payload": {
          "method": "GET",
          "url": "https://jsonplaceholder.typicode.com/todos/1",
          "headers": {},
          "body": null
        }
      },
      {
        "step_order": 2,
        "task_type": "print-message",
        "payload": {
          "message": {
            "$previous": "body.title"
          }
        }
      }
    ]
  }'
```

Copy the returned workflow `id`, then start a run:

```bash
curl -X POST http://localhost:3000/workflows/run \
  -H "Content-Type: application/json" \
  -b monad.cookies \
  -d '{
    "workflow_id": "WORKFLOW_ID"
  }'
```

Inspect runs and tasks:

```bash
curl -b monad.cookies http://localhost:3000/workflows/run
curl -b monad.cookies http://localhost:3000/tasks
```

## Verification

Run backend tests:

```bash
cd server
go test ./...
```

Check the frontend:

```bash
cd monad
bunx tsc --noEmit
bun run build
```

## Current Scope

Monad currently supports sequential workflows where each step runs after the previous task completes. It does not yet include DAG branches, retries, schedules, dead-letter queues, role-based access control, or production-grade distributed tracing.

The HTTP request task accepts user-provided URLs and is intended for controlled development environments. A public deployment should add outbound network restrictions and SSRF protection.

## License

Monad is available under the [MIT License](LICENSE).

## Author

Built by Elias Larsson.

- [Portfolio](https://eliaslarsson.dev)
- [GitHub](https://github.com/Elias-Larsson)
- [LinkedIn](https://www.linkedin.com/in/elias-h-larsson/)
