import { CreateWorkflowStepRequest, WorkflowStep } from "@/types/workflow-step";

export type Workflow = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  steps?: WorkflowStep[];
};

export type CreateWorkflowRequest = {
  name: string;
  steps: CreateWorkflowStepRequest[];
};
