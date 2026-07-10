import { PreviousOutputField } from "@/components/forms/workflow/previous-output-field";
import type {
  OutputPathSuggestion,
  PrintMessageStepDraft,
} from "@/components/forms/workflow/workflow-form-model";

type PrintMessageFieldsProps = {
  step: PrintMessageStepDraft;
  index: number;
  suggestions: OutputPathSuggestion[];
  disabled: boolean;
  onChange: (step: PrintMessageStepDraft) => void;
};

export function PrintMessageFields({
  step,
  index,
  suggestions,
  disabled,
  onChange,
}: PrintMessageFieldsProps) {
  return (
    <PreviousOutputField
      id={`step-${index + 1}-message`}
      label="Message"
      source={step.message.source}
      path={step.message.path}
      previousStepNumber={index > 0 ? index : undefined}
      suggestions={suggestions}
      pathRequired
      disabled={disabled}
      onSourceChange={(source) =>
        onChange({ ...step, message: { ...step.message, source } })
      }
      onPathChange={(path) =>
        onChange({ ...step, message: { ...step.message, path } })
      }
    >
      <input
        value={step.message.value}
        onChange={(event) =>
          onChange({
            ...step,
            message: { ...step.message, value: event.target.value },
          })
        }
        disabled={disabled}
        placeholder="hello from Monad"
        className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-950"
      />
    </PreviousOutputField>
  );
}
