package workflow

import (
	"context"
	"encoding/json"
	"log"
	"monad/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

func notifyWorkflowRunUpdated(ctx context.Context, pool *pgxpool.Pool, workflowRunID string) {
	if workflowRunID == "" {
		return
	}

	payload, err := json.Marshal(models.WorkflowRunUpdatedNotification{
		Type:          "workflow_run_updated",
		WorkflowRunID: workflowRunID,
	})
	if err != nil {
		log.Printf("failed to marshal workflow run update notification: %v", err)
		return
	}

	_, err = pool.Exec(
		ctx,
		`
		SELECT pg_notify($1, $2)
		`,
		models.WorkflowRunEventsChannel,
		string(payload),
	)
	if err != nil {
		log.Printf("failed to notify workflow run update: %v", err)
	}
}
