export type Workflow = {
  id: string;
  name: string;
  created_at: string;
};

export type CreateWorkflowRequest = {
  id: string;
  name: string;
};