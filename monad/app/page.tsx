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
    description: "The user starts a run from the Next.js interface.",
    tone: "border-sky-200 bg-sky-50 text-sky-950",
  },
  {
    title: "Fiber API",
    description: "The API checks auth, creates database records, and queues work.",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-950",
  },
  {
    title: "Postgres",
    description: "Workflow state, run history, task status, and outputs are stored here.",
    tone: "border-violet-200 bg-violet-50 text-violet-950",
  },
  {
    title: "RabbitMQ",
    description: "Task messages wait in a queue until a worker is ready.",
    tone: "border-amber-200 bg-amber-50 text-amber-950",
  },
  {
    title: "Go worker",
    description: "Workers consume queued tasks, execute them, and update Postgres.",
    tone: "border-rose-200 bg-rose-50 text-rose-950",
  },
];

const terms = [
  {
    title: "Workflow",
    description: "The saved plan.",
  },
  {
    title: "Run",
    description: "One execution of the plan.",
  },
  {
    title: "Task",
    description: "One step inside the execution.",
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

            <Button name="Open Dashboard" />
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

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1fr_360px] lg:py-20">
        <div>
          <p className="text-sm font-medium text-neutral-500">
            Architecture flow
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl leading-tight text-neutral-950">
            A run moves from the dashboard, through the API, into the queue, and
            back into stored state.
          </h2>

          <div className="mt-8 grid gap-4">
            {architectureFlow.map((item, index) => (
              <div key={item.title}>
                <article
                  className={`rounded-lg border p-5 ${item.tone}`}
                >
                  <p className="text-sm font-semibold">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 leading-7">{item.description}</p>
                </article>

                {index < architectureFlow.length - 1 ? (
                  <div className="flex h-8 items-center justify-center text-sm font-semibold text-neutral-400">
                    then
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <aside className="self-start border-l-4 border-neutral-950 bg-white px-6 py-5">
          <p className="text-sm font-medium text-neutral-500">
            Important idea
          </p>
          <h3 className="mt-2 text-2xl leading-tight text-neutral-950">
            RabbitMQ does not replace the database.
          </h3>
          <p className="mt-4 leading-7 text-neutral-600">
            Postgres is the source of truth. RabbitMQ only carries task messages
            to workers. That is why Monad can show workflow history, task
            status, timestamps, and output after execution.
          </p>
        </aside>
      </section>

      <section className="border-y border-neutral-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[360px_1fr] lg:py-20">
          <div>
            <p className="text-sm font-medium text-neutral-500">
              Dashboard language
            </p>
            <h2 className="mt-3 text-3xl leading-tight text-neutral-950">
              Three words make the app easier to understand.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {terms.map((term) => (
              <article
                key={term.title}
                className="rounded-lg border border-neutral-200 bg-neutral-50 p-6"
              >
                <h3 className="text-2xl font-semibold text-neutral-950">
                  {term.title}
                </h3>
                <p className="mt-3 leading-7 text-neutral-600">
                  {term.description}
                </p>
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
    </main>
  );
}
