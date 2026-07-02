"use client";

import { useEffect, useState } from "react";

import { CreateWorkflowForm } from "@/components/forms/create-workflow-form";
import { EmptyState } from "@/components/empty-state";
import { NavBar } from "@/components/navigation/navbar";
import { WorkflowNav } from "@/components/navigation/workflownav";
import { WorkflowsList } from "@/components/workflows";
import { getWorkflows } from "@/lib/api";
import { Workflow } from "@/types/workflow";

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  async function loadWorkflows() {
    try {
      setLoadFailed(false);
      const data = await getWorkflows();
      setWorkflows(data);
    } catch {
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
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
              Workflows
            </h1>
          </div>

          <div className="py-6">
            {loading ? (
              <EmptyState
                title="Loading workflows"
                message="Fetching workflow blueprints from the API."
              />
            ) : loadFailed ? (
              <EmptyState
                title="Could not load workflows"
                message="Make sure the Go API is running and NEXT_PUBLIC_API_URL points to it."
              />
            ) : workflows.length === 0 ? (
              <EmptyState
                title="No workflows yet"
                message="Create your first workflow blueprint below."
              />
            ) : (
              <WorkflowsList workflows={workflows} />
            )}
          </div>

          <CreateWorkflowForm onCreated={loadWorkflows} />
        </section>
      </div>
    </main>
  );
}
