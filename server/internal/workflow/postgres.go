package workflow

import (
	"context"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

const defaultConnString = "postgres://postgres:postgres@localhost:5433/workflow?sslmode=disable"

func ConnString() string {
	if value := os.Getenv("DATABASE_URL"); value != "" {
		return value
	}
	return defaultConnString
}

func NewPostgres(ctx context.Context) (*pgxpool.Pool, error) {
	pool, err := pgxpool.New(ctx, ConnString())
	if err != nil {
		return nil, err
	}
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, err
	}
	return pool, nil
}

func EnsureSchema(ctx context.Context, pool *pgxpool.Pool) error {
	statements := []string{
		`
		CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			email TEXT UNIQUE NOT NULL,
			password_hash TEXT NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)
		`,
		`
		CREATE TABLE IF NOT EXISTS workflows (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL,
			name TEXT NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)
		`,
		`
		CREATE TABLE IF NOT EXISTS workflow_runs (
			id TEXT PRIMARY KEY,
			workflow_id TEXT NOT NULL,
			status TEXT NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			completed_at TIMESTAMPTZ
		)
		`,
		`
		CREATE TABLE IF NOT EXISTS tasks (
			id TEXT PRIMARY KEY,
			workflow_run_id TEXT NOT NULL,
			workflow_step_id TEXT,
			step_order INTEGER,
			task_type TEXT NOT NULL,
			status TEXT NOT NULL,
			payload JSONB,
			output JSONB,
			retry_count INTEGER NOT NULL DEFAULT 0,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			completed_at TIMESTAMPTZ
		)

		`,
		`
		CREATE TABLE IF NOT EXISTS workflow_steps (
			id TEXT PRIMARY KEY,
			workflow_id TEXT NOT NULL,
			step_order INTEGER NOT NULL,
			task_type TEXT NOT NULL,
			payload JSONB,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)
		`,
		`
		CREATE UNIQUE INDEX IF NOT EXISTS workflow_steps_workflow_id_step_order_idx
		ON workflow_steps (workflow_id, step_order)
		`,
		`
		CREATE INDEX IF NOT EXISTS workflow_steps_workflow_id_idx
		ON workflow_steps (workflow_id)
		`,
		`
		CREATE INDEX IF NOT EXISTS tasks_workflow_run_id_step_order_idx
		ON tasks (workflow_run_id, step_order)
		`,
		`
		CREATE INDEX IF NOT EXISTS workflow_runs_workflow_id_idx
		ON workflow_runs (workflow_id)
		`,
		`
		CREATE INDEX IF NOT EXISTS workflows_user_id_idx
		ON workflows (user_id)
		`,
	}

	for _, statement := range statements {
		if _, err := pool.Exec(ctx, statement); err != nil {
			return err
		}
	}

	return nil
}
