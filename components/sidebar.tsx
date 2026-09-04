"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutGrid,
  FolderKanban,
  ListChecks,
  UserCircle2,
  CalendarDays,
  IndianRupee,
  Users,
  BarChart3,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid, roles: ["DGM", "TEAM_MEMBER"] },
  { href: "/projects", label: "Projects", icon: FolderKanban, roles: ["DGM", "TEAM_MEMBER"] },
  { href: "/tasks", label: "Tasks", icon: ListChecks, roles: ["DGM", "TEAM_MEMBER"] },
  { href: "/my-work", label: "My Work", icon: UserCircle2, roles: ["DGM", "TEAM_MEMBER"] },
  { href: "/calendar", label: "Calendar", icon: CalendarDays, roles: ["DGM", "TEAM_MEMBER"] },
  { href: "/invoice-planning", label: "Invoice Planning", icon: IndianRupee, roles: ["DGM"] },
  { href: "/team", label: "Team", icon: Users, roles: ["DGM"] },
  { href: "/analytics", label: "Analytics", icon: BarChart3, roles: ["DGM"] },
];

export function Sidebar({ role }: { role: "DGM" | "TEAM_MEMBER" }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col border-r border-grid bg-graphite">
      <div className="h-16 flex items-center px-5 border-b border-grid">
        <div>
          <div className="font-display font-semibold text-ink text-[15px] leading-none">AP-PMS</div>
          <div className="font-mono text-[10px] text-ink-faint mt-1 tracking-wide">CONTROL CONSOLE</div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {NAV.filter((item) => item.roles.includes(role)).map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors",
                active ? "bg-slate text-ink" : "text-ink-dim hover:bg-slate/60 hover:text-ink"
              )}
            >
              <Icon size={16} strokeWidth={1.75} className={active ? "text-signal-blue" : ""} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-grid">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded px-3 py-2 text-sm text-ink-dim hover:bg-slate/60 hover:text-signal-red transition-colors"
        >
          <LogOut size={16} strokeWidth={1.75} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
