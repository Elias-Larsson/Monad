export const taskTypes = [
  "print-message",
  "wait",
  "http-request",
  "json-transform",
] as const;

export type TaskType = (typeof taskTypes)[number];
