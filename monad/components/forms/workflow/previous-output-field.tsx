import type { ReactNode } from "react";

import type {
  InputSource,
  OutputPathSuggestion,
} from "@/components/forms/workflow/workflow-form-model";

type PreviousOutputFieldProps = {
  id: string;
  label: string;
  source: InputSource;
  path: string;
  previousStepNumber?: number;
  suggestions: OutputPathSuggestion[];
  pathRequired?: boolean;
  disabled?: boolean;
  onSourceChange: (source: InputSource) => void;
  onPathChange: (path: string) => void;
  children: ReactNode;
};

type PreviousOutputPathInputProps = {
  id: string;
  path: string;
  previousStepNumber: number;
  suggestions: OutputPathSuggestion[];
  pathRequired?: boolean;
  disabled?: boolean;
  onPathChange: (path: string) => void;
};

export function PreviousOutputPathInput({
  id,
  path,
  previousStepNumber,
  suggestions,
  pathRequired = false,
  disabled = false,
  onPathChange,
}: PreviousOutputPathInputProps) {
  const suggestionListID = `${id}-suggestions`;

  return (
    <div>
      <label htmlFor={`${id}-path`} className="sr-only">
        Step {previousStepNumber} output path
      </label>
      <input
        id={`${id}-path`}
        list={suggestions.length > 0 ? suggestionListID : undefined}
        value={path}
        onChange={(event) => onPathChange(event.target.value)}
        placeholder={
          pathRequired
            ? "Choose or enter an output path"
            : "Leave blank to use the complete output"
        }
        required={pathRequired}
        disabled={disabled}
        className="h-10 w-full min-w-0 rounded-md border border-sky-300 bg-sky-50 px-3 text-sm outline-none focus:border-sky-700"
      />
      {suggestions.length > 0 ? (
        <datalist id={suggestionListID}>
          {suggestions.map((suggestion) => (
            <option key={suggestion.path} value={suggestion.path}>
              {suggestion.label}
            </option>
          ))}
        </datalist>
      ) : null}
      <p className="mt-1 text-xs text-neutral-500">
        Reads from step {previousStepNumber}. Nested paths such as body.title
        are supported.
      </p>
    </div>
  );
}

export function PreviousOutputField({
  id,
  label,
  source,
  path,
  previousStepNumber,
  suggestions,
  pathRequired = false,
  disabled = false,
  onSourceChange,
  onPathChange,
  children,
}: PreviousOutputFieldProps) {
  const canUsePreviousOutput = previousStepNumber !== undefined;
  const selectedSource = canUsePreviousOutput ? source : "fixed";

  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">{label}</legend>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm font-medium text-neutral-800">{label}</span>

        {canUsePreviousOutput ? (
          <div
            className="inline-flex w-fit overflow-hidden rounded-md border border-neutral-300 bg-white"
            role="group"
            aria-label={`${label} source`}
          >
            <button
              type="button"
              onClick={() => onSourceChange("fixed")}
              disabled={disabled}
              className={`h-8 px-3 text-xs font-medium ${
                selectedSource === "fixed"
                  ? "bg-neutral-950 text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
              aria-pressed={selectedSource === "fixed"}
            >
              Fixed value
            </button>
            <button
              type="button"
              onClick={() => onSourceChange("previous")}
              disabled={disabled}
              className={`h-8 border-l border-neutral-300 px-3 text-xs font-medium ${
                selectedSource === "previous"
                  ? "bg-sky-700 text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
              aria-pressed={selectedSource === "previous"}
            >
              Previous step
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-2">
        {selectedSource === "fixed" ? (
          children
        ) : (
          <PreviousOutputPathInput
            id={id}
            path={path}
            previousStepNumber={previousStepNumber as number}
            suggestions={suggestions}
            pathRequired={pathRequired}
            disabled={disabled}
            onPathChange={onPathChange}
          />
        )}
      </div>
    </fieldset>
  );
}
