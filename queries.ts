import { prisma } from "@/lib/prisma";
import { classifyDueDate } from "@/lib/utils";

const OPEN_TASK_STATUSES = ["NOT_STARTED", "PLANNED", "IN_PROGRESS", "WAITING_INPUT", "WAITING_CLIENT", "WAITING_TEAM", "BLOCKED", "SUBMITTED", "UNDER_REVIEW", "REOPENED"] as const;

export async function getOrgOverview() {
  const [totalProjects, activeProjects, criticalProjects, delayedProjects, totalMembers, openTasks, awaitingVerification] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { status: "ACTIVE" } }),
    prisma.project.count({ where: { status: "CRITICAL" } }),
    prisma.project.count({ where: { status: "DELAYED" } }),
    prisma.user.count({ where: { role: "TEAM_MEMBER", isActive: true } }),
    prisma.task.findMany({
      where: { status: { in: OPEN_TASK_STATUSES as unknown as string[] } },
      select: { id: true, dueDate: true, dgmPriority: true, status: true },
    }),
    prisma.task.count({ where: { verificationStatus: "PENDING_VERIFICATION" } }),
  ]);

  const overdue = openTasks.filter((t) => ["overdue", "critically_overdue"].includes(classifyDueDate(t.dueDate)));
  const critical = openTasks.filter((t) => t.dgmPriority === "CRITICAL");
  const dueToday = openTasks.filter((t) => classifyDueDate(t.dueDate) === "today");

  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const completedThisWeek = await prisma.task.count({
    where: { completionDate: { gte: weekAgo } },
  });

  return {
    totalProjects,
    activeProjects,
    criticalProjects,
    delayedProjects,
    totalMembers,
    totalOpenTasks: openTasks.length,
    overdueTasks: overdue.length,
    criticalTasks: critical.length,
    dueTodayTasks: dueToday.length,
    completedThisWeek,
    awaitingVerification,
  };
}

export async function getFinancialOverview() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const annualTargets = await prisma.invoiceAnnualTarget.findMany({ where: { year } });
  const annualTarget = annualTargets.reduce((sum, t) => sum + Number(t.targetAmount), 0);

  const monthlyTargets = await prisma.invoiceMonthlyTarget.findMany({
    where: { month, quarterlyTarget: { annualTarget: { year } } },
  });
  const monthlyTarget = monthlyTargets.reduce((sum, t) => sum + Number(t.targetAmount), 0);

  const yearStart = new Date(year, 0, 1);
  const yearActuals = await prisma.invoiceActual.aggregate({
    where: { date: { gte: yearStart } },
    _sum: { amount: true },
  });
  const achieved = Number(yearActuals._sum.amount ?? 0);

  const monthStart = new Date(year, month - 1, 1);
  const monthActuals = await prisma.invoiceActual.aggregate({
    where: { date: { gte: monthStart } },
    _sum: { amount: true },
  });
  const monthAchieved = Number(monthActuals._sum.amount ?? 0);

  const pending = Math.max(annualTarget - achieved, 0);
  const achievementPct = annualTarget > 0 ? Math.round((achieved / annualTarget) * 100) : 0;

  return { annualTarget, monthlyTarget, achieved, monthAchieved, pending, achievementPct };
}

export async function getAttentionFeed(opts: { role: "DGM" | "TEAM_MEMBER"; userId: string }) {
  const taskWhere = opts.role === "DGM" ? {} : { assignedToId: opts.userId };

  const [overdueCritical, dueToday, awaitingVerification, priorityRequests, extensionRequests] = await Promise.all([
    prisma.task.findMany({
      where: { ...taskWhere, status: { in: OPEN_TASK_STATUSES as unknown as string[] }, dgmPriority: "CRITICAL" },
      include: { project: { select: { name: true, code: true } }, assignedTo: { select: { name: true } } },
      orderBy: { dueDate: "asc" },
      take: 20,
    }),
    prisma.task.findMany({
      where: { ...taskWhere, status: { in: OPEN_TASK_STATUSES as unknown as string[] } },
      include: { project: { select: { name: true, code: true } }, assignedTo: { select: { name: true } } },
      take: 50,
    }),
    opts.role === "DGM"
      ? prisma.task.findMany({
          where: { verificationStatus: "PENDING_VERIFICATION" },
          include: { project: { select: { name: true, code: true } }, assignedTo: { select: { name: true } } },
          take: 20,
        })
      : Promise.resolve([]),
    opts.role === "DGM"
      ? prisma.priorityChangeRequest.findMany({
          where: { status: "PENDING" },
          include: { task: { select: { title: true, taskCode: true } }, requestedBy: { select: { name: true } } },
          take: 10,
        })
      : Promise.resolve([]),
    opts.role === "DGM"
      ? prisma.deadlineExtensionRequest.findMany({
          where: { status: "PENDING" },
          include: { task: { select: { title: true, taskCode: true } }, requestedBy: { select: { name: true } } },
          take: 10,
        })
      : Promise.resolve([]),
  ]);

  const overdueOnly = dueToday.filter((t) => ["overdue", "critically_overdue"].includes(classifyDueDate(t.dueDate)));
  const dueTodayOnly = dueToday.filter((t) => classifyDueDate(t.dueDate) === "today");

  type AttentionItem = {
    kind: "overdue_critical" | "overdue" | "due_today" | "verification" | "priority_request" | "extension_request";
    title: string;
    meta: string;
    href: string;
    severity: 1 | 2 | 3;
  };

  const items: AttentionItem[] = [
    ...overdueCritical.map((t) => ({
      kind: "overdue_critical" as const,
      title: t.title,
      meta: `${t.project.code} · ${t.assignedTo?.name ?? "Unassigned"}`,
      href: `/tasks?task=${t.id}`,
      severity: 1 as const,
    })),
    ...overdueOnly
      .filter((t) => t.dgmPriority !== "CRITICAL")
      .map((t) => ({
        kind: "overdue" as const,
        title: t.title,
        meta: `${t.project.code} · ${t.assignedTo?.name ?? "Unassigned"}`,
        href: `/tasks?task=${t.id}`,
        severity: 2 as const,
      })),
    ...awaitingVerification.map((t) => ({
      kind: "verification" as const,
      title: t.title,
      meta: `${t.project.code} · submitted by ${t.assignedTo?.name ?? "—"}`,
      href: `/tasks?task=${t.id}`,
      severity: 2 as const,
    })),
    ...priorityRequests.map((r) => ({
      kind: "priority_request" as const,
      title: `Priority change requested: ${r.task.title}`,
      meta: `${r.task.taskCode} · by ${r.requestedBy.name} → ${r.requestedPriority}`,
      href: `/tasks?task=${r.taskId}`,
      severity: 3 as const,
    })),
    ...extensionRequests.map((r) => ({
      kind: "extension_request" as const,
      title: `Deadline extension requested: ${r.task.title}`,
      meta: `${r.task.taskCode} · by ${r.requestedBy.name}`,
      href: `/tasks?task=${r.taskId}`,
      severity: 3 as const,
    })),
    ...dueTodayOnly.map((t) => ({
      kind: "due_today" as const,
      title: t.title,
      meta: `${t.project.code} · ${t.assignedTo?.name ?? "Unassigned"}`,
      href: `/tasks?task=${t.id}`,
      severity: 3 as const,
    })),
  ];

  return items.sort((a, b) => a.severity - b.severity).slice(0, 12);
}

export async function getProjectsForList() {
  return prisma.project.findMany({
    include: {
      projectManager: { select: { name: true } },
      _count: { select: { tasks: true } },
    },
    orderBy: [{ priority: "asc" }, { updatedAt: "desc" }],
  });
}

export async function getTasksForList(opts: { role: "DGM" | "TEAM_MEMBER"; userId: string }) {
  const where = opts.role === "DGM" ? {} : { assignedToId: opts.userId };
  return prisma.task.findMany({
    where,
    include: {
      project: { select: { name: true, code: true } },
      assignedTo: { select: { name: true } },
    },
    orderBy: [{ dgmPriority: "asc" }, { dueDate: "asc" }],
  });
}

export async function getMyWork(userId: string) {
  const tasks = await prisma.task.findMany({
    where: { assignedToId: userId },
    include: { project: { select: { name: true, code: true } } },
    orderBy: [{ dgmPriority: "asc" }, { dueDate: "asc" }],
  });

  const buckets = {
    today: tasks.filter((t) => classifyDueDate(t.dueDate) === "today" && !["COMPLETED", "VERIFIED", "CANCELLED"].includes(t.status)),
    overdue: tasks.filter((t) => ["overdue", "critically_overdue"].includes(classifyDueDate(t.dueDate)) && !["COMPLETED", "VERIFIED", "CANCELLED"].includes(t.status)),
    critical: tasks.filter((t) => t.dgmPriority === "CRITICAL" && !["COMPLETED", "VERIFIED", "CANCELLED"].includes(t.status)),
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS"),
    waiting: tasks.filter((t) => ["WAITING_INPUT", "WAITING_CLIENT", "WAITING_TEAM", "BLOCKED"].includes(t.status)),
    upcoming: tasks.filter((t) => ["upcoming", "this_week", "tomorrow"].includes(classifyDueDate(t.dueDate)) && !["COMPLETED", "VERIFIED", "CANCELLED"].includes(t.status)),
    completed: tasks.filter((t) => ["COMPLETED", "VERIFIED"].includes(t.status)),
    awaitingVerification: tasks.filter((t) => t.verificationStatus === "PENDING_VERIFICATION"),
  };

  const totalClosed = tasks.filter((t) => ["COMPLETED", "VERIFIED"].includes(t.status)).length;
  const completionRate = tasks.length > 0 ? Math.round((totalClosed / tasks.length) * 100) : 0;

  return { tasks, buckets, completionRate, totalAssigned: tasks.length };
}

export async function getInvoiceOverviewByProject() {
  const projects = await prisma.project.findMany({
    include: {
      threeYearPlans: { include: { annualTargets: true } },
      invoiceActuals: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return projects.map((p) => {
    const threeYearTarget = p.threeYearPlans.reduce((sum, plan) => sum + Number(plan.totalTarget), 0);
    const currentYear = new Date().getFullYear();
    const annualTarget = p.threeYearPlans
      .flatMap((plan) => plan.annualTargets)
      .filter((a) => a.year === currentYear)
      .reduce((sum, a) => sum + Number(a.targetAmount), 0);
    const actual = p.invoiceActuals.reduce((sum, a) => sum + Number(a.amount), 0);
    const pending = Math.max(annualTarget - actual, 0);
    const achievementPct = annualTarget > 0 ? Math.round((actual / annualTarget) * 100) : 0;

    return {
      id: p.id,
      name: p.name,
      code: p.code,
      hasPlan: p.threeYearPlans.length > 0,
      threeYearTarget,
      annualTarget,
      actual,
      pending,
      achievementPct,
    };
  });
}

export async function getInvoiceCascade(projectId: string) {
  const plan = await prisma.invoiceThreeYearPlan.findFirst({
    where: { projectId },
    include: {
      annualTargets: {
        include: {
          quarterlyTargets: {
            include: { monthlyTargets: true },
          },
        },
        orderBy: { year: "asc" },
      },
    },
  });
  return plan;
}

export async function getTeamPerformance() {
  const members = await prisma.user.findMany({
    where: { role: "TEAM_MEMBER", isActive: true },
    include: {
      assignedTasks: { select: { id: true, status: true, dueDate: true } },
    },
  });

  return members.map((m) => {
    const tasks = m.assignedTasks;
    const completed = tasks.filter((t) => ["COMPLETED", "VERIFIED"].includes(t.status)).length;
    const overdue = tasks.filter((t) => ["overdue", "critically_overdue"].includes(classifyDueDate(t.dueDate)) && !["COMPLETED", "VERIFIED", "CANCELLED"].includes(t.status)).length;
    const open = tasks.filter((t) => !["COMPLETED", "VERIFIED", "CANCELLED"].includes(t.status)).length;
    const total = tasks.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const workload = open >= 6 ? "Overloaded" : open >= 4 ? "High" : open >= 2 ? "Balanced" : "Low";

    return {
      id: m.id,
      name: m.name,
      department: m.department,
      jobTitle: m.jobTitle,
      total,
      completed,
      overdue,
      open,
      completionRate,
      workload,
    };
  });
}
