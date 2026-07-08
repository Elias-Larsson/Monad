"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { NavBar } from "@/components/navigation/navbar";
import { StatusBadge } from "@/components/status-badge";
import { createWorkflowRun, getTasks, getWorkflow, getWorkflowRun } from "@/lib/api";
import { workflowRunWebSocketURL } from "@/lib/realtime";
import type { Task } from "@/types/task";
import type { WorkflowRun, WorkflowRunLiveUpdate } from "@/types/workflow-run";
import type { Workflow } from "@/types/workflow";
import type { WorkflowStep } from "@/types/workflow-step";

function sortSteps(steps: WorkflowStep[]) {
  return [...steps].sort((a, b) => a.step_order - b.step_order);
}

function sortTasks(tasks: Task[]) {
  return [...tasks].sort((a, b) => a.step_order - b.step_order);
}

function taskForStep(tasks: Task[], step: WorkflowStep) {
  return (
    tasks.find((task) => task.workflow_step_id === step.id) ??
    tasks.find((task) => task.step_order === step.step_order)
  );
}

function hasOutput(task: Task | undefined) {
  return Boolean(task?.output && Object.keys(task.output).length > 0);
}

async function loadRunState(workflowRunID: string) {
  const [run, allTasks] = await Promise.all([
    getWorkflowRun(workflowRunID),
    getTasks(),
  ]);

  return {
    run,
    tasks: sortTasks(
      allTasks.filter((task) => task.workflow_run_id === workflowRunID),
    ),
  };
}

function startStorageKey(workflowID: string) {
  const startID = new URLSearchParams(window.location.search).get("start");
  if (!startID) {
    return "";
  }

  return `monad:workflow-run:${workflowID}:${startID}`;
}

export default function WorkflowAutoRunPage() {
  const params = useParams<{ id: string }>();
  const workflowID = params.id;
  const startedRef = useRef(false);

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [run, setRun] = useState<WorkflowRun | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState("");

  const runID = run?.id ?? "";
  const runStatus = run?.status ?? "";
  const steps = useMemo(() => sortSteps(workflow?.steps ?? []), [workflow]);

  useEffect(() => {
    if (!workflowID || startedRef.current) {
      return;
    }

    startedRef.current = true;
    let cancelled = false;

    async function startWorkflowRun() {
      try {
        setFailed("");
        const workflowData = await getWorkflow(workflowID);
        if (cancelled) {
          return;
        }
        setWorkflow(workflowData);

        const storageKey = startStorageKey(workflowID);
        const existingRunID = storageKey
          ? window.sessionStorage.getItem(storageKey)
          : "";

        if (existingRunID) {
          const snapshot = await loadRunState(existingRunID);
          if (!cancelled) {
            setRun(snapshot.run);
            setTasks(snapshot.tasks);
          }
          return;
        }

        const response = await createWorkflowRun({
          workflow_id: workflowID,
        });
        if (cancelled) {
          return;
        }

        if (storageKey) {
          window.sessionStorage.setItem(storageKey, response.workflow_run_id);
        }

        setRun({
          id: response.workflow_run_id,
          workflow_id: workflowID,
          status: response.status,
          created_at: new Date().toISOString(),
          completed_at: null,
        });

        const snapshot = await loadRunState(response.workflow_run_id);
        if (!cancelled) {
          setRun(snapshot.run);
          setTasks(snapshot.tasks);
        }
      } catch {
        if (!cancelled) {
          setFailed("Could not start this workflow run.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void startWorkflowRun();

    return () => {
      cancelled = true;
    };
  }, [workflowID]);

  useEffect(() => {
    if (!runID || runStatus === "COMPLETED" || runStatus === "FAILED") {
      return;
    }

    let cancelled = false;

    async function refreshRunState() {
      try {
        const snapshot = await loadRunState(runID);
        if (cancelled) {
          return;
        }

        setRun(snapshot.run);
        setTasks(snapshot.tasks);
        setFailed("");
      } catch {
        if (!cancelled) {
          setFailed("Could not refresh workflow run state.");
        }
      }
    }

    const intervalID = window.setInterval(() => {
      void refreshRunState();
    }, 1000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalID);
    };
  }, [runID, runStatus]);

  useEffect(() => {
    if (!runID) {
      return;
    }

    const socket = new WebSocket(workflowRunWebSocketURL(runID));

    socket.onmessage = (event) => {
      let update: WorkflowRunLiveUpdate;
      try {
        update = JSON.parse(event.data) as WorkflowRunLiveUpdate;
      } catch {
        return;
      }

      if (update.workflow_run_id !== runID) {
        return;
      }

      setRun(update.run);
      setTasks(sortTasks(update.tasks));
      setFailed("");
    };

    socket.onerror = () => {
      setFailed("Live updates disconnected. Polling current state instead.");
    };

    return () => {
      socket.close();
    };
  }, [runID]);

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <NavBar />

      <section className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6">
          <Link
            href="/workflows"
            className="text-sm font-medium text-neutral-600 hover:text-neutral-950"
          >
            Back to workflows
          </Link>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <div className="flex flex-col gap-4 border-b border-neutral-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">
                Workflow run
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-normal">
                {workflow?.name ?? "Starting workflow"}
              </h1>
              {run ? (
                <p className="mt-2 break-all text-xs text-neutral-500">
                  {run.id}
                </p>
              ) : null}
            </div>

            {run ? <StatusBadge status={run.status} /> : null}
          </div>

          <div className="py-6">
            {loading ? (
              <EmptyState
                title="Starting workflow"
                message="Creating a workflow run and waiting for task updates."
              />
            ) : failed && !run ? (
              <EmptyState title="Run failed to start" message={failed} />
            ) : steps.length === 0 ? (
              <EmptyState
                title="No workflow steps"
                message="This workflow does not have steps to execute."
              />
            ) : (
              <div className="space-y-4">
                {failed ? (
                  <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    {failed}
                  </p>
                ) : null}

                {steps.map((step) => {
                  const task = taskForStep(tasks, step);
                  const status = task?.status ?? "PENDING";
                  const input = task?.payload ?? step.payload;

                  return (
                    <article
                      key={step.id}
                      className="grid gap-4 rounded-md border border-neutral-200 p-4 sm:grid-cols-[80px_1fr_130px]"
                    >
                      <div>
                        <p className="text-xs font-semibold text-neutral-400">
                          Step
                        </p>
                        <p className="mt-1 text-2xl font-semibold">
                          {step.step_order}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <h2 className="text-base font-semibold">
                          {step.task_type}
                        </h2>

                        <div className="mt-4 grid gap-3 lg:grid-cols-2">
                          <div className="min-w-0 rounded-md border border-sky-200 bg-sky-50">
                            <div className="border-b border-sky-200 px-3 py-2">
                              <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">
                                Input
                              </p>
                              <p className="mt-1 text-xs text-sky-700">
                                Payload sent to the worker.
                              </p>
                            </div>
                            <pre className="max-h-72 overflow-auto p-3 text-xs text-sky-950">
                              {JSON.stringify(input, null, 2)}
                            </pre>
                          </div>

                          <div className="min-w-0 rounded-md border border-emerald-200 bg-emerald-50">
                            <div className="border-b border-emerald-200 px-3 py-2">
                              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
                                Output
                              </p>
                              <p className="mt-1 text-xs text-emerald-700">
                                Result stored after the task finishes.
                              </p>
                            </div>

                            {hasOutput(task) ? (
                              <pre className="max-h-72 overflow-auto p-3 text-xs text-emerald-950">
                                {JSON.stringify(task?.output, null, 2)}
                              </pre>
                            ) : (
                              <div className="p-3 text-xs text-emerald-800">
                                No output yet.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="sm:text-right">
                        <StatusBadge status={status} />
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
