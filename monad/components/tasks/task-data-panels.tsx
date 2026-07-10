type TaskDataPanelsProps = {
  input: unknown;
  output: unknown;
  outputEmptyMessage: string;
};

function hasContent(value: unknown) {
  if (value === null || value === undefined) {
    return false;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (typeof value === "object") {
    return Object.keys(value).length > 0;
  }

  return true;
}

export function TaskDataPanels({
  input,
  output,
  outputEmptyMessage,
}: TaskDataPanelsProps) {
  return (
    <div className="grid min-w-0 gap-3 lg:grid-cols-2">
      <div className="min-w-0 rounded-md border border-sky-200 bg-sky-50">
        <div className="border-b border-sky-200 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">
            Input
          </p>
          <p className="mt-1 text-xs text-sky-700">
            Payload sent to the worker.
          </p>
        </div>
        <pre className="max-h-72 overflow-auto p-3 text-xs text-sky-950">
          {JSON.stringify(input, null, 2)}
        </pre>
      </div>

      <div className="min-w-0 rounded-md border border-emerald-200 bg-emerald-50">
        <div className="border-b border-emerald-200 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
            Output
          </p>
          <p className="mt-1 text-xs text-emerald-700">
            Result stored by the worker.
          </p>
        </div>

        {hasContent(output) ? (
          <pre className="max-h-72 overflow-auto p-3 text-xs text-emerald-950">
            {JSON.stringify(output, null, 2)}
          </pre>
        ) : (
          <div className="p-3 text-xs text-emerald-800">
            {outputEmptyMessage}
          </div>
        )}
      </div>
    </div>
  );
}
