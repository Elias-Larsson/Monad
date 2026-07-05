package workflow

import (
	"context"
	"monad/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

func GetWorkflowRunSnapshot(ctx context.Context, pool *pgxpool.Pool, workflowRunID string) (models.WorkflowRunLiveUpdate, error) {
	var run models.WorkflowRunResponse
	err := pool.QueryRow(
		ctx,
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
		workflowRunID,
	).Scan(
		&run.ID,
		&run.WorkflowID,
		&run.Status,
		&run.CreatedAt,
		&run.CompletedAt,
	)
	if err != nil {
		return models.WorkflowRunLiveUpdate{}, err
	}

	return buildWorkflowRunSnapshot(ctx, pool, run)
}

func GetWorkflowRunSnapshotForUser(ctx context.Context, pool *pgxpool.Pool, userID string, workflowRunID string) (models.WorkflowRunLiveUpdate, error) {
	var run models.WorkflowRunResponse
	err := pool.QueryRow(
		ctx,
		`
		SELECT
			workflow_runs.id,
			workflow_runs.workflow_id,
			workflow_runs.status,
			workflow_runs.created_at,
			workflow_runs.completed_at
		FROM workflow_runs
		JOIN workflows ON workflows.id = workflow_runs.workflow_id
		WHERE workflow_runs.id = $1
			AND workflows.user_id = $2
		`,
		workflowRunID,
		userID,
	).Scan(
		&run.ID,
		&run.WorkflowID,
		&run.Status,
		&run.CreatedAt,
		&run.CompletedAt,
	)
	if err != nil {
		return models.WorkflowRunLiveUpdate{}, err
	}

	return buildWorkflowRunSnapshot(ctx, pool, run)
}

func buildWorkflowRunSnapshot(ctx context.Context, pool *pgxpool.Pool, run models.WorkflowRunResponse) (models.WorkflowRunLiveUpdate, error) {
	rows, err := pool.Query(
		ctx,
		`
		SELECT
			id,
			workflow_run_id,
			COALESCE(workflow_step_id, ''),
			COALESCE(step_order, 0),
			task_type,
			status,
			COALESCE(payload, '{}'::jsonb),
			COALESCE(output, '{}'::jsonb),
			retry_count,
			created_at,
			completed_at
		FROM tasks
		WHERE workflow_run_id = $1
		ORDER BY COALESCE(step_order, 0) ASC, created_at ASC
		`,
		run.ID,
	)
	if err != nil {
		return models.WorkflowRunLiveUpdate{}, err
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
			return models.WorkflowRunLiveUpdate{}, err
		}

		tasks = append(tasks, task)
	}
	if err := rows.Err(); err != nil {
		return models.WorkflowRunLiveUpdate{}, err
	}

	return models.WorkflowRunLiveUpdate{
		Type:          "workflow_run_updated",
		WorkflowRunID: run.ID,
		Run:           run,
		Tasks:         tasks,
	}, nil
}
