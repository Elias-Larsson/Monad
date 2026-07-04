package routes

import (
	"monad/internal/auth"
	"monad/internal/handlers"

	"github.com/gofiber/fiber/v3"
	"github.com/jackc/pgx/v5/pgxpool"
)

func Setup(app *fiber.App, pool *pgxpool.Pool) {
	h := handlers.New(pool)

	app.Get("/health", h.Health)

	app.Post("/auth/register", h.UserCreate)
	app.Post("/auth/login", h.Login)

	protected := app.Group("/", auth.Middleware)

	protected.Post("/workflows/run", h.WorkflowRun)
	protected.Get("/workflows/run", h.GetWorkflowRuns)
	protected.Get("/workflows/run/:id", h.GetWorkflowRun)

	protected.Post("/workflows", h.WorkflowCreate)
	protected.Get("/workflows", h.GetWorkflows)
	protected.Get("/workflows/:id", h.GetWorkflow)
	protected.Delete("/workflows/:id", h.WorkflowDelete)

	protected.Get("/tasks/:id", h.GetTask)
	protected.Get("/tasks", h.GetTasks)
}
