import { PageHeading } from "@/components/page-heading";
import { CalendarDays } from "lucide-react";

export default function CalendarPage() {
  return (
    <div>
      <PageHeading title="Calendar" subtitle="Daily, weekly and monthly task & deadline view." />
      <div className="border border-grid rounded bg-slate/40 px-6 py-16 text-center">
        <CalendarDays size={28} className="mx-auto text-ink-faint mb-3" strokeWidth={1.5} />
        <p className="text-sm text-ink-dim">Calendar view is on the Phase 2 roadmap.</p>
        <p className="text-xs text-ink-faint mt-1">Task due dates already power the dashboard and My Work buckets today.</p>
      </div>
    </div>
  );
}
