import { NextResponse } from "next/server";
import { getUserFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromCookies();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const p = await params;
    const taskId = p.id;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { subtasks: true },
    });

    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const apiKey = process.env.GEMINI_API_KEY;
    
    // If no API key is provided, gracefully mock the response for the demo
    if (!apiKey) {
      console.warn("No GEMINI_API_KEY found, mocking AI response");
      const mockSubtasks = [
        "Review requirements for " + task.title,
        "Design the database schema",
        "Implement the backend API",
        "Create frontend components",
        "Write tests and deploy"
      ];
      
      const createdSubtasks = [];
      for (const st of mockSubtasks) {
        const created = await prisma.subtask.create({
          data: { title: st, taskId }
        });
        createdSubtasks.push(created);
      }
      
      // Log activity
      await prisma.activityLog.create({
        data: {
          action: "AI_BREAKDOWN",
          message: `${user.name} generated AI subtasks for '${task.title}'`,
          userId: user.id,
          projectId: task.projectId
        }
      });
      
      return NextResponse.json({ subtasks: createdSubtasks });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" } 
    });

    const prompt = `You are a technical project manager. Break down the following task into 3 to 5 actionable subtasks.
Task Title: ${task.title}
Task Description: ${task.description || "No description provided."}

Return ONLY a valid JSON array of strings, where each string is a subtask title. Do not wrap in markdown code blocks.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const subtasksText = response.text();
    let subtaskTitles: string[] = [];
    try {
      subtaskTitles = JSON.parse(subtasksText);
    } catch (e) {
      console.error("Failed to parse AI response:", subtasksText);
      subtaskTitles = ["Failed to parse AI response. Please try again."];
    }

    const createdSubtasks = [];
    for (const title of subtaskTitles) {
      const created = await prisma.subtask.create({
        data: { title, taskId }
      });
      createdSubtasks.push(created);
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "AI_BREAKDOWN",
        message: `${user.name} generated AI subtasks for '${task.title}'`,
        userId: user.id,
        projectId: task.projectId
      }
    });

    return NextResponse.json({ subtasks: createdSubtasks });

  } catch (error) {
    console.error("AI Breakdown Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
