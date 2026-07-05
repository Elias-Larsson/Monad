import type { Task } from "@/types/task";

export type WorkflowRun = {
  id: string;
  workflow_id: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  created_at: string;
  completed_at: string | null;
};

export type CreateWorkflowRunRequest = {
  workflow_id: string;
};

export type CreateWorkflowRunResponse = {
  workflow_run_id: string;
  task_id: string;
  task_ids: string[];
  status: "PENDING";
};

export type WorkflowRunLiveUpdate = {
  type: "workflow_run_updated";
  workflow_run_id: string;
  run: WorkflowRun;
  tasks: Task[];
};
