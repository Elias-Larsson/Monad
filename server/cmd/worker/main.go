package main

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"strconv"

	"monad/internal/queue"
	"monad/internal/tasks"
	"monad/internal/workflow"
	"monad/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	pool, err := workflow.NewPostgres(context.Background())
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()

	concurrency := workerConcurrency()
	log.Printf("worker starting with concurrency=%d", concurrency)

	err = queue.ReceiveConcurrent(concurrency, func(body []byte) error {
		return handleTask(context.Background(), pool, body)
	})

	if err != nil {
		log.Fatal(err)
	}
}

func workerConcurrency() int {
	value := os.Getenv("WORKER_CONCURRENCY")
	if value == "" {
		return 1
	}

	concurrency, err := strconv.Atoi(value)
	if err != nil || concurrency < 1 {
		log.Printf("invalid WORKER_CONCURRENCY=%q, using 1", value)
		return 1
	}

	return concurrency
}

func handleTask(ctx context.Context, pool *pgxpool.Pool, body []byte) error {
	var msg models.TaskMessage

	if err := json.Unmarshal(body, &msg); err != nil {
		return err
	}

	log.Printf("received task: %+v", msg)

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

		log.Printf("task %s failed and was stored in postgres: %v", msg.TaskID, err)
		return nil
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
		resolvedPayload, err := workflow.ResolveTaskPayload(nextTask.Payload, output)
		if err != nil {
			if markErr := workflow.MarkTaskFailed(ctx, pool, nextTask.TaskID, err.Error()); markErr != nil {
				return markErr
			}
			if markErr := workflow.MarkWorkflowRunFailed(ctx, pool, msg.WorkflowRunID); markErr != nil {
				return markErr
			}

			log.Printf("task %s input could not be resolved: %v", nextTask.TaskID, err)
			return nil
		}

		if err := workflow.UpdateTaskPayload(ctx, pool, nextTask.TaskID, resolvedPayload); err != nil {
			return err
		}
		nextTask.Payload = resolvedPayload

		body, err := json.Marshal(nextTask)
		if err != nil {
			return err
		}

		return queue.Publish(body)
	}

	return workflow.MarkWorkflowRunCompleted(ctx, pool, msg.WorkflowRunID)
}
