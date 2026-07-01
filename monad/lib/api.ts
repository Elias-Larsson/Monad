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