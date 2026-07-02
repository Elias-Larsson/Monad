package handlers

import (
	"context"
	"encoding/json"

	"monad/models"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func WorkflowDelete(c fiber.Ctx, pool *pgxpool.Pool) error {
	id := c.Params("id")

	if id == "" {
		return c.Status(fiber.StatusBadRequest).SendString("workflow id is required")
	}

	ctx := context.Background()
	tx, err := pool.Begin(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}
	defer tx.Rollback(ctx)

	if _, err := tx.Exec(
		ctx,
		`
		DELETE FROM tasks
		WHERE workflow_run_id IN (
			SELECT id
			FROM workflow_runs
			WHERE workflow_id = $1
		)
		`,
		id,
	); err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	if _, err := tx.Exec(
		ctx,
		`
		DELETE FROM workflow_runs
		WHERE workflow_id = $1
		`,
		id,
	); err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	if _, err := tx.Exec(
		ctx,
		`
		DELETE FROM workflow_steps
		WHERE workflow_id = $1
		`,
		id,
	); err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	tag, err := tx.Exec(
		ctx,
		`
		DELETE FROM workflows
		WHERE id = $1
		`,
		id,
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}
	if tag.RowsAffected() == 0 {
		return c.Status(fiber.StatusNotFound).SendString("workflow not found")
	}

	if err := tx.Commit(ctx); err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.SendStatus(fiber.StatusNoContent)
}

func WorkflowCreate(c fiber.Ctx, pool *pgxpool.Pool) error {
	var request models.WorkflowCreateRequest
	if err := json.Unmarshal(c.Body(), &request); err != nil {
		return c.Status(fiber.StatusBadRequest).
			SendString(err.Error())
	}

	if request.ID == "" {
		return c.Status(fiber.StatusBadRequest).SendString("workflow id is required")
	}
	if request.Name == "" {
		return c.Status(fiber.StatusBadRequest).SendString("workflow name is required")
	}
	if len(request.Steps) == 0 {
		return c.Status(fiber.StatusBadRequest).SendString("workflow steps are required")
	}

	ctx := context.Background()
	tx, err := pool.Begin(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}
	defer tx.Rollback(ctx)

	response := models.WorkflowResponse{
		Workflow: models.Workflow{
			ID:   request.ID,
			Name: request.Name,
		},
		Steps: []models.WorkflowStepResponse{},
	}

	err = tx.QueryRow(
		ctx,
		`
		INSERT INTO workflows (
			id,
			name
		)
		VALUES ($1, $2)
		ON CONFLICT (id) DO NOTHING
		RETURNING created_at
		`,
		request.ID,
		request.Name,
	).Scan(&response.CreatedAt)
	if err != nil {
		if err == pgx.ErrNoRows {
			return c.Status(fiber.StatusConflict).
				SendString("workflow already exists")
		}
		return c.Status(fiber.StatusInternalServerError).
			SendString(err.Error())
	}

	usedStepOrders := map[int]bool{}
	for index, requestStep := range request.Steps {
		if requestStep.TaskType == "" {
			return c.Status(fiber.StatusBadRequest).SendString("step task_type is required")
		}

		stepOrder := index + 1
		if requestStep.StepOrder != nil {
			stepOrder = *requestStep.StepOrder
		}
		if stepOrder <= 0 {
			return c.Status(fiber.StatusBadRequest).SendString("step_order must be greater than 0")
		}
		if usedStepOrders[stepOrder] {
			return c.Status(fiber.StatusBadRequest).SendString("step_order values must be unique")
		}
		usedStepOrders[stepOrder] = true

		step := models.WorkflowStepResponse{
			ID:         uuid.New().String(),
			WorkflowID: request.ID,
			StepOrder:  stepOrder,
			TaskType:   requestStep.TaskType,
			Payload:    requestStep.Payload,
		}

		var dbPayload any
		if len(requestStep.Payload) > 0 {
			dbPayload = string(requestStep.Payload)
		}

		err := tx.QueryRow(
			ctx,
			`
			INSERT INTO workflow_steps (
				id,
				workflow_id,
				step_order,
				task_type,
				payload
			)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING
				created_at,
				COALESCE(payload, '{}'::jsonb)
			`,
			step.ID,
			step.WorkflowID,
			step.StepOrder,
			step.TaskType,
			dbPayload,
		).Scan(
			&step.CreatedAt,
			&step.Payload,
		)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).
				SendString(err.Error())
		}

		response.Steps = append(response.Steps, step)
	}

	if err := tx.Commit(ctx); err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.Status(fiber.StatusCreated).JSON(response)
}

func GetWorkflows(c fiber.Ctx, pool *pgxpool.Pool) error {
	rows, err := pool.Query(
		context.Background(),
		`
		SELECT
			id,
			name,
			created_at
		FROM workflows
		ORDER BY created_at DESC
		`,
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}
	defer rows.Close()

	workflows := []models.WorkflowResponse{}
	for rows.Next() {
		var workflow models.WorkflowResponse
		if err := rows.Scan(
			&workflow.ID,
			&workflow.Name,
			&workflow.CreatedAt,
		); err != nil {
			return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
		}

		workflows = append(workflows, workflow)
	}

	if err := rows.Err(); err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.JSON(workflows)
}

func GetWorkflow(c fiber.Ctx, pool *pgxpool.Pool) error {
	id := c.Params("id")

	if id == "" {
		return c.Status(fiber.StatusBadRequest).SendString("workflow id is required")
	}
	var workflow models.WorkflowResponse

	err := pool.QueryRow(
		context.Background(),
		`
		SELECT
			id,
			name,
			created_at
		FROM workflows

		WHERE id = $1
		`,
		id,
	).Scan(
		&workflow.ID,
		&workflow.Name,
		&workflow.CreatedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return c.Status(fiber.StatusNotFound).SendString("workflow not found")
		}
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	steps, err := getWorkflowSteps(context.Background(), pool, id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}
	workflow.Steps = steps

	return c.JSON(workflow)
}

func getWorkflowSteps(ctx context.Context, pool *pgxpool.Pool, workflowID string) ([]models.WorkflowStepResponse, error) {
	rows, err := pool.Query(
		ctx,
		`
		SELECT
			id,
			workflow_id,
			step_order,
			task_type,
			COALESCE(payload, '{}'::jsonb),
			created_at
		FROM workflow_steps
		WHERE workflow_id = $1
		ORDER BY step_order ASC
		`,
		workflowID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	steps := []models.WorkflowStepResponse{}
	for rows.Next() {
		var step models.WorkflowStepResponse
		if err := rows.Scan(
			&step.ID,
			&step.WorkflowID,
			&step.StepOrder,
			&step.TaskType,
			&step.Payload,
			&step.CreatedAt,
		); err != nil {
			return nil, err
		}

		steps = append(steps, step)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return steps, nil
}
