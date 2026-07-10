import type { TransformMappingDraft } from "@/components/forms/workflow/workflow-form-model";

type TransformMappingsEditorProps = {
  mappings: TransformMappingDraft[];
  disabled: boolean;
  onChange: (mappings: TransformMappingDraft[]) => void;
};

export function TransformMappingsEditor({
  mappings,
  disabled,
  onChange,
}: TransformMappingsEditorProps) {
  function updateMapping(index: number, nextMapping: TransformMappingDraft) {
    onChange(
      mappings.map((mapping, mappingIndex) =>
        mappingIndex === index ? nextMapping : mapping,
      ),
    );
  }

  return (
    <div>
      <div className="space-y-3">
        {mappings.map((mapping, index) => (
          <div
            key={index}
            className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] sm:items-end"
          >
            <label className="flex min-w-0 flex-col gap-1">
              <span className="text-xs font-medium text-neutral-600">
                Output name
              </span>
              <input
                value={mapping.outputName}
                onChange={(event) =>
                  updateMapping(index, {
                    ...mapping,
                    outputName: event.target.value,
                  })
                }
                disabled={disabled}
                placeholder="title"
                className="h-10 min-w-0 rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-950"
              />
            </label>
            <label className="flex min-w-0 flex-col gap-1">
              <span className="text-xs font-medium text-neutral-600">
                Input path
              </span>
              <input
                value={mapping.inputPath}
                onChange={(event) =>
                  updateMapping(index, {
                    ...mapping,
                    inputPath: event.target.value,
                  })
                }
                disabled={disabled}
                placeholder="body.title (blank uses all input)"
                className="h-10 min-w-0 rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-950"
              />
            </label>
            <button
              type="button"
              onClick={() =>
                onChange(
                  mappings.filter((_, mappingIndex) => mappingIndex !== index),
                )
              }
              disabled={disabled}
              className="h-10 px-2 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() =>
          onChange([...mappings, { outputName: "", inputPath: "" }])
        }
        disabled={disabled}
        className="mt-3 h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
      >
        Add output field
      </button>
    </div>
  );
}
