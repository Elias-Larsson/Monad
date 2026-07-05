package tasks

import (
	"context"
	"fmt"

	"monad/models"
)

func Execute(ctx context.Context, msg models.TaskMessage) ([]byte, error) {
	switch msg.TaskType {
	case "print-message":
		return ExecutePrintMessage(ctx, msg)
	case "wait":
		return ExecuteWait(ctx, msg)
	case "http-request":
		return ExecuteHTTPRequest(ctx, msg)
	case "json-transform":
		return ExecuteJSONTransform(ctx, msg)
	default:
		return nil, fmt.Errorf("unknown task type: %s", msg.TaskType)
	}
}
