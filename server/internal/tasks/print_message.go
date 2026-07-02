package tasks

import (
	"context"
	"encoding/json"
	"log"

	"monad/models"
)

type printMessagePayload struct {
	Message string `json:"message"`
}

func ExecutePrintMessage(ctx context.Context, msg models.TaskMessage) ([]byte, error) {
	var payload printMessagePayload
	if err := json.Unmarshal(msg.Payload, &payload); err != nil {
		return nil, err
	}

	log.Printf("print-message task %s: %s", msg.TaskID, payload.Message)

	return json.Marshal(map[string]string{
		"message": payload.Message,
	})
}
