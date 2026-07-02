package handlers

import (
	"context"
	"encoding/json"
	"monad/internal/queue"
	"monad/models"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func WorkflowRun(c fiber.Ctx, pool *pgxpool.Pool) error {
	var r struct {
		WorkflowID string `json:"workflow_id"`
	}

	if err := json.Unmarshal(c.Body(), &r); err != nil {
		return c.Status(fiber.StatusBadRequest).
			SendString(err.Error())
	}

	if r.WorkflowID == "" {
		return c.Status(fiber.StatusBadRequest).
			SendString("workflow_id is required")
	}

	runID := uuid.New().String()

	ctx := context.Background()
	var workflowExists bool
	err := pool.QueryRow(
		ctx,
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

	rows, err := pool.Query(
		ctx,
		`
		SELECT
			id,
			step_order,
			task_type,
			COALESCE(payload, '{}'::jsonb)
		FROM workflow_steps
		WHERE workflow_id = $1
		ORDER BY step_order ASC
		`,
		r.WorkflowID,
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).
			SendString(err.Error())
	}
	defer rows.Close()

	type workflowStep struct {
		ID        string
		StepOrder int
		TaskType  string
		Payload   json.RawMessage
	}

	steps := []workflowStep{}
	for rows.Next() {
		var step workflowStep
		if err := rows.Scan(
			&step.ID,
			&step.StepOrder,
			&step.TaskType,
			&step.Payload,
		); err != nil {
			return c.Status(fiber.StatusInternalServerError).
				SendString(err.Error())
		}

		steps = append(steps, step)
	}
	if err := rows.Err(); err != nil {
		return c.Status(fiber.StatusInternalServerError).
			SendString(err.Error())
	}

	if len(steps) == 0 {
		return c.Status(fiber.StatusBadRequest).
			SendString("workflow has no steps")
	}

	tx, err := pool.Begin(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).
			SendString(err.Error())
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(
		ctx,
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

	taskIDs := make([]string, 0, len(steps))
	for _, step := range steps {
		taskID := uuid.New().String()
		taskIDs = append(taskIDs, taskID)

		var dbPayload any
		if len(step.Payload) > 0 {
			dbPayload = string(step.Payload)
		}

		_, err = tx.Exec(
			ctx,
			`
			INSERT INTO tasks (
				id,
				workflow_run_id,
				workflow_step_id,
				step_order,
				task_type,
				status,
				payload
			)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
			`,
			taskID,
			runID,
			step.ID,
			step.StepOrder,
			step.TaskType,
			"PENDING",
			dbPayload,
		)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).
				SendString(err.Error())
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return c.Status(fiber.StatusInternalServerError).
			SendString(err.Error())
	}

	firstStep := steps[0]
	msg := models.TaskMessage{
		TaskID:         taskIDs[0],
		WorkflowRunID:  runID,
		WorkflowStepID: firstStep.ID,
		StepOrder:      firstStep.StepOrder,
		TaskType:       firstStep.TaskType,
		Payload:        firstStep.Payload,
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
		"task_id":         taskIDs[0],
		"task_ids":        taskIDs,
		"status":          "PENDING",
	})
}

func GetWorkflowRuns(c fiber.Ctx, pool *pgxpool.Pool) error {
	rows, err := pool.Query(
		context.Background(),
		`
		SELECT
			id,
			workflow_id,
			status,
			created_at,
			completed_at
		FROM workflow_runs
		ORDER BY created_at DESC
		`,
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}
	defer rows.Close()

	runs := []models.WorkflowRunResponse{}
	for rows.Next() {
		var run models.WorkflowRunResponse
		if err := rows.Scan(
			&run.ID,
			&run.WorkflowID,
			&run.Status,
			&run.CreatedAt,
			&run.CompletedAt,
		); err != nil {
			return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
		}

		runs = append(runs, run)
	}

	if err := rows.Err(); err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.JSON(runs)
}

func GetWorkflowRun(c fiber.Ctx, pool *pgxpool.Pool) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).SendString("workflow run id is required")
	}

	var run models.WorkflowRunResponse
	err := pool.QueryRow(
		context.Background(),
		`
		SELECT
			id,
			workflow_id,
			status,
			created_at,
			completed_at
		FROM workflow_runs
		WHERE id = $1
		`,
		id,
	).Scan(
		&run.ID,
		&run.WorkflowID,
		&run.Status,
		&run.CreatedAt,
		&run.CompletedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return c.Status(fiber.StatusNotFound).SendString("workflow run not found")
		}
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.JSON(run)
}
