import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { triggerEvent } from '@/lib/pusher';

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    
    const where = projectId ? { projectId } : {};
    
    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
        subtasks: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({ tasks });
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
    }

    const { title, description, projectId, assigneeId, dueDate } = await request.json();

    if (!title || !projectId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || '',
        projectId,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        assignee: { select: { id: true, name: true } },
        subtasks: true,
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "CREATED",
        message: `${user.name} created task '${title}'`,
        userId: user.id,
        projectId,
      }
    });

    // If assigned, log assignment too
    if (assigneeId) {
      const assignee = await prisma.user.findUnique({ where: { id: assigneeId }, select: { name: true } });
      await prisma.activityLog.create({
        data: {
          action: "ASSIGNED",
          message: `${user.name} assigned '${title}' to ${assignee?.name || 'someone'}`,
          userId: user.id,
          projectId,
        }
      });
    }

    // Trigger real-time event
    await triggerEvent(`project-${projectId}`, "task-created", { task });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
