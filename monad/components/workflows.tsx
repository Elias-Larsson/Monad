import { Workflow } from "@/types/workflow";
type Props = {
  workflows: Workflow[];
};
export function WorkflowsList(props: Props) {
  const workflows = props.workflows;
  return (
    <div className="overflow-hidden rounded-md border border-neutral-200">
      <div className="grid grid-cols-[1fr_180px] border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-600">
        <span>Workflow</span>
        <span>Created</span>
      </div>

      <div className="divide-y divide-neutral-200">
        {workflows.map((workflow) => (
          <div
            key={workflow.id}
            className="grid grid-cols-[1fr_180px] gap-4 px-4 py-4 text-sm"
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
          </div>
        ))}
      </div>
    </div>
  );
}
