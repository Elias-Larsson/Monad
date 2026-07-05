"use client";

import { useRouter } from "next/navigation";

import { Workflow } from "@/types/workflow";

type Props = {
  workflows: Workflow[];
  deletingWorkflowID?: string;
  onDelete?: (id: string) => void;
};

export function WorkflowsList(props: Props) {
  const { workflows, deletingWorkflowID = "", onDelete } = props;
  const router = useRouter();
  const showActions = Boolean(onDelete);

  function runWorkflow(id: string) {
    router.push(`/workflows/${id}/run?start=${crypto.randomUUID()}`);
  }

  return (
    <div className="overflow-hidden rounded-md border border-neutral-200">
      <div
        className={`grid border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-600 ${
          showActions ? "grid-cols-[1fr_180px_160px]" : "grid-cols-[1fr_180px]"
        }`}
      >
        <span>Workflow</span>
        <span>Created</span>
        {showActions ? <span>Actions</span> : null}
      </div>

      <div className="divide-y divide-neutral-200">
        {workflows.map((workflow) => (
          <div
            key={workflow.id}
            className={`grid gap-4 px-4 py-4 text-sm ${
              showActions
                ? "grid-cols-[1fr_180px_160px]"
                : "grid-cols-[1fr_180px]"
            }`}
          >
            <div className="min-w-0">
              <p className="font-medium text-neutral-950">{workflow.name}</p>
              <p className="mt-1 truncate text-xs text-neutral-500">
                {workflow.id}
              </p>
            </div>

            <time className="text-xs text-neutral-500">
              {new Date(workflow.created_at).toLocaleString()}
            </time>

            {showActions ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => runWorkflow(workflow.id)}
                  className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                >
                  Run
                </button>

                {onDelete ? (
                  <button
                    type="button"
                    onClick={() => onDelete(workflow.id)}
                    disabled={deletingWorkflowID === workflow.id}
                    className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingWorkflowID === workflow.id ? "Deleting" : "Delete"}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
