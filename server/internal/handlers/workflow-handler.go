package handlers

import (
	"context"
	"encoding/json"

	"monad/models"

	"github.com/gofiber/fiber/v3"
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
	var workflow models.Workflow
	if err := json.Unmarshal(c.Body(), &workflow); err != nil {
		return c.Status(fiber.StatusBadRequest).
			SendString(err.Error())
	}

	if workflow.ID == "" {
		return c.Status(fiber.StatusBadRequest).SendString("workflow id is required")
	}
	if workflow.Name == "" {
		return c.Status(fiber.StatusBadRequest).SendString("workflow name is required")
	}

	tag, err := pool.Exec(
		context.Background(),
		`
		INSERT INTO workflows (
			id,
			name
		)
		VALUES ($1, $2)
		ON CONFLICT (id) DO NOTHING
		`,
		workflow.ID,
		workflow.Name,
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).
			SendString(err.Error())
	}
	if tag.RowsAffected() == 0 {
		return c.Status(fiber.StatusConflict).
			SendString("workflow already exists")
	}

	return c.Status(fiber.StatusCreated).JSON(workflow)
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
			return c.Status(fiber.StatusNotFound).SendString("task not found")
		}
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	return c.JSON(workflow)
}
