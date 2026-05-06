"use client";

import { useState, useEffect } from "react";

export default function ActivityTimeline({ projectId }: { projectId: string }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    fetch(`/api/logs?projectId=${projectId}`)
      .then(r => r.json())
      .then(d => { setLogs(d.logs || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [projectId]);

  const getIcon = (action: string) => {
    switch (action) {
      case "CREATED": return "🆕";
      case "STATUS_CHANGE": return "🔄";
      case "ASSIGNED": return "👤";
      case "AI_BREAKDOWN": return "✨";
      default: return "📝";
    }
  };

  const getColor = (action: string) => {
    switch (action) {
      case "CREATED": return "var(--status-todo)";
      case "STATUS_CHANGE": return "var(--status-progress)";
      case "ASSIGNED": return "var(--primary)";
      case "AI_BREAKDOWN": return "#a78bfa";
      default: return "var(--text-muted)";
    }
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) return <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>Loading timeline...</div>;

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: "2rem" }}>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        Activity Timeline
      </h2>

      {logs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
          <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📋</p>
          <p>No activity yet. Start creating tasks!</p>
        </div>
      ) : (
        <div style={{ position: "relative", paddingLeft: "2rem" }}>
          {/* Vertical line */}
          <div style={{ position: "absolute", left: "8px", top: 0, bottom: 0, width: "2px", background: "var(--border)" }} />
          
          {logs.map((log, i) => (
            <div key={log.id} className="animate-fade-in" style={{ position: "relative", marginBottom: "1.5rem", animationDelay: `${i * 0.05}s` }}>
              {/* Dot */}
              <div style={{ position: "absolute", left: "-2rem", top: "4px", width: "18px", height: "18px", borderRadius: "50%", background: "var(--bg-color)", border: `2px solid ${getColor(log.action)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.55rem", zIndex: 1 }}>
                {getIcon(log.action)}
              </div>
              
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1rem 1.25rem", transition: "all 0.2s" }}>
                <p style={{ fontSize: "0.9rem", lineHeight: 1.5 }}>{log.message}</p>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", color: getColor(log.action), fontWeight: 500 }}>{log.action.replace("_", " ")}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{timeAgo(log.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
