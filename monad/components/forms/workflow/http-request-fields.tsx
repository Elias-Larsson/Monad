import { HeadersEditor } from "@/components/forms/workflow/headers-editor";
import {
  PreviousOutputField,
  PreviousOutputPathInput,
} from "@/components/forms/workflow/previous-output-field";
import { TypedFieldsEditor } from "@/components/forms/workflow/typed-fields-editor";
import type {
  HttpRequestStepDraft,
  OutputPathSuggestion,
} from "@/components/forms/workflow/workflow-form-model";

type HttpRequestFieldsProps = {
  step: HttpRequestStepDraft;
  index: number;
  suggestions: OutputPathSuggestion[];
  disabled: boolean;
  onChange: (step: HttpRequestStepDraft) => void;
};

export function HttpRequestFields({
  step,
  index,
  suggestions,
  disabled,
  onChange,
}: HttpRequestFieldsProps) {
  const canUsePreviousOutput = index > 0;
  const bodySourceOptions: Array<{
    value: HttpRequestStepDraft["bodySource"];
    label: string;
  }> = [
    { value: "none", label: "None" },
    { value: "fixed", label: "Fields" },
  ];
  if (canUsePreviousOutput) {
    bodySourceOptions.push({ value: "previous", label: "Previous step" });
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-[150px_minmax(0,1fr)]">
        <label className="flex min-w-0 flex-col gap-2">
          <span className="text-sm font-medium text-neutral-800">Method</span>
          <select
            value={step.method}
            onChange={(event) =>
              onChange({ ...step, method: event.target.value })
            }
            disabled={disabled}
            className="h-10 min-w-0 rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-950"
          >
            {["GET", "POST", "PUT", "PATCH", "DELETE"].map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </label>

        <PreviousOutputField
          id={`step-${index + 1}-url`}
          label="URL"
          source={step.url.source}
          path={step.url.path}
          previousStepNumber={canUsePreviousOutput ? index : undefined}
          suggestions={suggestions}
          pathRequired
          disabled={disabled}
          onSourceChange={(source) =>
            onChange({ ...step, url: { ...step.url, source } })
          }
          onPathChange={(path) =>
            onChange({ ...step, url: { ...step.url, path } })
          }
        >
          <input
            type="url"
            value={step.url.value}
            onChange={(event) =>
              onChange({
                ...step,
                url: { ...step.url, value: event.target.value },
              })
            }
            disabled={disabled}
            placeholder="https://api.example.com/items"
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-950"
          />
        </PreviousOutputField>
      </div>

      <div>
        <h4 className="text-sm font-medium text-neutral-800">Headers</h4>
        <div className="mt-2">
          <HeadersEditor
            headers={step.headers}
            disabled={disabled}
            onChange={(headers) => onChange({ ...step, headers })}
          />
        </div>
      </div>

      <div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="text-sm font-medium text-neutral-800">Request body</h4>
          <div
            className="inline-flex w-fit overflow-hidden rounded-md border border-neutral-300 bg-white"
            role="group"
            aria-label="Request body source"
          >
            {bodySourceOptions.map((option, optionIndex) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ ...step, bodySource: option.value })}
                disabled={disabled}
                className={`h-8 px-3 text-xs font-medium ${
                  optionIndex > 0 ? "border-l border-neutral-300" : ""
                } ${
                  step.bodySource === option.value
                    ? "bg-neutral-950 text-white"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
                aria-pressed={step.bodySource === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-2">
          {step.bodySource === "fixed" ? (
            <TypedFieldsEditor
              fields={step.bodyFields}
              emptyMessage="No request body fields yet."
              addLabel="Add body field"
              disabled={disabled}
              onChange={(bodyFields) => onChange({ ...step, bodyFields })}
            />
          ) : step.bodySource === "previous" && canUsePreviousOutput ? (
            <PreviousOutputPathInput
              id={`step-${index + 1}-body`}
              path={step.bodyPath}
              previousStepNumber={index}
              suggestions={suggestions}
              disabled={disabled}
              onPathChange={(bodyPath) => onChange({ ...step, bodyPath })}
            />
          ) : (
            <p className="text-sm text-neutral-500">
              This request will not include a body.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
