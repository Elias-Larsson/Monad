package workflow

type Workflow struct {
	ID   string
	Name string
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