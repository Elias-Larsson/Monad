import { Task } from "@/types/tasks";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function getTasks(): Promise<Task[]> {
  const response = await api.get<Task[]>(`/tasks`);
  return response.data;
}