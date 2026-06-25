export type Task = {
  id: string;
  workflow_run_id: string;
  task_type: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  payload: Record<string, unknown>;
  output: Record<string, unknown>;
  retry_count: number;
  created_at: string;
  completed_at: string | null;
};
