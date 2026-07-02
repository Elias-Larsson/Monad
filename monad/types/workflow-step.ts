export type WorkflowStep = {
  id: string;
  workflow_id: string;
  step_order: number;
  task_type: string;
  payload: Record<string, unknown>;
  created_at: string;
};

export type CreateWorkflowStepRequest = {
  step_order?: number;
  task_type: string;
  payload?: Record<string, unknown>;
};
