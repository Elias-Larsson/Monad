package handlers

import (
	"context"
	"encoding/json"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type taskResponse struct {
	ID            string          `json:"id"`
	WorkflowRunID string          `json:"workflow_run_id"`
	TaskType      string          `json:"task_type"`
	Status        string          `json:"status"`
	Payload       json.RawMessage `json:"payload"`
	Output        json.RawMessage `json:"output"`
	RetryCount    int             `json:"retry_count"`
	CreatedAt     time.Time       `json:"created_at"`
	CompletedAt   *time.Time      `json:"completed_at"`
}

func GetTask(c fiber.Ctx, pool *pgxpool.Pool) error {
	id := c.Params("id")

	if id == "" {
		return c.Status(fiber.StatusBadRequest).SendString("task id is required")
	}

	var task taskResponse
	err := pool.QueryRow(
		context.Background(),
		`
		SELECT
			id,
			workflow_run_id,
			task_type,
			status,
			COALESCE(payload, '{}'::jsonb),
			COALESCE(output, '{}'::jsonb),
			retry_count,
			created_at,
			completed_at
		FROM tasks
		WHERE id = $1
		`,
		id,
	).Scan(
		&task.ID,
		&task.WorkflowRunID,
		&task.TaskType,
		&task.Status,
		&task.Payload,
		&task.Output,
		&task.RetryCount,
		&task.CreatedAt,
		&task.CompletedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return c.Status(fiber.StatusNotFound).SendString("task not found")
		}
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.JSON(task)
}

func GetTasks(c fiber.Ctx, pool *pgxpool.Pool) error {
	rows, err := pool.Query(
		context.Background(),
		`
		SELECT
			id,
			workflow_run_id,
			task_type,
			status,
			COALESCE(payload, '{}'::jsonb),
			COALESCE(output, '{}'::jsonb),
			retry_count,
			created_at,
			completed_at
		FROM tasks
		ORDER BY created_at DESC
		`,
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}
	defer rows.Close()

	tasks := []taskResponse{}
	for rows.Next() {
		var task taskResponse
		if err := rows.Scan(
			&task.ID,
			&task.WorkflowRunID,
			&task.TaskType,
			&task.Status,
			&task.Payload,
			&task.Output,
			&task.RetryCount,
			&task.CreatedAt,
			&task.CompletedAt,
		); err != nil {
			return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
		}

		tasks = append(tasks, task)
	}

	if err := rows.Err(); err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.JSON(tasks)
}
