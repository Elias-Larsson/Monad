package handlers

import (
	"context"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Handler struct {
	pool *pgxpool.Pool
}

func New(pool *pgxpool.Pool) *Handler {
	return &Handler{
		pool: pool,
	}
}

func (h *Handler) Health(c fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	if err := h.pool.Ping(ctx); err != nil {
		return c.Status(fiber.StatusServiceUnavailable).SendString("db unavailable")
	}

	return c.SendStatus(fiber.StatusOK)
}
