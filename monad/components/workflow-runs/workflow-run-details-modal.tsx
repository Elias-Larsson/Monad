import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { TaskDataPanels } from "@/components/tasks/task-data-panels";
import { Task } from "@/types/task";
import { WorkflowRun } from "@/types/workflow-run";

type WorkflowRunDetailsModalProps = {
  run: WorkflowRun | undefined;
  tasks: Task[];
  loading: boolean;
  failed: boolean;
  onClose: () => void;
};

export function WorkflowRunDetailsModal({
  run,
  tasks,
  loading,
  failed,
  onClose,
}: WorkflowRunDetailsModalProps) {
  if (!run) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="workflow-run-details-title"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-neutral-200 bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 pb-4">
          <div>
            <p className="text-sm font-medium text-neutral-500">
              Workflow run
            </p>
            <h2
              id="workflow-run-details-title"
              className="mt-1 text-2xl font-semibold"
            >
              {run.workflow_id}
            </h2>
            <p className="mt-1 break-all text-xs text-neutral-500">{run.id}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100"
          >
            Close
          </button>
        </div>

        <div className="grid gap-4 py-5 sm:grid-cols-3">
          <div className="rounded-md border border-neutral-200 p-4">
            <p className="text-sm text-neutral-500">Status</p>
            <StatusBadge status={run.status} className="mt-2" />
          </div>

          <div className="rounded-md border border-neutral-200 p-4">
            <p className="text-sm text-neutral-500">Created</p>
            <p className="mt-2 text-sm font-medium">
              {new Date(run.created_at).toLocaleString()}
            </p>
          </div>

          <div className="rounded-md border border-neutral-200 p-4">
            <p className="text-sm text-neutral-500">Completed</p>
            <p className="mt-2 text-sm font-medium">
              {run.completed_at
                ? new Date(run.completed_at).toLocaleString()
                : "-"}
            </p>
          </div>
        </div>

        <section>
          <h3 className="text-lg font-semibold">Tasks</h3>

          <div className="mt-3">
            {loading ? (
              <EmptyState
                title="Loading tasks"
                message="Fetching tasks for this workflow run."
              />
            ) : failed ? (
              <EmptyState
                title="Could not load tasks"
                message="Make sure the Go API is running and try again."
              />
            ) : tasks.length === 0 ? (
              <EmptyState
                title="No tasks found"
                message="This workflow run does not have visible tasks yet."
              />
            ) : (
              <div className="overflow-hidden rounded-md border border-neutral-200">
                <div className="grid grid-cols-[1fr_120px] border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-600">
                  <span>Task</span>
                  <span>Status</span>
                </div>

                <div className="divide-y divide-neutral-200">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="grid grid-cols-[1fr_120px] gap-4 px-4 py-4 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-neutral-950">
                          Step {task.step_order}: {task.task_type}
                        </p>
                        <p className="mt-1 break-all text-xs text-neutral-500">
                          {task.id}
                        </p>
                        <div className="mt-3">
                          <TaskDataPanels
                            input={task.payload}
                            output={task.output}
                            outputEmptyMessage="No output was stored."
                          />
                        </div>
                      </div>

                      <div>
                        <StatusBadge status={task.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
