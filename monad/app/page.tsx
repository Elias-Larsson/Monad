import Link from "next/link";

import { NavBar } from "@/components/navigation/navbar";

const stats = [
  { label: "Workflow blueprints", value: "0" },
  { label: "Queued runs", value: "0" },
  { label: "Completed tasks", value: "0" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <NavBar />

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <p className="text-sm font-medium text-neutral-500">
              Workflow orchestration
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-normal text-neutral-950">
              Monad runs backend workflows through Go, Postgres, RabbitMQ, and
              workers.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600">
              Create workflow blueprints, start runs, queue tasks, and inspect
              worker progress from one small operational dashboard.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="rounded-md bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
              >
                Open dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
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

          <div className="grid gap-4 pt-5 md:grid-cols-4">
            {["Fiber API", "PostgreSQL", "RabbitMQ", "Go worker"].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-md border border-neutral-200 p-4 text-sm font-medium text-neutral-700"
                >
                  {item}
                </div>
              ),
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
