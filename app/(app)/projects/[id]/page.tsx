import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeading } from "@/components/page-heading";
import { ProjectStatusBadge, ProjectPriorityBadge, HealthBadge, TaskStatusBadge, TaskPriorityBadge, DueBadge } from "@/components/badges";
import { formatINR } from "@/lib/utils";
import { AlertTriangle, CircleDot } from "lucide-react";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      projectManager: { select: { name: true } },
      members: { include: { user: { select: { name: true, department: true } } } },
      tasks: {
        include: { assignedTo: { select: { name: true } } },
        orderBy: [{ dgmPriority: "asc" }, { dueDate: "asc" }],
      },
      milestones: { orderBy: { dueDate: "asc" } },
      risks: { include: { owner: { select: { name: true } } } },
      issues: { include: { owner: { select: { name: true } } } },
      threeYearPlans: {
        include: { annualTargets: true },
      },
      invoiceActuals: true,
    },
  });

  if (!project) notFound();

  const totalActual = project.invoiceActuals.reduce((sum, a) => sum + Number(a.amount), 0);
  const totalTarget = project.threeYearPlans.reduce((sum, p) => sum + Number(p.totalTarget), 0);

  const openTasks = project.tasks.filter((t) => !["COMPLETED", "VERIFIED", "CANCELLED"].includes(t.status));
  const overdueTasks = project.tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && !["COMPLETED", "VERIFIED", "CANCELLED"].includes(t.status));

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-ink-faint font-mono mb-2">{project.code}</div>
      <PageHeading
        title={project.name}
        subtitle={`${project.client ?? "—"} · ${project.authorityDepartment ?? "—"} · ${project.location ?? "—"}`}
        actions={
          <>
            <ProjectStatusBadge status={project.status} />
            <ProjectPriorityBadge priority={project.priority} />
          </>
        }
      />

      {/* Overview strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <div className="border border-grid rounded bg-slate/40 px-4 py-3">
          <div className="text-[11px] uppercase tracking-wide text-ink-faint">Progress</div>
          <div className="font-display text-xl font-semibold text-ink mt-1">{project.progressPercent}%</div>
        </div>
        <div className="border border-grid rounded bg-slate/40 px-4 py-3">
          <div className="text-[11px] uppercase tracking-wide text-ink-faint">Health</div>
          <div className="mt-2"><HealthBadge status={project.healthStatus} /></div>
        </div>
        <div className="border border-grid rounded bg-slate/40 px-4 py-3">
          <div className="text-[11px] uppercase tracking-wide text-ink-faint">Contract Value</div>
          <div className="font-mono text-sm text-ink mt-2">{formatINR(project.contractValue?.toString(), { compact: true })}</div>
        </div>
        <div className="border border-grid rounded bg-slate/40 px-4 py-3">
          <div className="text-[11px] uppercase tracking-wide text-ink-faint">Open Tasks</div>
          <div className="font-display text-xl font-semibold text-ink mt-1">{openTasks.length}</div>
        </div>
        <div className="border border-grid rounded bg-slate/40 px-4 py-3">
          <div className="text-[11px] uppercase tracking-wide text-ink-faint">Overdue</div>
          <div className={`font-display text-xl font-semibold mt-1 ${overdueTasks.length > 0 ? "text-signal-red" : "text-ink"}`}>{overdueTasks.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-8">
          {/* Tasks */}
          <section>
            <h2 className="font-display text-base font-semibold text-ink mb-3">Tasks</h2>
            <div className="border border-grid rounded overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate/60 text-left text-[11px] uppercase tracking-wide text-ink-faint">
                    <th className="px-4 py-2 font-medium">Task</th>
                    <th className="px-4 py-2 font-medium">Assigned</th>
                    <th className="px-4 py-2 font-medium">Priority</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium">Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grid">
                  {project.tasks.map((t) => (
                    <tr key={t.id} className="hover:bg-slate/40">
                      <td className="px-4 py-2.5">
                        <div className="text-ink">{t.title}</div>
                        <div className="text-xs text-ink-faint font-mono">{t.taskCode}</div>
                      </td>
                      <td className="px-4 py-2.5 text-ink-dim">{t.assignedTo?.name ?? "Unassigned"}</td>
                      <td className="px-4 py-2.5"><TaskPriorityBadge priority={t.dgmPriority} /></td>
                      <td className="px-4 py-2.5"><TaskStatusBadge status={t.status} /></td>
                      <td className="px-4 py-2.5"><DueBadge dueDate={t.dueDate} /></td>
                    </tr>
                  ))}
                  {project.tasks.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-ink-faint text-sm">No tasks yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Milestones */}
          <section>
            <h2 className="font-display text-base font-semibold text-ink mb-3">Milestones</h2>
            {project.milestones.length === 0 ? (
              <p className="text-sm text-ink-faint">No milestones defined.</p>
            ) : (
              <div className="border border-grid rounded bg-slate/40 divide-y divide-grid">
                {project.milestones.map((m) => (
                  <div key={m.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <CircleDot size={14} className={m.status === "ACHIEVED" ? "text-signal-green" : "text-ink-faint"} />
                      <span className="text-sm text-ink">{m.title}</span>
                    </div>
                    <span className="text-xs font-mono text-ink-dim">{new Date(m.dueDate).toLocaleDateString("en-IN")}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Risks & Issues */}
          <section>
            <h2 className="font-display text-base font-semibold text-ink mb-3">Risks &amp; Issues</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-grid rounded bg-slate/40 p-4">
                <div className="text-xs uppercase tracking-wide text-ink-faint mb-2">Risks</div>
                {project.risks.length === 0 ? (
                  <p className="text-sm text-ink-faint">No open risks.</p>
                ) : (
                  <ul className="space-y-2">
                    {project.risks.map((r) => (
                      <li key={r.id} className="flex items-start gap-2 text-sm">
                        <AlertTriangle size={14} className="mt-0.5 text-signal-amber shrink-0" />
                        <span className="text-ink-dim">{r.title}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="border border-grid rounded bg-slate/40 p-4">
                <div className="text-xs uppercase tracking-wide text-ink-faint mb-2">Issues</div>
                {project.issues.length === 0 ? (
                  <p className="text-sm text-ink-faint">No open issues.</p>
                ) : (
                  <ul className="space-y-2">
                    {project.issues.map((i) => (
                      <li key={i.id} className="flex items-start gap-2 text-sm">
                        <AlertTriangle size={14} className="mt-0.5 text-signal-red shrink-0" />
                        <span className="text-ink-dim">{i.title}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          {/* Team */}
          <section>
            <h2 className="font-display text-base font-semibold text-ink mb-3">Team</h2>
            <div className="border border-grid rounded bg-slate/40 divide-y divide-grid">
              {project.members.map((m) => (
                <div key={m.id} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-sm text-ink">{m.user.name}</span>
                  <span className="text-xs text-ink-faint">{m.roleOnProject}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Invoice snapshot */}
          <section>
            <h2 className="font-display text-base font-semibold text-ink mb-3">Invoice Snapshot</h2>
            <div className="border border-grid rounded bg-slate/40 p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-dim">3-Year Target</span>
                <span className="font-mono text-ink">{formatINR(totalTarget, { compact: true })}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-dim">Invoiced to date</span>
                <span className="font-mono text-signal-green">{formatINR(totalActual, { compact: true })}</span>
              </div>
              <div className="h-1.5 rounded-full bg-grid overflow-hidden">
                <div
                  className="h-full bg-signal-green"
                  style={{ width: `${totalTarget > 0 ? Math.min((totalActual / totalTarget) * 100, 100) : 0}%` }}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
