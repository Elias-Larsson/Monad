package handlers

import (
	"context"
	"encoding/json"

	"monad/internal/queue"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

func WorkflowRun(c fiber.Ctx, pool *pgxpool.Pool) error {
	var r struct {
		WorkflowID string          `json:"workflow_id"`
		Input      json.RawMessage `json:"input,omitempty"`
	}

	// Parse request
	if err := json.Unmarshal(c.Body(), &r); err != nil {
		return c.Status(fiber.StatusBadRequest).
			SendString(err.Error())
	}

	if r.WorkflowID == "" {
		return c.Status(fiber.StatusBadRequest).
			SendString("workflow_id is required")
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
	if len(r.Input) > 0 {
		msg["input"] = json.RawMessage(r.Input)
	}

	body, err := json.Marshal(msg)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).
			SendString(err.Error())
	}

	err = queue.Publish(body)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).
			SendString(err.Error())
	}

	return c.JSON(fiber.Map{
		"workflow_run_id": runID,
		"status":          "started",
	})
}
