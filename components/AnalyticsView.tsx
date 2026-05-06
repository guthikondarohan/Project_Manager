"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function AnalyticsView({ projectId }: { projectId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    fetch(`/api/analytics?projectId=${projectId}`)
      .then(r => r.json())
      .then(d => { setData(d.analytics || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [projectId]);

  if (loading) return <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>Loading analytics...</div>;
  if (!data) return <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>No data available.</div>;

  const pieData = [
    { name: "To Do", value: data.todo, color: "#fbbf24" },
    { name: "In Progress", value: data.inProgress, color: "#38bdf8" },
    { name: "Done", value: data.done, color: "#34d399" },
  ].filter(d => d.value > 0);

  const velocityData = (data.velocity || []).map((v: any) => ({
    ...v,
    date: new Date(v.date).toLocaleDateString("en-US", { weekday: "short" }),
  }));

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: "2rem" }}>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
        Analytics
      </h2>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        <StatCard label="Total Tasks" value={data.total} color="var(--text-main)" />
        <StatCard label="Completion" value={`${data.completionPercent}%`} color="var(--status-done)" />
        <StatCard label="Overdue" value={data.overdue} color={data.overdue > 0 ? "#ff4757" : "var(--text-muted)"} />
        <StatCard label="Most Loaded" value={data.overloadedMember?.name || "—"} sub={data.overloadedMember ? `${data.overloadedMember.count} tasks` : ""} color="var(--primary)" />
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
        {/* Velocity Chart */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "16px", padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", marginBottom: "1rem", color: "var(--text-muted)" }}>Velocity (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={velocityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "rgba(20,22,35,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
              <Bar dataKey="completed" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution Pie */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "16px", padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", marginBottom: "1rem", color: "var(--text-muted)" }}>Task Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "rgba(20,22,35,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>No tasks yet</div>
          )}
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "0.5rem" }}>
            {pieData.map(d => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, sub }: { label: string; value: string | number; color: string; sub?: string }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "16px", padding: "1.25rem", textAlign: "center" }}>
      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: "1.75rem", fontWeight: 700, color, fontFamily: "Outfit, sans-serif" }}>{value}</div>
      {sub && <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{sub}</div>}
    </div>
  );
}
