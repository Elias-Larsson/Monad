"use client";

import { EmptyState } from "@/components/empty-state";
import { NavBar } from "@/components/navigation/navbar";
import { WorkflowNav } from "@/components/navigation/workflownav";
import { WorkflowsList } from "@/components/workflows";
import { getWorkflows } from "@/lib/api";
import { Workflow } from "@/types/workflow";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWorkflows() {
      try {
        const data = await getWorkflows();
        setWorkflows(data);
      } catch {
        setLoadFailed(true);
      } finally {
        setLoading(false);
      }
    }

    loadWorkflows();
  }, []);

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
              <p className="mt-2 text-2xl font-semibold">
                {loading || loadFailed ? "-" : workflows.length}
              </p>
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

          {loading ? (
            <EmptyState
              title="Loading workflows"
              message="Fetching workflow blueprints from the API."
            />
          ) : loadFailed || workflows.length === 0 ? (
            <EmptyState
              title={loadFailed ? "Could not load workflows" : "No workflows yet"}
              message={
                loadFailed
                  ? "Make sure the Go API is running and NEXT_PUBLIC_API_URL points to it."
                  : "Create your first workflow blueprint to see it here."
              }
            />
          ) : (
            <WorkflowsList workflows={workflows} />
          )}
        </section>
      </div>
    </main>
  );
}
