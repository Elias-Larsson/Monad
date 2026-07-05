package workflow

import (
	"context"
	"encoding/json"

	"monad/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func MarkTaskRunning(ctx context.Context, pool *pgxpool.Pool, taskID string) error {
	var workflowRunID string
	err := pool.QueryRow(
		ctx,
		`
		UPDATE tasks
		SET status = 'RUNNING'
		WHERE id = $1
		RETURNING workflow_run_id
		`,
		taskID,
	).Scan(&workflowRunID)
	if err != nil {
		return err
	}

	notifyWorkflowRunUpdated(ctx, pool, workflowRunID)
	return nil
}

func MarkTaskCompleted(ctx context.Context, pool *pgxpool.Pool, taskID string, output []byte) error {
	dbOutput := "{}"
	if len(output) > 0 {
		dbOutput = string(output)
	}

	var workflowRunID string
	err := pool.QueryRow(
		ctx,
		`
		UPDATE tasks
		SET status = 'COMPLETED',
		    output = $2::jsonb,
		    completed_at = NOW()
		WHERE id = $1
		RETURNING workflow_run_id
		`,
		taskID,
		dbOutput,
	).Scan(&workflowRunID)
	if err != nil {
		return err
	}

	notifyWorkflowRunUpdated(ctx, pool, workflowRunID)
	return nil
}

func MarkTaskFailed(ctx context.Context, pool *pgxpool.Pool, taskID string, errorMessage string) error {
	output, err := json.Marshal(map[string]string{
		"error": errorMessage,
	})
	if err != nil {
		return err
	}

	var workflowRunID string
	err = pool.QueryRow(
		ctx,
		`
		UPDATE tasks
		SET status = 'FAILED',
		    output = $2::jsonb,
		    completed_at = NOW()
		WHERE id = $1
		RETURNING workflow_run_id
		`,
		taskID,
		string(output),
	).Scan(&workflowRunID)
	if err != nil {
		return err
	}

	notifyWorkflowRunUpdated(ctx, pool, workflowRunID)
	return nil
}

func GetNextPendingTask(ctx context.Context, pool *pgxpool.Pool, workflowRunID string, currentStepOrder int) (models.TaskMessage, bool, error) {
	var msg models.TaskMessage

	err := pool.QueryRow(
		ctx,
		`
		SELECT
			id,
			workflow_run_id,
			COALESCE(workflow_step_id, ''),
			COALESCE(step_order, 0),
			task_type,
			COALESCE(payload, '{}'::jsonb)
		FROM tasks
		WHERE workflow_run_id = $1
		  AND status = 'PENDING'
		  AND step_order > $2
		ORDER BY step_order ASC
		LIMIT 1
		`,
		workflowRunID,
		currentStepOrder,
	).Scan(
		&msg.TaskID,
		&msg.WorkflowRunID,
		&msg.WorkflowStepID,
		&msg.StepOrder,
		&msg.TaskType,
		&msg.Payload,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return models.TaskMessage{}, false, nil
		}
		return models.TaskMessage{}, false, err
	}

	return msg, true, nil
}

func MarkWorkflowRunRunning(ctx context.Context, pool *pgxpool.Pool, workflowRunID string) error {
	tag, err := pool.Exec(
		ctx,
		`
		UPDATE workflow_runs
		SET status = 'RUNNING'
		WHERE id = $1
		`,
		workflowRunID,
	)
	if err == nil && tag.RowsAffected() > 0 {
		notifyWorkflowRunUpdated(ctx, pool, workflowRunID)
	}
	return err
}

func MarkWorkflowRunCompleted(ctx context.Context, pool *pgxpool.Pool, workflowRunID string) error {
	tag, err := pool.Exec(
		ctx,
		`
		UPDATE workflow_runs
		SET status = 'COMPLETED',
		    completed_at = NOW()
		WHERE id = $1
		`,
		workflowRunID,
	)
	if err == nil && tag.RowsAffected() > 0 {
		notifyWorkflowRunUpdated(ctx, pool, workflowRunID)
	}
	return err
}

func MarkWorkflowRunFailed(ctx context.Context, pool *pgxpool.Pool, workflowRunID string) error {
	tag, err := pool.Exec(
		ctx,
		`
		UPDATE workflow_runs
		SET status = 'FAILED',
		    completed_at = NOW()
		WHERE id = $1
		`,
		workflowRunID,
	)
	if err == nil && tag.RowsAffected() > 0 {
		notifyWorkflowRunUpdated(ctx, pool, workflowRunID)
	}
	return err
}
