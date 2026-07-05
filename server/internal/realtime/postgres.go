package realtime

import (
	"context"
	"encoding/json"
	"log"
	"monad/internal/workflow"
	"monad/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

func ListenPostgres(ctx context.Context, pool *pgxpool.Pool, hub *Hub) error {
	conn, err := pool.Acquire(ctx)
	if err != nil {
		return err
	}
	defer conn.Release()

	if _, err := conn.Exec(ctx, "LISTEN "+models.WorkflowRunEventsChannel); err != nil {
		return err
	}

	for {
		notification, err := conn.Conn().WaitForNotification(ctx)
		if err != nil {
			if ctx.Err() != nil {
				return nil
			}
			return err
		}

		var event models.WorkflowRunUpdatedNotification
		if err := json.Unmarshal([]byte(notification.Payload), &event); err != nil {
			log.Printf("failed to decode realtime notification: %v", err)
			continue
		}
		if event.WorkflowRunID == "" {
			continue
		}

		snapshot, err := workflow.GetWorkflowRunSnapshot(ctx, pool, event.WorkflowRunID)
		if err != nil {
			log.Printf("failed to load workflow run snapshot for realtime broadcast: %v", err)
			continue
		}

		payload, err := json.Marshal(snapshot)
		if err != nil {
			log.Printf("failed to marshal workflow run snapshot: %v", err)
			continue
		}

		hub.Broadcast(event.WorkflowRunID, payload)
	}
}
