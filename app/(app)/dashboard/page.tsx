import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrgOverview, getFinancialOverview, getAttentionFeed, getProjectsForList } from "@/lib/queries";
import { PageHeading } from "@/components/page-heading";
import { KpiTile } from "@/components/kpi-tile";
import { AttentionFeed } from "@/components/attention-feed";
import { HealthBadge, ProjectPriorityBadge } from "@/components/badges";
import { formatINR } from "@/lib/utils";
import { FolderKanban, AlertOctagon, Clock3, ListChecks, CheckCircle2, ShieldCheck, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const role = session!.user.role;
  const userId = session!.user.id;

  const [attention, projects] = await Promise.all([
    getAttentionFeed({ role, userId }),
    getProjectsForList(),
  ]);

  if (role === "DGM") {
    const [org, financial] = await Promise.all([getOrgOverview(), getFinancialOverview()]);

    return (
      <div>
        <PageHeading
          title="Organization Overview"
          subtitle="Everything that needs a decision, right now."
        />

        {/* Org KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiTile label="Active Projects" value={org.activeProjects} icon={FolderKanban} footnote={`${org.totalProjects} total`} />
          <KpiTile label="Critical Projects" value={org.criticalProjects} icon={AlertOctagon} tone={org.criticalProjects > 0 ? "red" : "default"} />
          <KpiTile label="Delayed Projects" value={org.delayedProjects} icon={Clock3} tone={org.delayedProjects > 0 ? "amber" : "default"} />
          <KpiTile label="Team Members" value={org.totalMembers} icon={ListChecks} />

          <KpiTile label="Overdue Tasks" value={org.overdueTasks} icon={AlertOctagon} tone={org.overdueTasks > 0 ? "red" : "green"} />
          <KpiTile label="Critical Tasks" value={org.criticalTasks} icon={AlertOctagon} tone={org.criticalTasks > 0 ? "red" : "default"} />
          <KpiTile label="Due Today" value={org.dueTodayTasks} icon={Clock3} tone={org.dueTodayTasks > 0 ? "amber" : "default"} />
          <KpiTile label="Awaiting Verification" value={org.awaitingVerification} icon={ShieldCheck} tone={org.awaitingVerification > 0 ? "blue" : "default"} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* What needs attention */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-base font-semibold text-ink">What needs my attention?</h2>
              <span className="text-xs text-ink-faint font-mono">{attention.length} items</span>
            </div>
            <AttentionFeed items={attention} />

            {/* Project portfolio */}
            <div className="flex items-center justify-between mb-3 mt-8">
              <h2 className="font-display text-base font-semibold text-ink">Project Portfolio</h2>
              <Link href="/projects" className="text-xs text-signal-blue hover:underline">
                View all
              </Link>
            </div>
            <div className="border border-grid rounded overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate/60 text-left text-[11px] uppercase tracking-wide text-ink-faint">
                    <th className="px-4 py-2 font-medium">Project</th>
                    <th className="px-4 py-2 font-medium">Priority</th>
                    <th className="px-4 py-2 font-medium">Progress</th>
                    <th className="px-4 py-2 font-medium">Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grid">
                  {projects.slice(0, 6).map((p) => (
                    <tr key={p.id} className="hover:bg-slate/40">
                      <td className="px-4 py-2.5">
                        <Link href={`/projects/${p.id}`} className="block">
                          <div className="text-ink">{p.name}</div>
                          <div className="text-xs text-ink-faint font-mono">{p.code}</div>
                        </Link>
                      </td>
                      <td className="px-4 py-2.5">
                        <ProjectPriorityBadge priority={p.priority} />
                      </td>
                      <td className="px-4 py-2.5 w-40">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 rounded-full bg-grid overflow-hidden">
                            <div className="h-full bg-signal-blue" style={{ width: `${p.progressPercent}%` }} />
                          </div>
                          <span className="text-xs text-ink-dim font-mono w-8">{p.progressPercent}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <HealthBadge status={p.healthStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial overview */}
          <div>
            <h2 className="font-display text-base font-semibold text-ink mb-3">Financial Overview</h2>
            <div className="border border-grid rounded bg-slate/40 p-5 space-y-4">
              <div>
                <span className="text-[11px] uppercase tracking-wide text-ink-faint">Annual Target ({new Date().getFullYear()})</span>
                <div className="font-display text-2xl font-semibold text-ink mt-1">{formatINR(financial.annualTarget, { compact: true })}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wide text-ink-faint">Achieved</span>
                  <div className="text-signal-green font-mono text-sm mt-1">{formatINR(financial.achieved, { compact: true })}</div>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wide text-ink-faint">Pending</span>
                  <div className="text-signal-amber font-mono text-sm mt-1">{formatINR(financial.pending, { compact: true })}</div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-ink-dim">Achievement</span>
                  <span className="font-mono text-ink">{financial.achievementPct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-grid overflow-hidden">
                  <div className="h-full bg-signal-green" style={{ width: `${Math.min(financial.achievementPct, 100)}%` }} />
                </div>
              </div>
              <div className="pt-3 border-t border-grid flex items-center justify-between">
                <span className="text-xs text-ink-dim">This month's target</span>
                <span className="font-mono text-sm text-ink">{formatINR(financial.monthlyTarget, { compact: true })}</span>
              </div>
              <Link href="/invoice-planning" className="flex items-center gap-1.5 text-xs text-signal-blue hover:underline pt-1">
                <TrendingUp size={13} /> Open invoice planning
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------- TEAM VIEW
  return (
    <div>
      <PageHeading title={`Welcome back, ${session!.user.name?.split(" ")[0]}`} subtitle="Here's what's on your plate today." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <KpiTile label="My Open Tasks" value={attention.length} icon={ListChecks} />
        <KpiTile label="Due / Overdue" value={attention.filter((a) => a.kind.includes("overdue") || a.kind === "due_today").length} icon={Clock3} tone="amber" />
        <KpiTile label="Awaiting Verification" value={attention.filter((a) => a.kind === "verification").length} icon={ShieldCheck} tone="blue" />
        <KpiTile label="Active Projects" value={projects.filter((p) => p.status === "ACTIVE").length} icon={FolderKanban} />
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-base font-semibold text-ink">What needs my attention?</h2>
      </div>
      <AttentionFeed items={attention} />

      <div className="mt-8">
        <Link href="/my-work" className="text-sm text-signal-blue hover:underline flex items-center gap-1.5">
          <CheckCircle2 size={14} /> Go to My Work for the full task board
        </Link>
      </div>
    </div>
  );
}
