import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma, TaskPriority, TaskStatus } from "@prisma/client";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { status, dgmPriority, verify } = body as { status?: TaskStatus; dgmPriority?: TaskPriority; verify?: "approve" | "reject" };

  const task = await prisma.task.findUnique({ where: { id: params.id } });
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const isDgm = session.user.role === "DGM";
  const isOwner = task.assignedToId === session.user.id;
  if (!isDgm && !isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const data: Prisma.TaskUncheckedUpdateInput = {};
  const logs: { action: string; previousValue: string | null; newValue: string | null }[] = [];

  if (status) {
    data.status = status;
    logs.push({ action: "TASK_STATUS_CHANGED", previousValue: task.status, newValue: status });
    if (status === "COMPLETED") {
      data.completionDate = new Date();
      data.verificationStatus = "PENDING_VERIFICATION";
    }
  }

  if (dgmPriority) {
    if (!isDgm) return NextResponse.json({ error: "Only the DGM can override priority" }, { status: 403 });
    data.dgmPriority = dgmPriority;
    logs.push({ action: "PRIORITY_OVERRIDDEN", previousValue: task.dgmPriority, newValue: dgmPriority });
  }

  if (verify) {
    if (!isDgm) return NextResponse.json({ error: "Only the DGM can verify tasks" }, { status: 403 });
    if (verify === "approve") {
      data.verificationStatus = "VERIFIED";
      data.status = "VERIFIED";
      data.verifiedById = session.user.id;
      data.verificationDate = new Date();
      logs.push({ action: "TASK_VERIFIED", previousValue: task.verificationStatus, newValue: "VERIFIED" });
    } else {
      data.verificationStatus = "REJECTED";
      data.status = "REOPENED";
      logs.push({ action: "TASK_REOPENED", previousValue: task.verificationStatus, newValue: "REJECTED" });
    }
  }

  const updated = await prisma.task.update({ where: { id: params.id }, data });

  await prisma.activityLog.createMany({
    data: logs.map((l) => ({
      userId: session.user.id,
      action: l.action,
      entityType: "Task",
      entityId: task.id,
      previousValue: l.previousValue,
      newValue: l.newValue,
      projectId: task.projectId,
    })),
  });

  return NextResponse.json(updated);
}
