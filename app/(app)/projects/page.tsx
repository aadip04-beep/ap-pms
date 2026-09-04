import Link from "next/link";
import { getProjectsForList } from "@/lib/queries";
import { PageHeading } from "@/components/page-heading";
import { ProjectStatusBadge, ProjectPriorityBadge, HealthBadge } from "@/components/badges";
import { formatINR } from "@/lib/utils";

export default async function ProjectsPage({ searchParams }: { searchParams: { status?: string } }) {
  const projects = await getProjectsForList();
  const statusFilter = searchParams.status;
  const filtered = statusFilter ? projects.filter((p) => p.status === statusFilter) : projects;

  const statuses = ["ACTIVE", "CRITICAL", "DELAYED", "UPCOMING", "ON_HOLD", "COMPLETED"];

  return (
    <div>
      <PageHeading title="Projects" subtitle={`${projects.length} projects in the portfolio`} />

      <div className="flex items-center gap-2 mb-5 overflow-x-auto">
        <Link
          href="/projects"
          className={`shrink-0 rounded px-3 py-1.5 text-xs font-medium border ${!statusFilter ? "border-signal-blue text-signal-blue bg-signal-blue/10" : "border-grid text-ink-dim hover:text-ink"}`}
        >
          All
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/projects?status=${s}`}
            className={`shrink-0 rounded px-3 py-1.5 text-xs font-medium border ${statusFilter === s ? "border-signal-blue text-signal-blue bg-signal-blue/10" : "border-grid text-ink-dim hover:text-ink"}`}
          >
            {s.replace("_", " ")}
          </Link>
        ))}
      </div>

      <div className="border border-grid rounded overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="bg-slate/60 text-left text-[11px] uppercase tracking-wide text-ink-faint">
              <th className="px-4 py-2.5 font-medium">Project</th>
              <th className="px-4 py-2.5 font-medium">Client / Authority</th>
              <th className="px-4 py-2.5 font-medium">Manager</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Priority</th>
              <th className="px-4 py-2.5 font-medium">Progress</th>
              <th className="px-4 py-2.5 font-medium">Health</th>
              <th className="px-4 py-2.5 font-medium">Contract Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-grid">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate/40">
                <td className="px-4 py-3">
                  <Link href={`/projects/${p.id}`}>
                    <div className="text-ink">{p.name}</div>
                    <div className="text-xs text-ink-faint font-mono">{p.code} · {p._count.tasks} tasks</div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-dim">
                  <div>{p.client ?? "—"}</div>
                  <div className="text-xs text-ink-faint">{p.authorityDepartment}</div>
                </td>
                <td className="px-4 py-3 text-ink-dim">{p.projectManager?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <ProjectStatusBadge status={p.status} />
                </td>
                <td className="px-4 py-3">
                  <ProjectPriorityBadge priority={p.priority} />
                </td>
                <td className="px-4 py-3 w-36">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-grid overflow-hidden">
                      <div className="h-full bg-signal-blue" style={{ width: `${p.progressPercent}%` }} />
                    </div>
                    <span className="text-xs text-ink-dim font-mono w-8">{p.progressPercent}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <HealthBadge status={p.healthStatus} />
                </td>
                <td className="px-4 py-3 font-mono text-ink-dim">{formatINR(p.contractValue?.toString(), { compact: true })}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-ink-faint text-sm">
                  No projects in this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
