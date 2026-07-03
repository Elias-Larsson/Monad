package routes

import (
	"monad/internal/handlers"

	"github.com/gofiber/fiber/v3"
	"github.com/jackc/pgx/v5/pgxpool"
)

func Setup(app *fiber.App, pool *pgxpool.Pool) {
	h := handlers.New(pool)

	app.Get("/health", h.Health)

	app.Post("/workflows/run", h.WorkflowRun)

	app.Get("/workflows/run", h.GetWorkflowRuns)

	app.Get("/workflows/run/:id", h.GetWorkflowRun)

	app.Post("/workflows", h.WorkflowCreate)

	app.Get("/workflows", h.GetWorkflows)

	app.Get("/workflows/:id", h.GetWorkflow)

	app.Delete("/workflows/:id", h.WorkflowDelete)

	app.Get("/tasks/:id", h.GetTask)

	app.Get("/tasks", h.GetTasks)

	app.Post("/user", h.UserCreate)
}
