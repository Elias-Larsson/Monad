"use client";

import { FormEvent, useEffect, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { NavBar } from "@/components/navigation/navbar";
import { WorkflowNav } from "@/components/navigation/workflownav";
import {
  createWorkflowRun,
  getWorkflowRuns,
  getWorkflows,
} from "@/lib/api";
import { WorkflowRun } from "@/types/workflow-run";
import { Workflow } from "@/types/workflow";

const taskTypes = ["print-message", "wait", "http-request", "json-transform"];

const defaultPayload = JSON.stringify(
  {
    message: "hello from Monad",
  },
  null,
  2,
);

function statusClassName(status: WorkflowRun["status"]) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "RUNNING":
      return "bg-blue-50 text-blue-700 ring-blue-200";
    case "FAILED":
      return "bg-red-50 text-red-700 ring-red-200";
    default:
      return "bg-neutral-100 text-neutral-700 ring-neutral-200";
  }
}

export default function WorkflowRunPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [workflowID, setWorkflowID] = useState("");
  const [taskType, setTaskType] = useState("print-message");
  const [payload, setPayload] = useState(defaultPayload);

  async function loadData() {
    try {
      setLoadFailed(false);
      const [workflowData, runData] = await Promise.all([
        getWorkflows(),
        getWorkflowRuns(),
      ]);

      setWorkflows(workflowData);
      setRuns(runData);
      setWorkflowID((current) => current || workflowData[0]?.id || "");
    } catch {
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateRun(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");

    if (!workflowID) {
      setFormError("Choose a workflow first.");
      return;
    }

    let parsedPayload: Record<string, unknown>;
    try {
      parsedPayload = JSON.parse(payload);
    } catch {
      setFormError("Payload must be valid JSON.");
      return;
    }

    try {
      setCreating(true);
      const run = await createWorkflowRun({
        workflow_id: workflowID,
        task_type: taskType,
        payload: parsedPayload,
      });
      setSuccessMessage(`Started run ${run.workflow_run_id}`);
      await loadData();
    } catch {
      setFormError("Could not start workflow run.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <NavBar />

      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-8 lg:grid-cols-[220px_1fr]">
        <WorkflowNav />

        <section className="min-h-[520px] rounded-lg border border-neutral-200 bg-white p-6">
          <div className="flex flex-col gap-2 border-b border-neutral-200 pb-5">
            <p className="text-sm font-medium text-neutral-500">Workspace</p>
            <h1 className="text-2xl font-semibold tracking-normal">
              Run workflow
            </h1>
          </div>

          <div className="grid gap-6 py-6 lg:grid-cols-[360px_1fr]">
            <form
              onSubmit={handleCreateRun}
              className="rounded-md border border-neutral-200 bg-neutral-50 p-5"
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold">Start execution</h2>
                <p className="text-sm text-neutral-500">
                  Create a workflow run and queue its first task.
                </p>
              </div>

              <label className="mt-4 flex flex-col gap-2">
                <span className="text-sm font-medium text-neutral-700">
                  Workflow
                </span>
                <select
                  value={workflowID}
                  onChange={(event) => setWorkflowID(event.target.value)}
                  disabled={loading || workflows.length === 0}
                  className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-950 disabled:bg-neutral-100"
                >
                  {workflows.length === 0 ? (
                    <option value="">No workflows available</option>
                  ) : (
                    workflows.map((workflow) => (
                      <option key={workflow.id} value={workflow.id}>
                        {workflow.name}
                      </option>
                    ))
                  )}
                </select>
              </label>

              <label className="mt-4 flex flex-col gap-2">
                <span className="text-sm font-medium text-neutral-700">
                  Task type
                </span>
                <select
                  value={taskType}
                  onChange={(event) => setTaskType(event.target.value)}
                  className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-950"
                >
                  {taskTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <label className="mt-4 flex flex-col gap-2">
                <span className="text-sm font-medium text-neutral-700">
                  Payload JSON
                </span>
                <textarea
                  value={payload}
                  onChange={(event) => setPayload(event.target.value)}
                  rows={8}
                  className="rounded-md border border-neutral-300 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-neutral-950"
                />
              </label>

              {formError ? (
                <p className="mt-3 text-sm text-red-600">{formError}</p>
              ) : null}
              {successMessage ? (
                <p className="mt-3 text-sm text-emerald-700">
                  {successMessage}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={creating || loading || workflows.length === 0}
                className="mt-4 rounded-md bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? "Starting..." : "Start workflow run"}
              </button>
            </form>

            <div>
              {loading ? (
                <EmptyState
                  title="Loading workflow runs"
                  message="Fetching recent workflow executions from the API."
                />
              ) : loadFailed ? (
                <EmptyState
                  title="Could not load workflow runs"
                  message="Make sure the Go API is running and NEXT_PUBLIC_API_URL points to it."
                />
              ) : runs.length === 0 ? (
                <EmptyState
                  title="No workflow runs yet"
                  message="Start a workflow execution to see it here."
                />
              ) : (
                <div className="overflow-hidden rounded-md border border-neutral-200">
                  <div className="grid grid-cols-[1fr_120px_160px] border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-600">
                    <span>Run</span>
                    <span>Status</span>
                    <span>Created</span>
                  </div>

                  <div className="divide-y divide-neutral-200">
                    {runs.map((run) => (
                      <div
                        key={run.id}
                        className="grid grid-cols-[1fr_120px_160px] gap-4 px-4 py-4 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-neutral-950">
                            {run.workflow_id}
                          </p>
                          <p className="mt-1 truncate text-xs text-neutral-500">
                            {run.id}
                          </p>
                        </div>

                        <div>
                          <span
                            className={`inline-flex rounded px-2 py-1 text-xs font-medium ring-1 ${statusClassName(
                              run.status,
                            )}`}
                          >
                            {run.status}
                          </span>
                        </div>

                        <time className="text-xs text-neutral-500">
                          {new Date(run.created_at).toLocaleString()}
                        </time>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
