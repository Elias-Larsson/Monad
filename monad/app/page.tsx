import Image from "next/image";

import { Button } from "@/components/button/button";
import { Logo } from "@/components/logo";
import { NavBar } from "@/components/navigation/navbar";

import styles from "./duck.module.css";

const productFlow = [
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

const architectureFlow = [
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

const liveUpdateFlow = [
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

const taskTypes = [
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

const stack = [
  "Go",
  "Fiber",
  "PostgreSQL",
  "RabbitMQ",
  "Docker Compose",
  "Next.js",
  "JWT auth",
  "Workers",
];

const footerLinks = [
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

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <NavBar />

      <section className="mx-auto max-w-6xl px-6 py-10 lg:py-14">
        <section className="flex min-h-[560px] items-center justify-between gap-10">
          <div className="max-w-3xl">
            <Logo />

            <h1 className="mt-4 max-w-3xl text-4xl leading-tight tracking-normal text-neutral-950 sm:text-5xl">
              Create a workflow, run it, and watch the backend process each
              task.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-600">
              Monad is a small workflow orchestration app. It turns repeatable
              backend jobs into saved workflows that can be executed and
              inspected from a dashboard.
            </p>

            <Button name="Open Workflows" />
          </div>

          <a href="https://eliaslarsson.dev" className={styles.duckWrap}>
            <Image
              src="/duck.png"
              alt="Monad duck"
              width={144}
              height={144}
              className={styles.duck}
            />
          </a>
        </section>
      </section>

      <section className="border-y border-neutral-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[320px_1fr] lg:py-20">
          <div>
            <p className="text-sm font-medium text-neutral-500">
              Product flow
            </p>
            <h2 className="mt-3 text-3xl leading-tight text-neutral-950">
              The app follows one simple path.
            </h2>
            <p className="mt-4 leading-7 text-neutral-600">
              Think of Monad as a place to define repeatable work, trigger it,
              and see what happened.
            </p>
          </div>

          <div className="space-y-4">
            {productFlow.map((item) => (
              <article
                key={item.step}
                className="grid gap-4 rounded-lg border border-neutral-200 bg-neutral-50 p-5 sm:grid-cols-[96px_1fr]"
              >
                <div>
                  <p className="text-sm font-semibold text-neutral-400">
                    {item.step}
                  </p>
                  <p className="mt-1 text-sm font-medium text-neutral-700">
                    {item.label}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-neutral-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 leading-7 text-neutral-600">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-neutral-500">
            Architecture flow
          </p>
          <h2 className="mt-3 text-3xl leading-tight text-neutral-950">
            What happens after a workflow run starts.
          </h2>
          <p className="mt-4 leading-7 text-neutral-600">
            Monad keeps execution separate from the API. The API records the
            run and queues work, while workers handle the actual task execution.
          </p>
        </div>

        <div className="mt-10 rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
          <div>
            <p className="text-sm font-semibold text-neutral-500">
              Execution path
            </p>

            <div className="mt-4 grid min-w-0 gap-0 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-stretch">
              {architectureFlow.map((item, index) => (
                <div key={item.title} className="contents">
                  <div className="min-w-0">
                    <article
                      className={`flex h-full min-w-0 flex-col rounded-lg border p-5 ${item.tone}`}
                    >
                      <p className="text-sm font-semibold">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <h3 className="mt-3 text-xl font-semibold">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm font-semibold opacity-70">
                        {item.role}
                      </p>
                      <p className="mt-4 leading-7">{item.description}</p>
                    </article>
                  </div>

                  {index < architectureFlow.length - 1 ? (
                    <div className="flex h-10 items-center justify-center lg:h-auto lg:w-8">
                      <div className="h-full w-px bg-neutral-300 lg:h-px lg:w-full" />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="my-8 border-t border-dashed border-neutral-200" />

          <div>
            <p className="text-sm font-semibold text-neutral-500">
              Live update path
            </p>

            <div className="mt-4 grid min-w-0 gap-0 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch">
              {liveUpdateFlow.map((item, index) => (
                <div key={item.title} className="contents">
                  <div className="min-w-0">
                    <article
                      className={`flex h-full min-w-0 flex-col rounded-lg border p-5 ${item.tone}`}
                    >
                      <p className="text-sm font-semibold">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <h3 className="mt-3 text-xl font-semibold">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm font-semibold opacity-70">
                        {item.role}
                      </p>
                      <p className="mt-4 leading-7">{item.description}</p>
                    </article>
                  </div>

                  {index < liveUpdateFlow.length - 1 ? (
                    <div className="flex h-10 items-center justify-center lg:h-auto lg:w-8">
                      <div className="h-full w-px bg-neutral-300 lg:h-px lg:w-full" />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-neutral-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[320px_1fr] lg:py-20">
          <div>
            <p className="text-sm font-medium text-neutral-500">
              Task types
            </p>
            <h2 className="mt-3 text-3xl leading-tight text-neutral-950">
              Workflows are built from small backend tasks.
            </h2>
            <p className="mt-4 leading-7 text-neutral-600">
              Each task is executed by a Go worker. The API creates the run,
              RabbitMQ queues the next task, and Postgres stores the final
              status and output.
            </p>
          </div>

          <div className="grid min-w-0 gap-4 md:grid-cols-2">
            {taskTypes.map((task) => (
              <article
                key={task.title}
                className="min-w-0 rounded-lg border border-neutral-200 bg-neutral-50 p-5"
              >
                <h3 className="text-xl font-semibold text-neutral-950">
                  {task.title}
                </h3>
                <p className="mt-3 leading-7 text-neutral-600">
                  {task.description}
                </p>
                <pre className="mt-4 max-w-full whitespace-pre-wrap break-words rounded-md border border-neutral-200 bg-white p-3 text-xs text-neutral-700">
                  {task.example}
                </pre>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-neutral-500">Built with</p>
          <h2 className="mt-3 text-3xl leading-tight text-neutral-950">
            A backend-focused Go project with a small dashboard.
          </h2>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {stack.map((item) => (
            <span
              key={item}
              className="rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/duck.svg"
              alt="Monad duck"
              width={56}
              height={56}
              className="rotate-6"
            />
            <div>
              <h1 className="font-semibold text-neutral-950">Monad</h1>
              <p className="mt-1 text-sm text-neutral-500">
                Built by Elias Larsson.
              </p>
            </div>
          </div>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap gap-3 text-sm font-medium"
          >
            {footerLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-neutral-200 px-3 py-2 text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </main>
  );
}
