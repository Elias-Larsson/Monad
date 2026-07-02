import { NavBar } from "@/components/navigation/navbar";
import { Logo } from "@/components/logo";
import Image from "next/image";
import styles from "./duck.module.css";
import { Button } from "@/components/button/button";

const stats = [
  { label: "Workflow blueprints", value: "0" },
  { label: "Queued runs", value: "0" },
  { label: "Completed tasks", value: "0" },
];

const howItWorks = [
  {
    step: "01",
    title: "Create a workflow",
    description:
      "A workflow is the blueprint users define before anything is executed.",
  },
  {
    step: "02",
    title: "Start a run",
    description:
      "The API creates a workflow run and stores task state in Postgres.",
  },
  {
    step: "03",
    title: "Queue the task",
    description:
      "RabbitMQ receives a JSON task message so execution can happen async.",
  },
  {
    step: "04",
    title: "Worker completes it",
    description:
      "A Go worker consumes the task, runs it, and updates Postgres.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <NavBar />
      <section className="flex flex-col mx-auto max-w-6xl px-6 py-10 gap-20">
        <div className="flex flex-row items-center justify-between">
          <div>
            <Logo />
            <h2 className="max-w-3xl text-4xl tracking-normal text-neutral-950">
              Monad runs backend workflows through Go, Postgres, RabbitMQ, and
              workers.
            </h2>

            <p className="mt-4 max-w-2xl leading-7 text-neutral-600">
              Create workflows and run tasks in a single sequence. Inspect
              worker progress from one small operational dashboard.
            </p>
            <Button name={"Open Dashboard"} />
          </div>
          <div className={styles.duckWrap}>
            <Image
              src="/duck.png"
              alt="duck"
              width={144}
              height={144}
              className={styles.duck}
            />
          </div>
        </div>

        <section className="mt-12">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-neutral-500">How it works</p>
            <h2 className="mt-2 text-3xl text-neutral-950">
              From API request to completed task.
            </h2>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {howItWorks.map((item) => (
              <div
                key={item.step}
                className="rounded-lg border border-neutral-200 bg-white p-5"
              >
                <p className="text-xs font-semibold text-neutral-400">
                  {item.step}
                </p>
                <h3 className="mt-3 text-base font-semibold text-neutral-950">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-neutral-200 bg-white p-5"
            >
              <p className="text-sm text-neutral-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>

        <section className="mt-8 rounded-lg border border-neutral-200 bg-white p-6">
          <div className="flex flex-col gap-2 border-b border-neutral-200 pb-4">
            <p className="text-sm font-medium text-neutral-500">System</p>
            <h2 className="text-xl font-semibold">Current backend pieces</h2>
          </div>

          <div className="grid gap-4 pt-5 md:grid-cols-5">
            {[
              "Fiber API",
              "PostgreSQL",
              "RabbitMQ",
              "Go worker",
              "Auth Server",
            ].map((item) => (
              <div
                key={item}
                className="rounded-md border border-neutral-200 p-4 text-sm font-medium text-neutral-700"
              >
                {item}
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
