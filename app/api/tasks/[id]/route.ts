import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function PATCH(request: Request, context: any) {
  try {
    const user = await requireAuth();
    // context.params is not immediately awaited in Next.js 14/15, but Next 15 requires awaiting params
    const { id } = await context.params;
    const body = await request.json();

    const task = await prisma.task.findUnique({ where: { id } });

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
      }
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
