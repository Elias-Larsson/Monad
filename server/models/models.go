package models

import "encoding/json"

type Workflow struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type WorkflowRun struct {
	ID         string
	WorkflowID string
	Status     string
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
