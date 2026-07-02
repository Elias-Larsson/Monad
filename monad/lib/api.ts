import { Workflow } from "@/types/workflow";
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

export async function createWorkflow(body: Workflow): Promise<string> {
  const response = await api.get<string>(`/workflows`, body);
  return response.data;
}

