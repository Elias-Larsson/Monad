export const taskTypes = [
  "print-message",
  "wait",
  "http-request",
  "json-transform",
] as const;

export type TaskType = (typeof taskTypes)[number];

export const taskPayloadExamples: Record<TaskType, Record<string, unknown>> = {
  "print-message": {
    message: "hello from Monad",
  },
  wait: {
    seconds: 3,
  },
  "http-request": {
    method: "GET",
    url: "https://jsonplaceholder.typicode.com/todos/1",
    headers: {
      Accept: "application/json",
    },
    body: null,
  },
  "json-transform": {
    input: {
      user: {
        name: "Ada Lovelace",
        email: "ada@example.com",
      },
      plan: "pro",
    },
    fields: {
      name: "user.name",
      email: "user.email",
      plan: "plan",
    },
  },
};
