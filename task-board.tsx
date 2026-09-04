"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TaskPriority, TaskStatus } from "@prisma/client";
import { TaskPriorityBadge, TaskStatusBadge, DueBadge } from "@/components/badges";
import { KANBAN_COLUMNS, TASK_STATUS_META, TASK_PRIORITY_ORDER, TASK_PRIORITY_META, cn } from "@/lib/utils";
import { LayoutList, Columns3, Check, X } from "lucide-react";

type TaskRow = {
  id: string;
  taskCode: string;
  title: string;
  status: TaskStatus;
  dgmPriority: TaskPriority;
  dueDate: string | null;
  verificationStatus: string;
  project: { name: string; code: string };
  assignedTo: { name: string } | null;
};

const STATUS_OPTIONS: TaskStatus[] = [
  "NOT_STARTED", "PLANNED", "IN_PROGRESS", "WAITING_INPUT", "WAITING_CLIENT", "WAITING_TEAM",
  "BLOCKED", "SUBMITTED", "UNDER_REVIEW", "COMPLETED",
];

export function TaskBoard({ tasks, role }: { tasks: TaskRow[]; role: "DGM" | "TEAM_MEMBER" }) {
  const router = useRouter();
  const [view, setView] = useState<"list" | "kanban">("list");
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => tasks.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()) || t.taskCode.toLowerCase().includes(query.toLowerCase())),
    [tasks, query]
  );

  async function patchTask(id: string, payload: Record<string, unknown>) {
    await fetch(`/api/tasks/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    startTransition(() => router.refresh());
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks…"
          className="rounded bg-slate border border-grid px-3 py-1.5 text-sm text-ink placeholder:text-ink-faint focus:border-signal-blue focus:outline-none w-56"
        />
        <div className="flex items-center gap-1 border border-grid rounded p-0.5">
          <button
            onClick={() => setView("list")}
            className={cn("flex items-center gap-1.5 rounded px-2.5 py-1 text-xs", view === "list" ? "bg-slate text-ink" : "text-ink-faint hover:text-ink")}
          >
            <LayoutList size={13} /> List
          </button>
          <button
            onClick={() => setView("kanban")}
            className={cn("flex items-center gap-1.5 rounded px-2.5 py-1 text-xs", view === "kanban" ? "bg-slate text-ink" : "text-ink-faint hover:text-ink")}
          >
            <Columns3 size={13} /> Kanban
          </button>
        </div>
      </div>

      {view === "list" ? (
        <div className="border border-grid rounded overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="bg-slate/60 text-left text-[11px] uppercase tracking-wide text-ink-faint">
                <th className="px-4 py-2.5 font-medium">Task</th>
                <th className="px-4 py-2.5 font-medium">Project</th>
                <th className="px-4 py-2.5 font-medium">Assigned</th>
                <th className="px-4 py-2.5 font-medium">Priority</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Due</th>
                {role === "DGM" && <th className="px-4 py-2.5 font-medium">Verify</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-grid">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate/40">
                  <td className="px-4 py-2.5">
                    <div className="text-ink">{t.title}</div>
                    <div className="text-xs text-ink-faint font-mono">{t.taskCode}</div>
                  </td>
                  <td className="px-4 py-2.5 text-ink-dim text-xs">{t.project.code}</td>
                  <td className="px-4 py-2.5 text-ink-dim">{t.assignedTo?.name ?? "Unassigned"}</td>
                  <td className="px-4 py-2.5">
                    {role === "DGM" ? (
                      <select
                        defaultValue={t.dgmPriority}
                        onChange={(e) => patchTask(t.id, { dgmPriority: e.target.value })}
                        className="bg-transparent text-xs border border-grid rounded px-1.5 py-1 text-ink"
                      >
                        {TASK_PRIORITY_ORDER.map((p) => (
                          <option key={p} value={p} className="bg-slate">
                            {TASK_PRIORITY_META[p].label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <TaskPriorityBadge priority={t.dgmPriority} />
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    {STATUS_OPTIONS.includes(t.status) ? (
                      <select
                        defaultValue={t.status}
                        onChange={(e) => patchTask(t.id, { status: e.target.value })}
                        className="bg-transparent text-xs border border-grid rounded px-1.5 py-1 text-ink"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s} className="bg-slate">
                            {TASK_STATUS_META[s].label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <TaskStatusBadge status={t.status} />
                    )}
                  </td>
                  <td className="px-4 py-2.5"><DueBadge dueDate={t.dueDate} /></td>
                  {role === "DGM" && (
                    <td className="px-4 py-2.5">
                      {t.verificationStatus === "PENDING_VERIFICATION" ? (
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => patchTask(t.id, { verify: "approve" })} className="rounded bg-signal-green/15 text-signal-green p-1 hover:bg-signal-green/25">
                            <Check size={13} />
                          </button>
                          <button onClick={() => patchTask(t.id, { verify: "reject" })} className="rounded bg-signal-red/15 text-signal-red p-1 hover:bg-signal-red/25">
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-ink-faint">—</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-ink-faint text-sm">No tasks match.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <KanbanView tasks={filtered} onDrop={(taskId, status) => patchTask(taskId, { status })} />
      )}
    </div>
  );
}

function KanbanView({ tasks, onDrop }: { tasks: TaskRow[]; onDrop: (taskId: string, status: TaskStatus) => void }) {
  const [dragId, setDragId] = useState<string | null>(null);

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {KANBAN_COLUMNS.map((col) => {
        const items = tasks.filter((t) => t.status === col);
        return (
          <div
            key={col}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (dragId) onDrop(dragId, col);
            }}
            className="w-64 shrink-0 border border-grid rounded bg-slate/30"
          >
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-grid">
              <span className={cn("text-xs font-medium", TASK_STATUS_META[col].text)}>{TASK_STATUS_META[col].label}</span>
              <span className="text-[11px] font-mono text-ink-faint">{items.length}</span>
            </div>
            <div className="p-2 space-y-2 min-h-[80px]">
              {items.map((t) => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={() => setDragId(t.id)}
                  className="rounded border border-grid bg-slate p-2.5 cursor-grab active:cursor-grabbing"
                >
                  <div className="text-xs text-ink leading-snug">{t.title}</div>
                  <div className="flex items-center justify-between mt-2">
                    <TaskPriorityBadge priority={t.dgmPriority} />
                    <span className="text-[10px] font-mono text-ink-faint">{t.project.code}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
