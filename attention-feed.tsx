import Link from "next/link";
import { AlertTriangle, Clock, CheckCircle2, ArrowUpCircle, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";

type AttentionItem = {
  kind: "overdue_critical" | "overdue" | "due_today" | "verification" | "priority_request" | "extension_request";
  title: string;
  meta: string;
  href: string;
  severity: 1 | 2 | 3;
};

const KIND_META: Record<AttentionItem["kind"], { icon: typeof AlertTriangle; color: string; label: string }> = {
  overdue_critical: { icon: AlertTriangle, color: "text-signal-red", label: "Critical · Overdue" },
  overdue: { icon: Clock, color: "text-signal-red", label: "Overdue" },
  due_today: { icon: CalendarClock, color: "text-signal-amber", label: "Due today" },
  verification: { icon: CheckCircle2, color: "text-signal-violet", label: "Needs verification" },
  priority_request: { icon: ArrowUpCircle, color: "text-signal-blue", label: "Priority request" },
  extension_request: { icon: ArrowUpCircle, color: "text-signal-blue", label: "Extension request" },
};

export function AttentionFeed({ items }: { items: AttentionItem[] }) {
  if (items.length === 0) {
    return (
      <div className="border border-grid rounded bg-slate/40 px-4 py-10 text-center">
        <p className="text-sm text-ink-dim">Nothing needs attention right now.</p>
        <p className="text-xs text-ink-faint mt-1">Overdue work, verifications and requests will surface here.</p>
      </div>
    );
  }

  return (
    <div className="border border-grid rounded bg-slate/40 divide-y divide-grid">
      {items.map((item, i) => {
        const meta = KIND_META[item.kind];
        const Icon = meta.icon;
        return (
          <Link
            key={i}
            href={item.href}
            className="flex items-start gap-3 px-4 py-3 hover:bg-slate/70 transition-colors"
          >
            <Icon size={16} strokeWidth={1.75} className={cn("mt-0.5 shrink-0", meta.color)} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={cn("text-[10px] font-mono uppercase tracking-wide", meta.color)}>{meta.label}</span>
              </div>
              <div className="text-sm text-ink mt-0.5 truncate">{item.title}</div>
              <div className="text-xs text-ink-faint mt-0.5 font-mono truncate">{item.meta}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
