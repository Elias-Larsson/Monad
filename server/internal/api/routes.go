package routes

import (
	"context"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/jackc/pgx/v5/pgxpool"
)

func Setup(app *fiber.App, pool *pgxpool.Pool) {
	api := app.Group("/api")

	api.Get("/health", func(c fiber.Ctx) error {
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()
		if err := pool.Ping(ctx); err != nil {
			return c.Status(fiber.StatusServiceUnavailable).SendString("db unavailable")
		}
		return c.SendStatus(fiber.StatusOK)
	})
}
