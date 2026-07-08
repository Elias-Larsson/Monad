"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { NavBar } from "@/components/navigation/navbar";
import { StatusBadge } from "@/components/status-badge";
import { getTasks, getWorkflowRuns } from "@/lib/api";
import type { Task } from "@/types/task";
import type { WorkflowRun } from "@/types/workflow-run";

type TaskMap = Record<string, Task[]>;

function groupTasksByRun(tasks: Task[]) {
  return tasks.reduce<TaskMap>((groups, task) => {
    const current = groups[task.workflow_run_id] ?? [];
    groups[task.workflow_run_id] = [...current, task];
    return groups;
  }, {});
}

function sortTasks(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    if (a.step_order !== b.step_order) {
      return a.step_order - b.step_order;
    }

    return a.created_at.localeCompare(b.created_at);
  });
}

function hasOutput(task: Task) {
  return Object.keys(task.output).length > 0;
}

export default function HistoryPage() {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  const tasksByRun = useMemo(() => groupTasksByRun(tasks), [tasks]);

  const loadHistory = useCallback(async () => {
    try {
      const [runData, taskData] = await Promise.all([
        getWorkflowRuns(),
        getTasks(),
      ]);

      setRuns(runData);
      setTasks(taskData);
      setLoadFailed(false);
    } catch {
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutID = window.setTimeout(() => {
      void loadHistory();
    }, 0);

    return () => window.clearTimeout(timeoutID);
  }, [loadHistory]);

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <NavBar />

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <div className="flex flex-col gap-4 border-b border-neutral-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">
                Workflow history
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-normal">
                Runs and tasks
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
                Review previous workflow executions and every task created for
                each run.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadHistory()}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
            >
              Refresh
            </button>
          </div>

          <div className="py-6">
            {loading ? (
              <EmptyState
                title="Loading history"
                message="Fetching workflow runs and task history from the API."
              />
            ) : loadFailed ? (
              <EmptyState
                title="Could not load history"
                message="Make sure the Go API is running and try again."
              />
            ) : runs.length === 0 ? (
              <EmptyState
                title="No workflow runs yet"
                message="Run a workflow to create history."
              />
            ) : (
              <div className="space-y-5">
                {runs.map((run) => {
                  const runTasks = sortTasks(tasksByRun[run.id] ?? []);

                  return (
                    <article
                      key={run.id}
                      className="overflow-hidden rounded-md border border-neutral-200"
                    >
                      <div className="grid gap-4 border-b border-neutral-200 bg-neutral-50 px-4 py-4 md:grid-cols-[1fr_120px_170px_170px]">
                        <div className="min-w-0">
                          <p className="font-medium text-neutral-950">
                            {run.workflow_id}
                          </p>
                          <p className="mt-1 break-all text-xs text-neutral-500">
                            {run.id}
                          </p>
                        </div>

                        <div>
                          <p className="mb-2 text-xs font-medium text-neutral-500">
                            Status
                          </p>
                          <StatusBadge status={run.status} />
                        </div>

                        <div>
                          <p className="text-xs font-medium text-neutral-500">
                            Created
                          </p>
                          <p className="mt-2 text-xs text-neutral-700">
                            {new Date(run.created_at).toLocaleString()}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-neutral-500">
                            Completed
                          </p>
                          <p className="mt-2 text-xs text-neutral-700">
                            {run.completed_at
                              ? new Date(run.completed_at).toLocaleString()
                              : "-"}
                          </p>
                        </div>
                      </div>

                      {runTasks.length === 0 ? (
                        <div className="px-4 py-5 text-sm text-neutral-500">
                          No tasks found for this run.
                        </div>
                      ) : (
                        <div className="divide-y divide-neutral-200">
                          {runTasks.map((task) => (
                            <div
                              key={task.id}
                              className="grid gap-4 px-4 py-4 text-sm md:grid-cols-[80px_1fr_120px]"
                            >
                              <div>
                                <p className="text-xs font-medium text-neutral-500">
                                  Step
                                </p>
                                <p className="mt-1 text-lg font-semibold">
                                  {task.step_order}
                                </p>
                              </div>

                              <div className="min-w-0">
                                <p className="font-medium text-neutral-950">
                                  {task.task_type}
                                </p>
                                <p className="mt-1 break-all text-xs text-neutral-500">
                                  {task.id}
                                </p>

                                <div className="mt-3 grid gap-3 lg:grid-cols-2">
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
                                      {JSON.stringify(task.payload, null, 2)}
                                    </pre>
                                  </div>

                                  <div className="min-w-0 rounded-md border border-emerald-200 bg-emerald-50">
                                    <div className="border-b border-emerald-200 px-3 py-2">
                                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
                                        Output
                                      </p>
                                      <p className="mt-1 text-xs text-emerald-700">
                                        Result stored after the task finished.
                                      </p>
                                    </div>

                                    {hasOutput(task) ? (
                                      <pre className="max-h-72 overflow-auto p-3 text-xs text-emerald-950">
                                        {JSON.stringify(task.output, null, 2)}
                                      </pre>
                                    ) : (
                                      <div className="p-3 text-xs text-emerald-800">
                                        No output was stored.
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div>
                                <p className="mb-2 text-xs font-medium text-neutral-500">
                                  Status
                                </p>
                                <StatusBadge status={task.status} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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
