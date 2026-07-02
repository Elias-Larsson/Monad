package main

import (
	"context"
	"encoding/json"
	"log"

	"monad/internal/queue"
	"monad/internal/tasks"
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

		ctx := context.Background()
		if err := workflow.MarkWorkflowRunRunning(ctx, pool, msg.WorkflowRunID); err != nil {
			return err
		}

		if err := workflow.MarkTaskRunning(ctx, pool, msg.TaskID); err != nil {
			return err
		}

		output, err := tasks.Execute(ctx, msg)
		if err != nil {
			if markErr := workflow.MarkTaskFailed(ctx, pool, msg.TaskID, err.Error()); markErr != nil {
				return markErr
			}
			if markErr := workflow.MarkWorkflowRunFailed(ctx, pool, msg.WorkflowRunID); markErr != nil {
				return markErr
			}
			return err
		}

		if err := workflow.MarkTaskCompleted(ctx, pool, msg.TaskID, output); err != nil {
			return err
		}

		nextTask, ok, err := workflow.GetNextPendingTask(
			ctx,
			pool,
			msg.WorkflowRunID,
			msg.StepOrder,
		)
		if err != nil {
			return err
		}

		if ok {
			body, err := json.Marshal(nextTask)
			if err != nil {
				return err
			}

			return queue.Publish(body)
		}

		return workflow.MarkWorkflowRunCompleted(ctx, pool, msg.WorkflowRunID)
	})

	if err != nil {
		log.Fatal(err)
	}
}
