import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    // Total tasks and status breakdown
    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: { assignee: { select: { id: true, name: true } } },
    });

    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === "TODO").length;
    const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const done = tasks.filter((t) => t.status === "DONE").length;
    const completionPercent = total > 0 ? Math.round((done / total) * 100) : 0;

    // Overdue tasks
    const now = new Date();
    const overdue = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "DONE"
    ).length;

    // Most overloaded member
    const memberLoad: Record<string, { name: string; count: number }> = {};
    tasks.forEach((t) => {
      if (t.assignee) {
        if (!memberLoad[t.assignee.id]) {
          memberLoad[t.assignee.id] = { name: t.assignee.name, count: 0 };
        }
        memberLoad[t.assignee.id].count++;
      }
    });
    const overloadedMember = Object.values(memberLoad).sort((a, b) => b.count - a.count)[0] || null;

    // Tasks completed per day (last 7 days) — velocity
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentLogs = await prisma.activityLog.findMany({
      where: {
        projectId,
        action: "STATUS_CHANGE",
        message: { contains: "Done" },
        createdAt: { gte: sevenDaysAgo },
      },
      orderBy: { createdAt: "asc" },
    });

    // Build velocity data for the last 7 days
    const velocity: { date: string; completed: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(sevenDaysAgo);
      day.setDate(day.getDate() + i);
      const dayStr = day.toISOString().split("T")[0];
      const count = recentLogs.filter((l) => {
        const logDate = new Date(l.createdAt).toISOString().split("T")[0];
        return logDate === dayStr;
      }).length;
      velocity.push({ date: dayStr, completed: count });
    }

    return NextResponse.json({
      analytics: {
        total,
        todo,
        inProgress,
        done,
        completionPercent,
        overdue,
        overloadedMember,
        velocity,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
