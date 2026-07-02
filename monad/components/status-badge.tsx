type Status = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";

function statusClassName(status: Status) {
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

type StatusBadgeProps = {
  status: Status;
  className?: string;
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded px-2 py-1 text-xs font-medium ring-1 ${statusClassName(
        status,
      )} ${className}`}
    >
      {status}
    </span>
  );
}
