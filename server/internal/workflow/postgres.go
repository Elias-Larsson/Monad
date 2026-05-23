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
