import Link from "next/link";
import { getInvoiceOverviewByProject, getInvoiceCascade } from "@/lib/queries";
import { PageHeading } from "@/components/page-heading";
import { formatINR, cn } from "@/lib/utils";

const MONTH_LABEL = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default async function InvoicePlanningPage({ searchParams }: { searchParams: { project?: string } }) {
  const projects = await getInvoiceOverviewByProject();
  const selectedId = searchParams.project ?? projects.find((p) => p.hasPlan)?.id;
  const cascade = selectedId ? await getInvoiceCascade(selectedId) : null;
  const selectedProject = projects.find((p) => p.id === selectedId);

  return (
    <div>
      <PageHeading title="Invoice Planning" subtitle="Three-year revenue targets, cascaded automatically to quarter and month." />

      <div className="border border-grid rounded overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate/60 text-left text-[11px] uppercase tracking-wide text-ink-faint">
              <th className="px-4 py-2.5 font-medium">Project</th>
              <th className="px-4 py-2.5 font-medium">3-Year Target</th>
              <th className="px-4 py-2.5 font-medium">This Year</th>
              <th className="px-4 py-2.5 font-medium">Achieved</th>
              <th className="px-4 py-2.5 font-medium">Pending</th>
              <th className="px-4 py-2.5 font-medium">Achievement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-grid">
            {projects.map((p) => (
              <tr key={p.id} className={cn("hover:bg-slate/40", p.id === selectedId && "bg-slate/50")}>
                <td className="px-4 py-2.5">
                  {p.hasPlan ? (
                    <Link href={`/invoice-planning?project=${p.id}`} className="text-ink hover:text-signal-blue">
                      {p.name}
                    </Link>
                  ) : (
                    <span className="text-ink-faint">{p.name} <span className="text-[10px]">(no plan yet)</span></span>
                  )}
                </td>
                <td className="px-4 py-2.5 font-mono text-ink-dim">{formatINR(p.threeYearTarget, { compact: true })}</td>
                <td className="px-4 py-2.5 font-mono text-ink-dim">{formatINR(p.annualTarget, { compact: true })}</td>
                <td className="px-4 py-2.5 font-mono text-signal-green">{formatINR(p.actual, { compact: true })}</td>
                <td className="px-4 py-2.5 font-mono text-signal-amber">{formatINR(p.pending, { compact: true })}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2 w-28">
                    <div className="h-1.5 flex-1 rounded-full bg-grid overflow-hidden">
                      <div className="h-full bg-signal-green" style={{ width: `${Math.min(p.achievementPct, 100)}%` }} />
                    </div>
                    <span className="text-xs font-mono text-ink-dim w-9">{p.achievementPct}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {cascade && selectedProject && (
        <section>
          <h2 className="font-display text-base font-semibold text-ink mb-1">
            Cascade — {selectedProject.name}
          </h2>
          <p className="text-xs text-ink-faint font-mono mb-4">
            3-Year Target: {formatINR(cascade.totalTarget.toString(), { compact: true })} from {cascade.startYear}
          </p>

          <div className="space-y-6">
            {cascade.annualTargets.map((annual) => (
              <div key={annual.id} className="border border-grid rounded overflow-hidden">
                <div className="flex items-center justify-between bg-slate/60 px-4 py-2.5">
                  <span className="text-sm font-medium text-ink">{annual.year}</span>
                  <span className="font-mono text-sm text-ink-dim">{formatINR(annual.targetAmount.toString(), { compact: true })}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-grid">
                  {annual.quarterlyTargets.map((q) => (
                    <div key={q.id} className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-ink-dim">Q{q.quarter}</span>
                        <span className="font-mono text-xs text-ink-faint">{formatINR(q.targetAmount.toString(), { compact: true })}</span>
                      </div>
                      <div className="space-y-1">
                        {q.monthlyTargets.map((m) => (
                          <div key={m.id} className="flex items-center justify-between text-xs">
                            <span className="text-ink-faint font-mono">{MONTH_LABEL[m.month - 1]}</span>
                            <span className="text-ink-dim font-mono">{formatINR(m.targetAmount.toString(), { compact: true })}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!cascade && (
        <p className="text-sm text-ink-faint">Select a project above with a defined 3-year plan to see its cascade.</p>
      )}
    </div>
  );
}
