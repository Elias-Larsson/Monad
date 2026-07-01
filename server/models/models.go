package models

import (
	"encoding/json"
	"time"
)

type Workflow struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type WorkflowResponse struct {
	Workflow
	CreatedAt time.Time `json:"created_at"`
}
type WorkflowRun struct {
	ID         string
	WorkflowID string
	Status     string
}

type WorkflowRunResponse struct {
	ID          string     `json:"id"`
	WorkflowID  string     `json:"workflow_id"`
	Status      string     `json:"status"`
	CreatedAt   time.Time  `json:"created_at"`
	CompletedAt *time.Time `json:"completed_at"`
}

type Task struct {
	ID            string
	WorkflowRunID string
	TaskType      string
	Status        string
	Payload       []byte
}

type TaskMessage struct {
	TaskID        string          `json:"task_id"`
	WorkflowRunID string          `json:"workflow_run_id"`
	TaskType      string          `json:"task_type"`
	Payload       json.RawMessage `json:"payload"`
}

type TaskResponse struct {
	ID            string          `json:"id"`
	WorkflowRunID string          `json:"workflow_run_id"`
	TaskType      string          `json:"task_type"`
	Status        string          `json:"status"`
	Payload       json.RawMessage `json:"payload"`
	Output        json.RawMessage `json:"output"`
	RetryCount    int             `json:"retry_count"`
	CreatedAt     time.Time       `json:"created_at"`
	CompletedAt   *time.Time      `json:"completed_at"`
}
