import type { HeaderDraft } from "@/components/forms/workflow/workflow-form-model";

type HeadersEditorProps = {
  headers: HeaderDraft[];
  disabled: boolean;
  onChange: (headers: HeaderDraft[]) => void;
};

export function HeadersEditor({
  headers,
  disabled,
  onChange,
}: HeadersEditorProps) {
  function updateHeader(index: number, nextHeader: HeaderDraft) {
    onChange(
      headers.map((header, headerIndex) =>
        headerIndex === index ? nextHeader : header,
      ),
    );
  }

  return (
    <div>
      <div className="space-y-3">
        {headers.map((header, index) => (
          <div
            key={index}
            className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] sm:items-end"
          >
            <label className="flex min-w-0 flex-col gap-1">
              <span className="text-xs font-medium text-neutral-600">Name</span>
              <input
                value={header.name}
                onChange={(event) =>
                  updateHeader(index, { ...header, name: event.target.value })
                }
                disabled={disabled}
                placeholder="Authorization"
                className="h-10 min-w-0 rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-950"
              />
            </label>
            <label className="flex min-w-0 flex-col gap-1">
              <span className="text-xs font-medium text-neutral-600">Value</span>
              <input
                value={header.value}
                onChange={(event) =>
                  updateHeader(index, { ...header, value: event.target.value })
                }
                disabled={disabled}
                placeholder="Bearer token"
                className="h-10 min-w-0 rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-950"
              />
            </label>
            <button
              type="button"
              onClick={() =>
                onChange(
                  headers.filter((_, headerIndex) => headerIndex !== index),
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
        onClick={() => onChange([...headers, { name: "", value: "" }])}
        disabled={disabled}
        className="mt-3 h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
      >
        Add header
      </button>
    </div>
  );
}
