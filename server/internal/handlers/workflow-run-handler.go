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
		TaskType   string          `json:"task_type"`
		Payload    json.RawMessage `json:"payload,omitempty"`
	}

	if err := json.Unmarshal(c.Body(), &r); err != nil {
		return c.Status(fiber.StatusBadRequest).
			SendString(err.Error())
	}

	if r.WorkflowID == "" {
		return c.Status(fiber.StatusBadRequest).
			SendString("workflow_id is required")
	}
	if r.TaskType == "" {
		return c.Status(fiber.StatusBadRequest).
			SendString("task_type is required")
	}

	runID := uuid.New().String()
	taskID := uuid.New().String()

	var workflowExists bool
	err := pool.QueryRow(
		context.Background(),
		`
		SELECT EXISTS (
			SELECT 1
			FROM workflows
			WHERE id = $1
		)
		`,
		r.WorkflowID,
	).Scan(&workflowExists)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).
			SendString(err.Error())
	}
	if !workflowExists {
		return c.Status(fiber.StatusNotFound).
			SendString("workflow not found")
	}

	_, err = pool.Exec(
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

	var dbPayload any
	if len(r.Payload) > 0 {
		dbPayload = string(r.Payload)
	}

	_, err = pool.Exec(
		context.Background(),
		`
		INSERT INTO tasks (
			id,
			workflow_run_id,
			task_type,
			status,
			payload
		)
		VALUES ($1, $2, $3, $4, $5)
		`,
		taskID,
		runID,
		r.TaskType,
		"PENDING",
		dbPayload,
	)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).
			SendString(err.Error())
	}

	msg := map[string]any{
		"task_id":         taskID,
		"workflow_run_id": runID,
		"task_type":       r.TaskType,
		"payload":         r.Payload,
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
		"task_id":         taskID,
		"status":          "PENDING",
	})
}
