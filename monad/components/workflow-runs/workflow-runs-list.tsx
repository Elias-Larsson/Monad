import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { WorkflowRun } from "@/types/workflow-run";

type WorkflowRunsListProps = {
  runs: WorkflowRun[];
  loading: boolean;
  loadFailed: boolean;
  onSelectRun: (runID: string) => void;
};

export function WorkflowRunsList({
  runs,
  loading,
  loadFailed,
  onSelectRun,
}: WorkflowRunsListProps) {
  if (loading) {
    return (
      <EmptyState
        title="Loading workflow runs"
        message="Fetching recent workflow executions from the API."
      />
    );
  }

  if (loadFailed) {
    return (
      <EmptyState
        title="Could not load workflow runs"
        message="Make sure the Go API is running and NEXT_PUBLIC_API_URL points to it."
      />
    );
  }

  if (runs.length === 0) {
    return (
      <EmptyState
        title="No workflow runs yet"
        message="Start a workflow execution to see it here."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-neutral-200">
      <div className="grid grid-cols-[1fr_120px_160px] border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-600">
        <span>Run</span>
        <span>Status</span>
        <span>Created</span>
      </div>

      <div className="divide-y divide-neutral-200">
        {runs.map((run) => (
          <button
            type="button"
            key={run.id}
            onClick={() => onSelectRun(run.id)}
            className="grid w-full grid-cols-[1fr_120px_160px] gap-4 px-4 py-4 text-left text-sm hover:bg-neutral-50 cursor-pointer"
          >
            <div className="min-w-0">
              <p className="font-medium text-neutral-950">{run.workflow_id}</p>
              <p className="mt-1 truncate text-xs text-neutral-500">
                {run.id}
              </p>
            </div>

            <div>
              <StatusBadge status={run.status} />
            </div>

            <time className="text-xs text-neutral-500">
              {new Date(run.created_at).toLocaleString()}
            </time>
          </button>
        ))}
      </div>
    </div>
  );
}
