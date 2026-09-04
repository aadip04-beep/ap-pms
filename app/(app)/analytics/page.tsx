import { PageHeading } from "@/components/page-heading";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeading title="Analytics" subtitle="Delay prediction, health scoring and risk indicators." />
      <div className="border border-grid rounded bg-slate/40 px-6 py-16 text-center">
        <BarChart3 size={28} className="mx-auto text-ink-faint mb-3" strokeWidth={1.5} />
        <p className="text-sm text-ink-dim">Deeper analytics (delay prediction, heatmaps, risk indicators) is on the Phase 2 roadmap.</p>
        <p className="text-xs text-ink-faint mt-1">Project health scores are already tracked per-project — see the Projects page.</p>
      </div>
    </div>
  );
}
