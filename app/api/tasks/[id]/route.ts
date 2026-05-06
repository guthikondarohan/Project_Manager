import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { triggerEvent } from '@/lib/pusher';

export async function PATCH(request: Request, context: any) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;
    const body = await request.json();

    const task = await prisma.task.findUnique({ where: { id }, include: { assignee: { select: { name: true } } } });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Admins can update everything. Members can only update status.
    const updateData: any = {};
    if (body.status) updateData.status = body.status;
    
    if (user.role === 'ADMIN') {
      if (body.title) updateData.title = body.title;
      if (body.description) updateData.description = body.description;
      if (body.assigneeId !== undefined) updateData.assigneeId = body.assigneeId;
      if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true } },
        subtasks: true,
      }
    });

    // Log status change
    if (body.status && body.status !== task.status) {
      const statusMap: Record<string, string> = { TODO: "To Do", IN_PROGRESS: "In Progress", DONE: "Done" };
      await prisma.activityLog.create({
        data: {
          action: "STATUS_CHANGE",
          message: `${user.name} moved '${task.title}' to ${statusMap[body.status] || body.status}`,
          userId: user.id,
          projectId: task.projectId,
        }
      });
    }

    // Log assignment change
    if (body.assigneeId !== undefined && body.assigneeId !== task.assigneeId) {
      if (body.assigneeId) {
        const newAssignee = await prisma.user.findUnique({ where: { id: body.assigneeId }, select: { name: true } });
        await prisma.activityLog.create({
          data: {
            action: "ASSIGNED",
            message: `${user.name} assigned '${task.title}' to ${newAssignee?.name || 'someone'}`,
            userId: user.id,
            projectId: task.projectId,
          }
        });
      }
    }

    // Trigger real-time event
    await triggerEvent(`project-${task.projectId}`, "task-updated", { task: updatedTask });

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
