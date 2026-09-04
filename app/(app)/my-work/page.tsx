import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMyWork } from "@/lib/queries";
import { PageHeading } from "@/components/page-heading";
import { KpiTile } from "@/components/kpi-tile";
import { TaskStatusBadge, TaskPriorityBadge, DueBadge } from "@/components/badges";
import { ListChecks, AlertOctagon, ShieldCheck, TrendingUp } from "lucide-react";

const SECTIONS: { key: keyof Awaited<ReturnType<typeof getMyWork>>["buckets"]; label: string }[] = [
  { key: "critical", label: "Critical" },
  { key: "overdue", label: "Overdue" },
  { key: "today", label: "Due Today" },
  { key: "inProgress", label: "In Progress" },
  { key: "waiting", label: "Waiting" },
  { key: "upcoming", label: "Upcoming" },
  { key: "awaitingVerification", label: "Awaiting Verification" },
  { key: "completed", label: "Completed" },
];

export default async function MyWorkPage() {
  const session = await getServerSession(authOptions);
  const data = await getMyWork(session!.user.id);

  return (
    <div>
      <PageHeading title="My Work" subtitle="Your personal task buckets and performance." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <KpiTile label="Assigned" value={data.totalAssigned} icon={ListChecks} />
        <KpiTile label="Overdue" value={data.buckets.overdue.length} icon={AlertOctagon} tone={data.buckets.overdue.length > 0 ? "red" : "green"} />
        <KpiTile label="Awaiting Verification" value={data.buckets.awaitingVerification.length} icon={ShieldCheck} tone="blue" />
        <KpiTile label="Completion Rate" value={`${data.completionRate}%`} icon={TrendingUp} tone="green" />
      </div>

      <div className="space-y-8">
        {SECTIONS.map(({ key, label }) => {
          const items = data.buckets[key];
          if (items.length === 0) return null;
          return (
            <section key={key}>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="font-display text-base font-semibold text-ink">{label}</h2>
                <span className="text-xs text-ink-faint font-mono">{items.length}</span>
              </div>
              <div className="border border-grid rounded bg-slate/40 divide-y divide-grid">
                {items.map((t) => (
                  <div key={t.id} className="flex items-center justify-between px-4 py-2.5 gap-4">
                    <div className="min-w-0">
                      <div className="text-sm text-ink truncate">{t.title}</div>
                      <div className="text-xs text-ink-faint font-mono">{t.project.code} · {t.taskCode}</div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <TaskPriorityBadge priority={t.dgmPriority} />
                      <TaskStatusBadge status={t.status} />
                      <DueBadge dueDate={t.dueDate} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
        {data.totalAssigned === 0 && (
          <p className="text-sm text-ink-faint">No tasks assigned to you yet.</p>
        )}
      </div>
    </div>
  );
}
