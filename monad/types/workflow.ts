import { CreateWorkflowStepRequest, WorkflowStep } from "@/types/workflow-step";

export type Workflow = {
  id: string;
  name: string;
  created_at: string;
  steps?: WorkflowStep[];
};

export type CreateWorkflowRequest = {
  id: string;
  name: string;
  steps: CreateWorkflowStepRequest[];
};
