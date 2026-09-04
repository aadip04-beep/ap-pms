import { getTeamPerformance } from "@/lib/queries";
import { PageHeading } from "@/components/page-heading";
import { cn } from "@/lib/utils";

const WORKLOAD_STYLE: Record<string, string> = {
  Overloaded: "text-signal-red",
  High: "text-signal-amber",
  Balanced: "text-signal-green",
  Low: "text-ink-dim",
};

export default async function TeamPage() {
  const members = await getTeamPerformance();
  const hoStaff = members.filter((m) => m.department === "HO Staff");
  const fieldStaff = members.filter((m) => m.department === "Field Staff");

  return (
    <div>
      <PageHeading title="Team" subtitle={`${members.length} active team members`} />

      {[{ title: "HO Staff", list: hoStaff }, { title: "Field Staff", list: fieldStaff }].map((group) => (
        <div key={group.title} className="mb-8">
          <h2 className="font-display text-base font-semibold text-ink mb-3">{group.title}</h2>
          <div className="border border-grid rounded overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="bg-slate/60 text-left text-[11px] uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-2.5 font-medium">Name</th>
                  <th className="px-4 py-2.5 font-medium">Role</th>
                  <th className="px-4 py-2.5 font-medium">Open Tasks</th>
                  <th className="px-4 py-2.5 font-medium">Overdue</th>
                  <th className="px-4 py-2.5 font-medium">Completion Rate</th>
                  <th className="px-4 py-2.5 font-medium">Workload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grid">
                {group.list.map((m) => (
                  <tr key={m.id} className="hover:bg-slate/40">
                    <td className="px-4 py-2.5 text-ink">{m.name}</td>
                    <td className="px-4 py-2.5 text-ink-dim">{m.jobTitle}</td>
                    <td className="px-4 py-2.5 text-ink-dim font-mono">{m.open}</td>
                    <td className={cn("px-4 py-2.5 font-mono", m.overdue > 0 ? "text-signal-red" : "text-ink-dim")}>{m.overdue}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2 w-32">
                        <div className="h-1.5 flex-1 rounded-full bg-grid overflow-hidden">
                          <div className="h-full bg-signal-blue" style={{ width: `${m.completionRate}%` }} />
                        </div>
                        <span className="text-xs font-mono text-ink-dim w-8">{m.completionRate}%</span>
                      </div>
                    </td>
                    <td className={cn("px-4 py-2.5 text-xs font-medium", WORKLOAD_STYLE[m.workload])}>{m.workload}</td>
                  </tr>
                ))}
                {group.list.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-ink-faint text-sm">No members.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
