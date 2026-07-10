import {
  createTypedField,
  type FieldValueType,
  type TypedFieldDraft,
} from "@/components/forms/workflow/workflow-form-model";

type TypedFieldsEditorProps = {
  fields: TypedFieldDraft[];
  emptyMessage: string;
  addLabel: string;
  disabled: boolean;
  onChange: (fields: TypedFieldDraft[]) => void;
};

function typedValueDefault(valueType: FieldValueType) {
  switch (valueType) {
    case "number":
      return 0;
    case "boolean":
      return false;
    default:
      return "";
  }
}

export function TypedFieldsEditor({
  fields,
  emptyMessage,
  addLabel,
  disabled,
  onChange,
}: TypedFieldsEditorProps) {
  function updateField(index: number, nextField: TypedFieldDraft) {
    onChange(
      fields.map((field, fieldIndex) =>
        fieldIndex === index ? nextField : field,
      ),
    );
  }

  function removeField(index: number) {
    onChange(fields.filter((_, fieldIndex) => fieldIndex !== index));
  }

  return (
    <div>
      {fields.length === 0 ? (
        <p className="text-sm text-neutral-500">{emptyMessage}</p>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={index}
              className="grid min-w-0 gap-3 border-b border-neutral-200 pb-3 sm:grid-cols-[minmax(0,1fr)_120px_minmax(0,1fr)_auto] sm:items-end"
            >
              <label className="flex min-w-0 flex-col gap-1">
                <span className="text-xs font-medium text-neutral-600">
                  Field name
                </span>
                <input
                  value={field.name}
                  onChange={(event) =>
                    updateField(index, { ...field, name: event.target.value })
                  }
                  disabled={disabled}
                  placeholder="name"
                  className="h-10 min-w-0 rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-950"
                />
              </label>

              <label className="flex min-w-0 flex-col gap-1">
                <span className="text-xs font-medium text-neutral-600">
                  Type
                </span>
                <select
                  value={field.valueType}
                  onChange={(event) => {
                    const valueType = event.target.value as FieldValueType;
                    updateField(index, {
                      ...field,
                      valueType,
                      value: typedValueDefault(valueType),
                    });
                  }}
                  disabled={disabled}
                  className="h-10 min-w-0 rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-950"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                </select>
              </label>

              <label className="flex min-w-0 flex-col gap-1">
                <span className="text-xs font-medium text-neutral-600">
                  Value
                </span>
                {field.valueType === "boolean" ? (
                  <span className="flex h-10 items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 text-sm">
                    <input
                      type="checkbox"
                      checked={field.value === true}
                      onChange={(event) =>
                        updateField(index, {
                          ...field,
                          value: event.target.checked,
                        })
                      }
                      disabled={disabled}
                      className="h-4 w-4 accent-neutral-950"
                    />
                    {field.value === true ? "True" : "False"}
                  </span>
                ) : (
                  <input
                    type={field.valueType === "number" ? "number" : "text"}
                    value={
                      field.valueType === "number"
                        ? Number(field.value)
                        : String(field.value)
                    }
                    onChange={(event) =>
                      updateField(index, {
                        ...field,
                        value:
                          field.valueType === "number"
                            ? event.target.valueAsNumber || 0
                            : event.target.value,
                      })
                    }
                    disabled={disabled}
                    className="h-10 min-w-0 rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-950"
                  />
                )}
              </label>

              <button
                type="button"
                onClick={() => removeField(index)}
                disabled={disabled}
                className="h-10 px-2 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => onChange([...fields, createTypedField()])}
        disabled={disabled}
        className="mt-3 h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
      >
        {addLabel}
      </button>
    </div>
  );
}
