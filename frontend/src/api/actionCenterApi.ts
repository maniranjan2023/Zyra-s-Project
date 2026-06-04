import type { ActionCenter, TaskStatus } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message ?? "Request failed");
  }

  return data;
}

export async function fetchActionCenter(studentId: string) {
  const response = await fetch(`${API_BASE_URL}/students/${studentId}/action-center`);
  return parseResponse<ActionCenter>(response);
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status })
  });

  return parseResponse(response);
}
