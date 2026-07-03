import { Task } from "@/types/task";
import { CreateWorkflowRequest, Workflow } from "@/types/workflow";
import {
  CreateWorkflowRunRequest,
  CreateWorkflowRunResponse,
  WorkflowRun,
} from "@/types/workflow-run";
import axios from "axios";

function getApiBaseURL() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:3000`;
  }

  return "http://api:3000";
}

function expectArray<T>(data: unknown, endpoint: string): T[] {
  if (!Array.isArray(data)) {
    throw new Error(`${endpoint} did not return a JSON array`);
  }

  return data as T[];
}

export const api = axios.create({
  baseURL: getApiBaseURL(),
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function getWorkflows(): Promise<Workflow[]> {
  const response = await api.get<unknown>(`/workflows`);
  return expectArray<Workflow>(response.data, "/workflows");
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
  const response = await api.get<unknown>(`/workflows/run`);
  return expectArray<WorkflowRun>(response.data, "/workflows/run");
}

export async function getWorkflowRun(id: string): Promise<WorkflowRun> {
  const response = await api.get<WorkflowRun>(`/workflows/run/${id}`);
  return response.data;
}

export async function getTasks(): Promise<Task[]> {
  const response = await api.get<unknown>(`/tasks`);
  return expectArray<Task>(response.data, "/tasks");
}

export async function getTask(id: string): Promise<Task> {
  const response = await api.get<Task>(`/tasks/${id}`);
  return response.data;
}

export async function healthCheck(): Promise<boolean> {
  const response = await api.get(`/health`);
  return response.status === 200;
}
