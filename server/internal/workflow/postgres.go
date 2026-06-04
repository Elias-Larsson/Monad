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
		CREATE TABLE IF NOT EXISTS workflows (
			id TEXT PRIMARY KEY,
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
			task_type TEXT NOT NULL,
			status TEXT NOT NULL,
			payload JSONB,
			output JSONB,
			retry_count INTEGER NOT NULL DEFAULT 0,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			completed_at TIMESTAMPTZ
		)
		`,
	}

	for _, statement := range statements {
		if _, err := pool.Exec(ctx, statement); err != nil {
			return err
		}
	}

	return nil
}
