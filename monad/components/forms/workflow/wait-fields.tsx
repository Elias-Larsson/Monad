import { PreviousOutputField } from "@/components/forms/workflow/previous-output-field";
import type {
  OutputPathSuggestion,
  WaitStepDraft,
} from "@/components/forms/workflow/workflow-form-model";

type WaitFieldsProps = {
  step: WaitStepDraft;
  index: number;
  suggestions: OutputPathSuggestion[];
  disabled: boolean;
  onChange: (step: WaitStepDraft) => void;
};

export function WaitFields({
  step,
  index,
  suggestions,
  disabled,
  onChange,
}: WaitFieldsProps) {
  return (
    <PreviousOutputField
      id={`step-${index + 1}-seconds`}
      label="Seconds"
      source={step.seconds.source}
      path={step.seconds.path}
      previousStepNumber={index > 0 ? index : undefined}
      suggestions={suggestions}
      pathRequired
      disabled={disabled}
      onSourceChange={(source) =>
        onChange({ ...step, seconds: { ...step.seconds, source } })
      }
      onPathChange={(path) =>
        onChange({ ...step, seconds: { ...step.seconds, path } })
      }
    >
      <input
        type="number"
        min={0}
        value={step.seconds.value}
        onChange={(event) =>
          onChange({
            ...step,
            seconds: {
              ...step.seconds,
              value: event.target.valueAsNumber || 0,
            },
          })
        }
        disabled={disabled}
        className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-950"
      />
    </PreviousOutputField>
  );
}
