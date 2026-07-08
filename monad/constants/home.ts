export const productFlow = [
  {
    step: "01",
    label: "Sign in",
    title: "Start with your own workspace.",
    description:
      "Monad uses login so workflows, runs, and task history belong to the current user.",
  },
  {
    step: "02",
    label: "Create",
    title: "Save a workflow blueprint.",
    description:
      "A workflow is a reusable sequence of task steps, such as print a message, wait, then continue.",
  },
  {
    step: "03",
    label: "Run",
    title: "Execute the workflow on demand.",
    description:
      "Every run gets its own history, so the same workflow can be executed many times without losing previous results.",
  },
  {
    step: "04",
    label: "Inspect",
    title: "Follow each task status.",
    description:
      "The dashboard shows tasks moving through PENDING, RUNNING, COMPLETED, or FAILED.",
  },
];

export const architectureFlow = [
  {
    title: "Dashboard",
    role: "User action",
    description: "A user clicks Run from the Next.js workflow page.",
    tone: "border-sky-200 bg-sky-50 text-sky-950",
  },
  {
    title: "Fiber API",
    role: "Request handler",
    description: "Fiber checks auth, creates the run, and stores task rows.",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-950",
  },
  {
    title: "Postgres",
    role: "Source of truth",
    description: "Runs, tasks, statuses, payloads, and outputs are saved here.",
    tone: "border-violet-200 bg-violet-50 text-violet-950",
  },
  {
    title: "RabbitMQ",
    role: "Queue",
    description: "A JSON task message waits until a worker is ready.",
    tone: "border-amber-200 bg-amber-50 text-amber-950",
  },
  {
    title: "Go worker",
    role: "Executor",
    description: "The worker consumes the task, runs it, and updates Postgres.",
    tone: "border-rose-200 bg-rose-50 text-rose-950",
  },
];

export const liveUpdateFlow = [
  {
    title: "Postgres",
    role: "Latest state",
    description: "Task and run status changes are read from stored state.",
    tone: "border-violet-200 bg-violet-50 text-violet-950",
  },
  {
    title: "WebSocket",
    role: "Live updates",
    description: "Fiber keeps the run page updated while tasks execute.",
    tone: "border-cyan-200 bg-cyan-50 text-cyan-950",
  },
  {
    title: "Dashboard",
    role: "User feedback",
    description: "The page shows PENDING, RUNNING, COMPLETED, or FAILED.",
    tone: "border-sky-200 bg-sky-50 text-sky-950",
  },
];

export const homepageTaskTypes = [
  {
    title: "print-message",
    description:
      "Writes a message to the worker log and stores the message as task output.",
    example: '{ "message": "hello from Monad" }',
  },
  {
    title: "wait",
    description:
      "Pauses the workflow for a number of seconds before the next task is queued.",
    example: '{ "seconds": 3 }',
  },
  {
    title: "http-request",
    description:
      "Calls an HTTP endpoint and stores the response status, headers, and body.",
    example: '{ "method": "GET", "url": "https://example.com" }',
  },
  {
    title: "json-transform",
    description:
      "Extracts fields from JSON input using simple dot paths and stores a shaped output.",
    example: '{ "fields": { "email": "user.email" } }',
  },
];

export const stack = [
  "Go",
  "Fiber",
  "PostgreSQL",
  "RabbitMQ",
  "Docker Compose",
  "Next.js",
  "JWT auth",
  "Workers",
];

export const footerLinks = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/elias-h-larsson/",
  },
  {
    label: "GitHub",
    href: "https://github.com/Elias-Larsson",
  },
  {
    label: "Portfolio",
    href: "https://eliaslarsson.dev",
  },
];
