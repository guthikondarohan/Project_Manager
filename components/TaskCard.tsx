"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function TaskCard({ task, onStatusChange, onSubtasksUpdate }: { 
  task: any; 
  onStatusChange: (id: string, status: string) => void;
  onSubtasksUpdate: () => void;
}) {
  const [aiLoading, setAiLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";
  const statusClass = task.status === "TODO" ? "todo" : task.status === "IN_PROGRESS" ? "progress" : "done";
  const statusText = task.status === "TODO" ? "To Do" : task.status === "IN_PROGRESS" ? "In Progress" : "Done";

  const handleAiBreakdown = async () => {
    setAiLoading(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/ai-breakdown`, { method: "POST" });
      if (res.ok) {
        toast.success("AI subtasks generated!");
        setExpanded(true);
        onSubtasksUpdate();
      } else {
        toast.error("Failed to generate subtasks");
      }
    } catch { toast.error("Network error"); }
    setAiLoading(false);
  };

  const subtasks = task.subtasks || [];

  return (
    <div className="task-card" style={{ border: isOverdue ? "1px solid rgba(255,71,87,0.5)" : undefined }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem", gap: "0.5rem" }}>
        <h4 style={{ fontWeight: 600, fontSize: "1rem", fontFamily: "Outfit, sans-serif", lineHeight: 1.3, flex: 1 }}>{task.title}</h4>
        <span className={`status-badge ${statusClass}`}>{statusText}</span>
      </div>

      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.5 }}>
        {task.description || "No description."}
      </p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
        {task.dueDate ? (
          <div style={{ fontSize: "0.75rem", fontWeight: 500, color: isOverdue ? "#ff4757" : "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {new Date(task.dueDate).toLocaleDateString()}
          </div>
        ) : <div />}
        {task.assignee && (
          <div style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--primary)", display: "flex", alignItems: "center", gap: "4px", background: "rgba(140,123,255,0.15)", padding: "2px 8px", borderRadius: "12px" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            {task.assignee.name}
          </div>
        )}
      </div>

      {/* Subtasks Section */}
      {subtasks.length > 0 && (
        <div style={{ marginBottom: "0.75rem" }}>
          <button onClick={() => setExpanded(!expanded)} style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "0.8rem", cursor: "pointer", padding: 0, fontWeight: 500 }}>
            {expanded ? "▾" : "▸"} {subtasks.length} subtask{subtasks.length !== 1 ? "s" : ""} ({subtasks.filter((s: any) => s.completed).length} done)
          </button>
          {expanded && (
            <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              {subtasks.map((s: any) => (
                <div key={s.id} style={{ fontSize: "0.8rem", color: s.completed ? "var(--status-done)" : "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.5rem", paddingLeft: "0.5rem" }}>
                  <span>{s.completed ? "✓" : "○"}</span>
                  <span style={{ textDecoration: s.completed ? "line-through" : "none" }}>{s.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: "0.5rem", borderTop: "1px solid var(--border)", paddingTop: "0.75rem", flexWrap: "wrap" }}>
        {subtasks.length === 0 && (
          <button onClick={handleAiBreakdown} disabled={aiLoading} style={{ flex: 1, padding: "6px", fontSize: "0.7rem", background: "linear-gradient(135deg, rgba(140,123,255,0.15), rgba(140,123,255,0.05))", border: "1px solid rgba(140,123,255,0.3)", color: "var(--primary)", borderRadius: "6px", cursor: aiLoading ? "wait" : "pointer", fontWeight: 600, letterSpacing: "0.03em" }}>
            {aiLoading ? "⏳ Generating..." : "✨ AI Breakdown"}
          </button>
        )}
        {task.status !== "TODO" && (
          <button onClick={() => onStatusChange(task.id, "TODO")} style={{ flex: 1, padding: "6px", fontSize: "0.75rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: "6px", cursor: "pointer", transition: "all 0.2s", fontWeight: 500 }}>To Do</button>
        )}
        {task.status !== "IN_PROGRESS" && (
          <button onClick={() => onStatusChange(task.id, "IN_PROGRESS")} style={{ flex: 1, padding: "6px", fontSize: "0.75rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: "6px", cursor: "pointer", transition: "all 0.2s", fontWeight: 500 }}>In Progress</button>
        )}
        {task.status !== "DONE" && (
          <button onClick={() => onStatusChange(task.id, "DONE")} style={{ flex: 1, padding: "6px", fontSize: "0.75rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: "6px", cursor: "pointer", transition: "all 0.2s", fontWeight: 500 }}>Done</button>
        )}
      </div>
    </div>
  );
}
