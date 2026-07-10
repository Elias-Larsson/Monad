import { PreviousOutputField } from "@/components/forms/workflow/previous-output-field";
import { TransformMappingsEditor } from "@/components/forms/workflow/transform-mappings-editor";
import { TypedFieldsEditor } from "@/components/forms/workflow/typed-fields-editor";
import type {
  JsonTransformStepDraft,
  OutputPathSuggestion,
} from "@/components/forms/workflow/workflow-form-model";

type JsonTransformFieldsProps = {
  step: JsonTransformStepDraft;
  index: number;
  suggestions: OutputPathSuggestion[];
  disabled: boolean;
  onChange: (step: JsonTransformStepDraft) => void;
};

export function JsonTransformFields({
  step,
  index,
  suggestions,
  disabled,
  onChange,
}: JsonTransformFieldsProps) {
  return (
    <div className="space-y-5">
      <PreviousOutputField
        id={`step-${index + 1}-transform-input`}
        label="Input data"
        source={step.input.source}
        path={step.input.path}
        previousStepNumber={index > 0 ? index : undefined}
        suggestions={suggestions}
        disabled={disabled}
        onSourceChange={(source) =>
          onChange({ ...step, input: { ...step.input, source } })
        }
        onPathChange={(path) =>
          onChange({ ...step, input: { ...step.input, path } })
        }
      >
        <TypedFieldsEditor
          fields={step.input.value}
          emptyMessage="No fixed input fields yet."
          addLabel="Add input field"
          disabled={disabled}
          onChange={(value) =>
            onChange({ ...step, input: { ...step.input, value } })
          }
        />
      </PreviousOutputField>

      <div>
        <div>
          <h4 className="text-sm font-medium text-neutral-800">
            Output mappings
          </h4>
          <p className="mt-1 text-xs text-neutral-500">
            Give each output field a name and choose where its value comes from
            inside the input.
          </p>
        </div>
        <div className="mt-3">
          <TransformMappingsEditor
            mappings={step.mappings}
            disabled={disabled}
            onChange={(mappings) => onChange({ ...step, mappings })}
          />
        </div>
      </div>
    </div>
  );
}
