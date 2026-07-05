export function workflowRunWebSocketURL(workflowRunID: string) {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    const baseURL = process.env.NEXT_PUBLIC_WS_URL.replace(/\/$/, "");
    return `${baseURL}/ws/workflow-runs/${workflowRunID}`;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/api/ws/workflow-runs/${workflowRunID}`;
}
