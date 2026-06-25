import { getTasks } from "@/api/axios";
import { Task } from "@/types/tasks";

function statusClassName(status: Task["status"]) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "RUNNING":
      return "bg-blue-50 text-blue-700 ring-blue-200";
    case "FAILED":
      return "bg-red-50 text-red-700 ring-red-200";
    default:
      return "bg-neutral-100 text-neutral-700 ring-neutral-200";
  }
}

export async function TasksList() {
  let tasks: Task[] = [];
  let loadFailed = false;

  try {
    tasks = await getTasks();
  } catch {
    loadFailed = true;
  }

  return loadFailed || tasks.length === 0 ? (
    <div className="rounded-md border border-dashed border-neutral-300 p-8 text-center">
      <h2 className="text-base font-semibold">
        {loadFailed ? "Could not load tasks" : "No tasks yet"}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
        {loadFailed
          ? "Make sure the Go API is running and NEXT_PUBLIC_API_URL points to it."
          : "Run a workflow to create your first queued task."}
      </p>
    </div>
  ) : (
    <div className="overflow-hidden rounded-md border border-neutral-200">
      <div className="grid grid-cols-[1fr_140px_140px] border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-600">
        <span>Task</span>
        <span>Status</span>
        <span>Created</span>
      </div>

      <div className="divide-y divide-neutral-200">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="grid grid-cols-[1fr_140px_140px] gap-4 px-4 py-4 text-sm"
          >
            <div className="min-w-0">
              <p className="font-medium text-neutral-950">{task.task_type}</p>
              <p className="mt-1 truncate text-xs text-neutral-500">
                {task.id}
              </p>
              <pre className="mt-2 overflow-x-auto rounded border border-neutral-200 bg-neutral-50 p-2 text-xs text-neutral-600">
                {JSON.stringify(task.payload, null, 2)}
              </pre>
            </div>

            <div>
              <span
                className={`inline-flex rounded px-2 py-1 text-xs font-medium ring-1 ${statusClassName(
                  task.status,
                )}`}
              >
                {task.status}
              </span>
            </div>

            <time className="text-xs text-neutral-500">
              {new Date(task.created_at).toLocaleString()}
            </time>
          </div>
        ))}
      </div>
    </div>
  );
}
