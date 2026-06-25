import { NavBar } from "@/components/navigation/navbar";
import { TasksList } from "@/components/tasksList";
import { WorkflowNav } from "@/components/navigation/workflownav";

export default function Home() {

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <NavBar />

      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-8 lg:grid-cols-[220px_1fr]">
        <WorkflowNav />

        <section className="min-h-[520px] rounded-lg border border-neutral-200 bg-white p-6">
          <div className="flex flex-col gap-2 border-b border-neutral-200 pb-5">
            <p className="text-sm font-medium text-neutral-500">Workspace</p>
            <h1 className="text-2xl font-semibold tracking-normal">
              Dashboard
            </h1>
          </div>

          <div className="grid gap-4 py-6 sm:grid-cols-3">
            <div className="rounded-md border border-neutral-200 p-4">
              <p className="text-sm text-neutral-500">Active workflows</p>
              <p className="mt-2 text-2xl font-semibold">0</p>
            </div>
            <div className="rounded-md border border-neutral-200 p-4">
              <p className="text-sm text-neutral-500">Queued runs</p>
              <p className="mt-2 text-2xl font-semibold">0</p>
            </div>
            <div className="rounded-md border border-neutral-200 p-4">
              <p className="text-sm text-neutral-500">Completed today</p>
              <p className="mt-2 text-2xl font-semibold">0</p>
            </div>
          </div>

          <TasksList />
        </section>
      </div>
    </main>
  );
}
