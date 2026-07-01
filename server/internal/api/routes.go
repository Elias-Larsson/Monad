package routes

import (
	"context"
	"monad/internal/handlers"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/jackc/pgx/v5/pgxpool"
)

func Setup(app *fiber.App, pool *pgxpool.Pool) {

	app.Get("/health", func(c fiber.Ctx) error {
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()
		if err := pool.Ping(ctx); err != nil {
			return c.Status(fiber.StatusServiceUnavailable).SendString("db unavailable")
		}
		return c.SendStatus(fiber.StatusOK)
	})

	app.Post("/workflows/run", func(c fiber.Ctx) error {
		return handlers.WorkflowRun(c, pool)
	})

	app.Get("/workflow-runs", func(c fiber.Ctx) error {
		return handlers.GetWorkflowRuns(c, pool)
	})

	app.Get("/workflow-runs/:id", func(c fiber.Ctx) error {
		return handlers.GetWorkflowRun(c, pool)
	})

	app.Post("/workflows", func(c fiber.Ctx) error {
		return handlers.WorkflowCreate(c, pool)
	})

	app.Get("/workflows", func(c fiber.Ctx) error {
		return handlers.GetWorkflows(c, pool)
	})

	app.Get("/workflows/:id", func(c fiber.Ctx) error {
		return handlers.GetWorkflow(c, pool)
	})

	app.Delete("/workflows/:id", func(c fiber.Ctx) error {
		return handlers.WorkflowDelete(c, pool)
	})

	app.Get("/tasks/:id", func(c fiber.Ctx) error {
		return handlers.GetTask(c, pool)
	})

	app.Get("/tasks", func(c fiber.Ctx) error {
		return handlers.GetTasks(c, pool)
	})
}
