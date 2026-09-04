import type { TaskStatus, TaskPriority, ProjectStatus, ProjectPriority, HealthStatus } from "@prisma/client";
import {
  TASK_STATUS_META,
  TASK_PRIORITY_META,
  PROJECT_STATUS_META,
  PROJECT_PRIORITY_META,
  HEALTH_META,
  classifyDueDate,
  DUE_BUCKET_LABEL,
  cn,
} from "@/lib/utils";

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const meta = TASK_STATUS_META[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", meta.text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  const meta = TASK_PRIORITY_META[priority];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", meta.text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot, priority === "CRITICAL" && "animate-pulse-dot")} />
      {meta.label}
    </span>
  );
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const meta = PROJECT_STATUS_META[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded border border-grid px-2 py-0.5 text-xs font-medium", meta.text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}

export function ProjectPriorityBadge({ priority }: { priority: ProjectPriority }) {
  const meta = PROJECT_PRIORITY_META[priority];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", meta.text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}

export function HealthBadge({ status }: { status: HealthStatus }) {
  const meta = HEALTH_META[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-dim">
      <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}

export function DueBadge({ dueDate }: { dueDate: Date | string | null | undefined }) {
  const bucket = classifyDueDate(dueDate);
  const styles: Record<string, string> = {
    critically_overdue: "text-signal-red",
    overdue: "text-signal-red",
    today: "text-signal-amber",
    tomorrow: "text-signal-amber",
    this_week: "text-ink-dim",
    upcoming: "text-ink-dim",
    none: "text-ink-faint",
  };
  return <span className={cn("text-xs font-mono", styles[bucket])}>{DUE_BUCKET_LABEL[bucket]}</span>;
}
