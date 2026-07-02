package tasks

import (
	"context"
	"encoding/json"
	"time"

	"monad/models"
)

type waitPayload struct {
	Seconds int `json:"seconds"`
}

func ExecuteWait(ctx context.Context, msg models.TaskMessage) ([]byte, error) {
	var payload waitPayload
	if err := json.Unmarshal(msg.Payload, &payload); err != nil {
		return nil, err
	}

	if payload.Seconds < 0 {
		payload.Seconds = 0
	}

	select {
	case <-time.After(time.Duration(payload.Seconds) * time.Second):
	case <-ctx.Done():
		return nil, ctx.Err()
	}

	return json.Marshal(map[string]any{
		"waited_seconds": payload.Seconds,
	})
}
