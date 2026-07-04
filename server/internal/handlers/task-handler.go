package handlers

import (
	"context"
	"monad/models"

	"github.com/gofiber/fiber/v3"
	"github.com/jackc/pgx/v5"
)

func (h *Handler) GetTask(c fiber.Ctx) error {
	id := c.Params("id")

	if id == "" {
		return c.Status(fiber.StatusBadRequest).SendString("task id is required")
	}

	userID, err := requireUserID(c)
	if err != nil {
		return err
	}

	var task models.TaskResponse
	err = h.pool.QueryRow(
		context.Background(),
		`
		SELECT
			tasks.id,
			tasks.workflow_run_id,
			COALESCE(tasks.workflow_step_id, ''),
			COALESCE(tasks.step_order, 0),
			tasks.task_type,
			tasks.status,
			COALESCE(tasks.payload, '{}'::jsonb),
			COALESCE(tasks.output, '{}'::jsonb),
			tasks.retry_count,
			tasks.created_at,
			tasks.completed_at
		FROM tasks
		JOIN workflow_runs ON workflow_runs.id = tasks.workflow_run_id
		JOIN workflows ON workflows.id = workflow_runs.workflow_id
		WHERE tasks.id = $1
			AND workflows.user_id = $2
		`,
		id,
		userID,
	).Scan(
		&task.ID,
		&task.WorkflowRunID,
		&task.WorkflowStepID,
		&task.StepOrder,
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

func (h *Handler) GetTasks(c fiber.Ctx) error {
	userID, err := requireUserID(c)
	if err != nil {
		return err
	}

	rows, err := h.pool.Query(
		context.Background(),
		`
		SELECT
			tasks.id,
			tasks.workflow_run_id,
			COALESCE(tasks.workflow_step_id, ''),
			COALESCE(tasks.step_order, 0),
			tasks.task_type,
			tasks.status,
			COALESCE(tasks.payload, '{}'::jsonb),
			COALESCE(tasks.output, '{}'::jsonb),
			tasks.retry_count,
			tasks.created_at,
			tasks.completed_at
		FROM tasks
		JOIN workflow_runs ON workflow_runs.id = tasks.workflow_run_id
		JOIN workflows ON workflows.id = workflow_runs.workflow_id
		WHERE workflows.user_id = $1
		ORDER BY tasks.created_at DESC
		`,
		userID,
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}
	defer rows.Close()

	tasks := []models.TaskResponse{}
	for rows.Next() {
		var task models.TaskResponse
		if err := rows.Scan(
			&task.ID,
			&task.WorkflowRunID,
			&task.WorkflowStepID,
			&task.StepOrder,
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
