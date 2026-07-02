export type WorkflowRun = {
  id: string;
  workflow_id: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  created_at: string;
  completed_at: string | null;
};

export type CreateWorkflowRunRequest = {
  workflow_id: string;
  task_type: string;
  payload?: Record<string, unknown>;
};

export type CreateWorkflowRunResponse = {
  workflow_run_id: string;
  task_id: string;
  status: "PENDING";
};
