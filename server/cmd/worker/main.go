package main

import (
	"context"
	"encoding/json"
	"log"

	"monad/internal/queue"
	"monad/internal/workflow"
	"monad/models"
)

func main() {
	pool, err := workflow.NewPostgres(context.Background())
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()

	err = queue.Receive(func(body []byte) error {
		var msg models.TaskMessage

		if err := json.Unmarshal(body, &msg); err != nil {
			return err
		}

		log.Printf("received task: %+v", msg)

		if _, err := pool.Exec(
			context.Background(),
			`
			UPDATE tasks
			SET status = 'RUNNING'
			WHERE id = $1
			`,
			msg.TaskID,
		); err != nil {
			return err
		}

		if _, err := pool.Exec(
			context.Background(),
			`
			UPDATE workflow_runs
			SET status = 'RUNNING'
			WHERE id = $1
			`,
			msg.WorkflowRunID,
		); err != nil {
			return err
		}

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
		if err != nil {
			return err
		}

		_, err = pool.Exec(
			context.Background(),
			`
			UPDATE workflow_runs
			SET status = 'COMPLETED',
			    completed_at = NOW()
			WHERE id = $1
			`,
			msg.WorkflowRunID,
		)

		return err
	})

	if err != nil {
		log.Fatal(err)
	}
}
