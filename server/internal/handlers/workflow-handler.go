package handlers

import (
	"context"
	"encoding/json"

	"monad/internal/queue"
	"monad/internal/workflow"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

func WorkflowRun(c fiber.Ctx, pool *pgxpool.Pool) error {
	var r workflow.WorkflowRun

	// Parse request
	if err := json.Unmarshal(c.Body(), &r); err != nil {
		return c.Status(fiber.StatusBadRequest).
			SendString(err.Error())
	}

	// Generate IDs
	runID := uuid.New().String()

	// Insert workflow run
	_, err := pool.Exec(
		context.Background(),
		`
		INSERT INTO workflow_runs (
			id,
			workflow_id,
			status
		)
		VALUES ($1, $2, $3)
		`,
		runID,
		r.WorkflowID,
		"PENDING",
	)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).
			SendString(err.Error())
	}

	// Publish message to RabbitMQ
	msg := map[string]any{
		"workflow_run_id": runID,
		"workflow_id":     r.WorkflowID,
		"status":          "PENDING",
	}

	body, _ := json.Marshal(msg)

	err := queue.Publish(body)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).
			SendString(err.Error())
	}

	return c.JSON(fiber.Map{
		"workflow_run_id": runID,
		"status":          "started",
	})
}