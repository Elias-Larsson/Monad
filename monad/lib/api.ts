import { Task } from "@/types/task";
import { CreateWorkflowRequest, Workflow } from "@/types/workflow";
import {
  CreateWorkflowRunRequest,
  CreateWorkflowRunResponse,
  WorkflowRun,
} from "@/types/workflow-run";
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function getWorkflows(): Promise<Workflow[]> {
  const response = await api.get<Workflow[]>(`/workflows`);
  return response.data;
}

export async function getWorkflow(id: string): Promise<Workflow> {
  const response = await api.get<Workflow>(`/workflows/${id}`);
  return response.data;
}

export async function createWorkflow(
  body: CreateWorkflowRequest,
): Promise<Workflow> {
  const response = await api.post<Workflow>(`/workflows`, body);
  return response.data;
}

export async function deleteWorkflow(id: string): Promise<void> {
  await api.delete(`/workflows/${id}`);
}

export async function createWorkflowRun(
  body: CreateWorkflowRunRequest,
): Promise<CreateWorkflowRunResponse> {
  const response = await api.post<CreateWorkflowRunResponse>(
    `/workflows/run`,
    body,
  );
  return response.data;
}

export async function getWorkflowRuns(): Promise<WorkflowRun[]> {
  const response = await api.get<WorkflowRun[]>(`/workflows/run`);
  return response.data;
}

export async function getWorkflowRun(id: string): Promise<WorkflowRun> {
  const response = await api.get<WorkflowRun>(`/workflows/run/${id}`);
  return response.data;
}

export async function getTasks(): Promise<Task[]> {
  const response = await api.get<Task[]>(`/tasks`);
  return response.data;
}

export async function getTask(id: string): Promise<Task> {
  const response = await api.get<Task>(`/tasks/${id}`);
  return response.data;
}

export async function healthCheck(): Promise<boolean> {
  const response = await api.get(`/health`);
  return response.status === 200;
}
