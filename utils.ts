import { clsx, type ClassValue } from "clsx";
import { TaskPriority, TaskStatus, ProjectStatus, ProjectPriority, HealthStatus } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// ---------------------------------------------------------------------------
// Currency — Indian lakh/crore formatting, since contract values & invoice
// targets in this system are always quoted that way.
// ---------------------------------------------------------------------------
export function formatINR(amount: number | string | null | undefined, opts?: { compact?: boolean }) {
  if (amount === null || amount === undefined) return "—";
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(n)) return "—";

  if (opts?.compact) {
    if (Math.abs(n) >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)} Cr`;
    if (Math.abs(n) >= 1_00_000) return `₹${(n / 1_00_000).toFixed(2)} L`;
    return `₹${n.toLocaleString("en-IN")}`;
  }
  return n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
}

// ---------------------------------------------------------------------------
// Due-date classification
// ---------------------------------------------------------------------------
export type DueBucket = "overdue" | "critically_overdue" | "today" | "tomorrow" | "this_week" | "upcoming" | "none";

export function classifyDueDate(dueDate: Date | string | null | undefined): DueBucket {
  if (!dueDate) return "none";
  const due = new Date(dueDate);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diffDays = Math.round((startOfDue.getTime() - startOfToday.getTime()) / 86400000);

  if (diffDays < -3) return "critically_overdue";
  if (diffDays < 0) return "overdue";
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "tomorrow";
  if (diffDays <= 7) return "this_week";
  return "upcoming";
}

export const DUE_BUCKET_LABEL: Record<DueBucket, string> = {
  critically_overdue: "Critically overdue",
  overdue: "Overdue",
  today: "Due today",
  tomorrow: "Due tomorrow",
  this_week: "Due this week",
  upcoming: "Upcoming",
  none: "No due date",
};

// ---------------------------------------------------------------------------
// Task priority — order + color (used for sort order and signal dots)
// ---------------------------------------------------------------------------
export const TASK_PRIORITY_ORDER: TaskPriority[] = ["CRITICAL", "VERY_HIGH", "HIGH", "MEDIUM", "LOW"];

// NOTE: dot/text hold complete Tailwind utility classes (not slugs) so the
// JIT compiler can find them via static analysis of this file.
export const TASK_PRIORITY_META: Record<TaskPriority, { label: string; dot: string; text: string }> = {
  CRITICAL: { label: "Critical", dot: "bg-signal-red", text: "text-signal-red" },
  VERY_HIGH: { label: "Very High", dot: "bg-signal-amber", text: "text-signal-amber" },
  HIGH: { label: "High", dot: "bg-signal-amber", text: "text-signal-amber" },
  MEDIUM: { label: "Medium", dot: "bg-signal-blue", text: "text-signal-blue" },
  LOW: { label: "Low", dot: "bg-ink-dim", text: "text-ink-dim" },
};

export const TASK_STATUS_META: Record<TaskStatus, { label: string; dot: string; text: string }> = {
  NOT_STARTED: { label: "Not Started", dot: "bg-ink-dim", text: "text-ink-dim" },
  PLANNED: { label: "Planned", dot: "bg-ink-dim", text: "text-ink-dim" },
  IN_PROGRESS: { label: "In Progress", dot: "bg-signal-blue", text: "text-signal-blue" },
  WAITING_INPUT: { label: "Waiting — Input", dot: "bg-signal-amber", text: "text-signal-amber" },
  WAITING_CLIENT: { label: "Waiting — Client", dot: "bg-signal-amber", text: "text-signal-amber" },
  WAITING_TEAM: { label: "Waiting — Team", dot: "bg-signal-amber", text: "text-signal-amber" },
  BLOCKED: { label: "Blocked", dot: "bg-signal-red", text: "text-signal-red" },
  SUBMITTED: { label: "Submitted", dot: "bg-signal-violet", text: "text-signal-violet" },
  UNDER_REVIEW: { label: "Under Review", dot: "bg-signal-violet", text: "text-signal-violet" },
  COMPLETED: { label: "Completed", dot: "bg-signal-green", text: "text-signal-green" },
  VERIFIED: { label: "Verified", dot: "bg-signal-green", text: "text-signal-green" },
  REOPENED: { label: "Reopened", dot: "bg-signal-red", text: "text-signal-red" },
  CANCELLED: { label: "Cancelled", dot: "bg-ink-faint", text: "text-ink-faint" },
};

export const PROJECT_STATUS_META: Record<ProjectStatus, { label: string; dot: string; text: string }> = {
  ACTIVE: { label: "Active", dot: "bg-signal-blue", text: "text-signal-blue" },
  UPCOMING: { label: "Upcoming", dot: "bg-ink-dim", text: "text-ink-dim" },
  DELAYED: { label: "Delayed", dot: "bg-signal-amber", text: "text-signal-amber" },
  CRITICAL: { label: "Critical", dot: "bg-signal-red", text: "text-signal-red" },
  COMPLETED: { label: "Completed", dot: "bg-signal-green", text: "text-signal-green" },
  ON_HOLD: { label: "On Hold", dot: "bg-ink-faint", text: "text-ink-faint" },
};

export const PROJECT_PRIORITY_META: Record<ProjectPriority, { label: string; dot: string; text: string }> = {
  CRITICAL: { label: "Critical", dot: "bg-signal-red", text: "text-signal-red" },
  HIGH: { label: "High", dot: "bg-signal-amber", text: "text-signal-amber" },
  MEDIUM: { label: "Medium", dot: "bg-signal-blue", text: "text-signal-blue" },
  LOW: { label: "Low", dot: "bg-ink-dim", text: "text-ink-dim" },
};

export const HEALTH_META: Record<HealthStatus, { label: string; dot: string }> = {
  HEALTHY: { label: "Healthy", dot: "bg-signal-green" },
  WATCH: { label: "Watch", dot: "bg-signal-blue" },
  AT_RISK: { label: "At Risk", dot: "bg-signal-amber" },
  CRITICAL: { label: "Critical", dot: "bg-signal-red" },
};

export const KANBAN_COLUMNS: TaskStatus[] = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "WAITING_CLIENT",
  "SUBMITTED",
  "COMPLETED",
  "VERIFIED",
];

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
