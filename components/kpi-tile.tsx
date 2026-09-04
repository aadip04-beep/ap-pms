import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function KpiTile({
  label,
  value,
  icon: Icon,
  tone = "default",
  wide = false,
  footnote,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: "default" | "red" | "amber" | "green" | "blue";
  wide?: boolean;
  footnote?: string;
}) {
  const toneText: Record<string, string> = {
    default: "text-ink",
    red: "text-signal-red",
    amber: "text-signal-amber",
    green: "text-signal-green",
    blue: "text-signal-blue",
  };

  return (
    <div className={cn("border border-grid bg-slate/40 rounded px-4 py-3.5", wide && "col-span-2")}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wide text-ink-faint">{label}</span>
        {Icon && <Icon size={14} strokeWidth={1.75} className="text-ink-faint" />}
      </div>
      <div className={cn("font-display text-2xl font-semibold mt-1.5", toneText[tone])}>{value}</div>
      {footnote && <div className="text-[11px] text-ink-faint mt-1">{footnote}</div>}
    </div>
  );
}
