import { Bell } from "lucide-react";
import { initials } from "@/lib/utils";

export function Topbar({
  userName,
  role,
}: {
  userName: string;
  role: "DGM" | "TEAM_MEMBER";
}) {
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <header className="h-16 flex items-center justify-end border-b border-grid bg-graphite px-6 shrink-0">
      <div className="flex items-center gap-5">
        <span className="hidden lg:block font-mono text-xs text-ink-faint">{today}</span>
        <button className="relative text-ink-dim hover:text-ink transition-colors">
          <Bell size={18} strokeWidth={1.75} />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-signal-red" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-slate border border-grid flex items-center justify-center font-mono text-xs text-ink">
            {initials(userName)}
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="text-sm text-ink">{userName}</div>
            <div className="text-[11px] text-ink-faint">{role === "DGM" ? "DGM · Super Admin" : "Team Member"}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
