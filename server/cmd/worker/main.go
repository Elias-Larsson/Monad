package main

import (
	"context"
	"encoding/json"
	"log"

	"monad/internal/queue"
	"monad/internal/workflow"
)

func main() {
	pool, err := workflow.NewPostgres(context.Background())
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()

	err = queue.Receive(func(body []byte) error {
		var msg workflow.TaskMessage

		if err := json.Unmarshal(body, &msg); err != nil {
			return err
		}

		log.Printf("received task: %+v", msg)

		_, err := pool.Exec(
			context.Background(),
			`
			UPDATE tasks
			SET status = 'COMPLETED',
			    completed_at = NOW()
			WHERE id = $1
			`,
			msg.TaskID,
		)

		return err
	})

	if err != nil {
		log.Fatal(err)
	}
}
