import { HttpRequestFields } from "@/components/forms/workflow/http-request-fields";
import { JsonTransformFields } from "@/components/forms/workflow/json-transform-fields";
import { PrintMessageFields } from "@/components/forms/workflow/print-message-fields";
import { WaitFields } from "@/components/forms/workflow/wait-fields";
import {
  createWorkflowStepDraft,
  outputPathSuggestions,
  taskTypeLabels,
  workflowStepPayload,
  type WorkflowStepDraft,
} from "@/components/forms/workflow/workflow-form-model";
import { taskTypes, type TaskType } from "@/constants/tasks";

type WorkflowStepEditorProps = {
  step: WorkflowStepDraft;
  index: number;
  previousStep?: WorkflowStepDraft;
  canRemove: boolean;
  disabled: boolean;
  onChange: (step: WorkflowStepDraft) => void;
  onRemove: () => void;
};

export function WorkflowStepEditor({
  step,
  index,
  previousStep,
  canRemove,
  disabled,
  onChange,
  onRemove,
}: WorkflowStepEditorProps) {
  const suggestions = outputPathSuggestions(previousStep);

  return (
    <section className="py-6 first:pt-4 last:pb-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <label className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="text-sm font-semibold text-neutral-950">
            Step {index + 1}
          </span>
          <select
            value={step.taskType}
            onChange={(event) =>
              onChange(
                createWorkflowStepDraft(
                  event.target.value as TaskType,
                  index > 0,
                ),
              )
            }
            disabled={disabled}
            className="h-10 min-w-0 rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-950 sm:max-w-xs"
          >
            {taskTypes.map((taskType) => (
              <option key={taskType} value={taskType}>
                {taskTypeLabels[taskType]}
              </option>
            ))}
          </select>
        </label>

        {canRemove ? (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="h-10 w-fit px-2 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            Remove step
          </button>
        ) : null}
      </div>

      <div className="mt-5">
        {step.taskType === "print-message" ? (
          <PrintMessageFields
            step={step}
            index={index}
            suggestions={suggestions}
            disabled={disabled}
            onChange={onChange}
          />
        ) : step.taskType === "wait" ? (
          <WaitFields
            step={step}
            index={index}
            suggestions={suggestions}
            disabled={disabled}
            onChange={onChange}
          />
        ) : step.taskType === "http-request" ? (
          <HttpRequestFields
            step={step}
            index={index}
            suggestions={suggestions}
            disabled={disabled}
            onChange={onChange}
          />
        ) : (
          <JsonTransformFields
            step={step}
            index={index}
            suggestions={suggestions}
            disabled={disabled}
            onChange={onChange}
          />
        )}
      </div>

      <details className="mt-5 border-t border-neutral-200 pt-3">
        <summary className="cursor-pointer text-xs font-medium text-neutral-500 hover:text-neutral-800">
          Generated payload preview
        </summary>
        <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-neutral-950 p-3 text-xs text-neutral-100">
          {JSON.stringify(workflowStepPayload(step), null, 2)}
        </pre>
      </details>
    </section>
  );
}
