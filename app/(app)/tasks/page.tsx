import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTasksForList } from "@/lib/queries";
import { PageHeading } from "@/components/page-heading";
import { TaskBoard } from "@/components/task-board";

export default async function TasksPage() {
  const session = await getServerSession(authOptions);
  const role = session!.user.role;
  const tasks = await getTasksForList({ role, userId: session!.user.id });

  const rows = tasks.map((t) => ({
    id: t.id,
    taskCode: t.taskCode,
    title: t.title,
    status: t.status,
    dgmPriority: t.dgmPriority,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    verificationStatus: t.verificationStatus,
    project: t.project,
    assignedTo: t.assignedTo,
  }));

  return (
    <div>
      <PageHeading
        title="Tasks"
        subtitle={role === "DGM" ? "Every task across the portfolio." : "Tasks assigned to you."}
      />
      <TaskBoard tasks={rows} role={role} />
    </div>
  );
}
