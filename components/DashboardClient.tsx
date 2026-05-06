"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import TaskCard from "@/components/TaskCard";
import AnalyticsView from "@/components/AnalyticsView";
import ActivityTimeline from "@/components/ActivityTimeline";

export default function DashboardClient({ user }: { user: any }) {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"board" | "analytics" | "timeline">("board");

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [newTask, setNewTask] = useState({ title: "", description: "", dueDate: "", assigneeId: "" });

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchTasks(selectedProject);
      setActiveTab("board");
    }
  }, [selectedProject]);

  // Pusher real-time (only if credentials configured)
  useEffect(() => {
    if (!selectedProject) return;
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!key || !cluster) return;

    let pusherClient: any = null;
    let channel: any = null;

    import("pusher-js").then((PusherModule) => {
      const Pusher = PusherModule.default;
      pusherClient = new Pusher(key, { cluster });
      channel = pusherClient.subscribe(`project-${selectedProject}`);
      channel.bind("task-updated", () => {
        fetchTasks(selectedProject);
        toast("A task was updated in real-time!", { icon: "🔄" });
      });
      channel.bind("task-created", () => {
        fetchTasks(selectedProject);
        toast("A new task was created!", { icon: "🆕" });
      });
    });

    return () => {
      if (channel) channel.unbind_all();
      if (pusherClient) pusherClient.unsubscribe(`project-${selectedProject}`);
    };
  }, [selectedProject]);

  // Check for overdue notifications on load
  useEffect(() => {
    if (tasks.length > 0) {
      const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE");
      if (overdue.length > 0) {
        toast(`⚠️ You have ${overdue.length} overdue task${overdue.length > 1 ? "s" : ""}!`, { icon: "🔔", duration: 5000 });
      }
    }
  }, [tasks]);

  const fetchProjects = async () => {
    const res = await fetch("/api/projects");
    if (res.ok) {
      const data = await res.json();
      setProjects(data.projects);
      if (data.projects.length > 0 && !selectedProject) setSelectedProject(data.projects[0].id);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    if (res.ok) { const data = await res.json(); setUsers(data.users); }
  };

  const fetchTasks = async (projectId: string) => {
    const res = await fetch(`/api/tasks?projectId=${projectId}`);
    if (res.ok) { const data = await res.json(); setTasks(data.tasks); }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newProject) });
    if (res.ok) {
      setShowProjectModal(false);
      setNewProject({ name: "", description: "" });
      fetchProjects();
      toast.success("Project created!");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...newTask, projectId: selectedProject }) });
    if (res.ok) {
      setShowTaskModal(false);
      setNewTask({ title: "", description: "", dueDate: "", assigneeId: "" });
      fetchTasks(selectedProject!);
      toast.success("Task created!");
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    const res = await fetch(`/api/tasks/${taskId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (res.ok) fetchTasks(selectedProject!);
  };

  if (loading) return <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>;

  const todoTasks = tasks.filter(t => t.status === "TODO");
  const progressTasks = tasks.filter(t => t.status === "IN_PROGRESS");
  const doneTasks = tasks.filter(t => t.status === "DONE");
  const tabs = [
    { id: "board" as const, label: "Board", icon: "⬜" },
    { id: "analytics" as const, label: "Analytics", icon: "📊" },
    { id: "timeline" as const, label: "Timeline", icon: "📋" },
  ];

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="container nav-content">
          <div className="logo">ProjectFlow</div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
              {user.name} <span style={{ padding: "2px 8px", background: "rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "0.75rem", marginLeft: "5px" }}>{user.role}</span>
            </span>
            <button onClick={handleLogout} className="btn-primary" style={{ padding: "0.5rem 1rem", background: "transparent", border: "1px solid var(--border)" }}>Logout</button>
          </div>
        </div>
      </nav>

      <div className="container animate-fade-in stagger-1" style={{ marginTop: "2rem", display: "flex", gap: "2rem", alignItems: "flex-start", paddingBottom: "4rem" }}>
        {/* Sidebar */}
        <div style={{ width: "280px", flexShrink: 0 }}>
          <div className="glass-panel" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.25rem" }}>Projects</h2>
              {user.role === "ADMIN" && (
                <button onClick={() => setShowProjectModal(true)} style={{ background: "var(--primary)", color: "white", border: "none", width: "30px", height: "30px", borderRadius: "50%", fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.2s" }}>+</button>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {projects.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "center", padding: "1rem 0" }}>No projects yet.</p>
              ) : projects.map((p, i) => (
                <div key={p.id} onClick={() => setSelectedProject(p.id)} className="animate-fade-in"
                  style={{ padding: "1rem", borderRadius: "12px", background: selectedProject === p.id ? "rgba(140,123,255,0.2)" : "rgba(255,255,255,0.02)", border: `1px solid ${selectedProject === p.id ? "var(--primary)" : "var(--border)"}`, cursor: "pointer", transition: "all 0.3s", display: "flex", alignItems: "center", gap: "1rem", animationDelay: `${i * 0.05}s` }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: selectedProject === p.id ? "#fff" : "var(--text-muted)", boxShadow: selectedProject === p.id ? "0 0 10px #fff" : "none", transition: "all 0.3s" }} />
                  <div>
                    <div style={{ fontWeight: 600, fontFamily: "Outfit, sans-serif" }}>{p.name}</div>
                    <div style={{ fontSize: "0.8rem", color: selectedProject === p.id ? "#fff" : "var(--text-muted)", marginTop: "4px" }}>{p._count.tasks} tasks</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flexGrow: 1 }}>
          {selectedProject ? (
            <div>
              {/* Tab Navigation */}
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
                {tabs.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    style={{ padding: "0.6rem 1.25rem", borderRadius: "12px", border: activeTab === tab.id ? "1px solid var(--primary)" : "1px solid var(--border)", background: activeTab === tab.id ? "rgba(140,123,255,0.15)" : "rgba(255,255,255,0.02)", color: activeTab === tab.id ? "#fff" : "var(--text-muted)", cursor: "pointer", transition: "all 0.2s", fontWeight: 500, fontSize: "0.9rem", fontFamily: "Outfit, sans-serif" }}>
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Board View */}
              {activeTab === "board" && (
                <div className="glass-panel animate-fade-in" style={{ padding: "2rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                    <h2 style={{ fontSize: "1.5rem" }}>{projects.find(p => p.id === selectedProject)?.name} Tasks</h2>
                    {user.role === "ADMIN" && <button onClick={() => setShowTaskModal(true)} className="btn-primary">Add New Task</button>}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
                    <Column title="To Do" tasks={todoTasks} color="var(--status-todo)" bg="var(--status-todo-bg)" onStatusChange={handleUpdateTaskStatus} onRefresh={() => fetchTasks(selectedProject!)} />
                    <Column title="In Progress" tasks={progressTasks} color="var(--status-progress)" bg="var(--status-progress-bg)" onStatusChange={handleUpdateTaskStatus} onRefresh={() => fetchTasks(selectedProject!)} />
                    <Column title="Done" tasks={doneTasks} color="var(--status-done)" bg="var(--status-done-bg)" onStatusChange={handleUpdateTaskStatus} onRefresh={() => fetchTasks(selectedProject!)} />
                  </div>
                </div>
              )}

              {/* Analytics View */}
              {activeTab === "analytics" && <AnalyticsView projectId={selectedProject} />}

              {/* Timeline View */}
              {activeTab === "timeline" && <ActivityTimeline projectId={selectedProject} />}
            </div>
          ) : (
            <div className="glass-panel" style={{ textAlign: "center", padding: "6rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
              <p style={{ fontSize: "3rem" }}>📂</p>
              <h3 style={{ color: "var(--text-main)", fontSize: "1.25rem" }}>No Project Selected</h3>
              <p style={{ color: "var(--text-muted)" }}>Select or create a project to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Project Modal */}
      {showProjectModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="glass-panel animate-pop-in" style={{ width: "400px", background: "rgba(20,22,35,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h2 style={{ marginBottom: "1.5rem" }}>Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="form-group"><label className="label">Project Name</label><input type="text" className="input-field" required value={newProject.name} onChange={e => setNewProject({ ...newProject, name: e.target.value })} /></div>
              <div className="form-group"><label className="label">Description</label><textarea className="input-field" rows={3} required value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} /></div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                <button type="button" onClick={() => setShowProjectModal(false)} className="btn-primary" style={{ background: "transparent", border: "1px solid var(--border)", flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="glass-panel animate-pop-in" style={{ width: "400px", background: "rgba(20,22,35,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h2 style={{ marginBottom: "1.5rem" }}>Add New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="form-group"><label className="label">Task Title</label><input type="text" className="input-field" required value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} /></div>
              <div className="form-group"><label className="label">Description</label><textarea className="input-field" rows={3} value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} /></div>
              <div className="form-group"><label className="label">Due Date</label><input type="date" className="input-field" value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} /></div>
              <div className="form-group"><label className="label">Assign To</label>
                <select className="input-field" value={newTask.assigneeId} onChange={e => setNewTask({ ...newTask, assigneeId: e.target.value })} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                  <option value="">Unassigned</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                <button type="button" onClick={() => setShowTaskModal(false)} className="btn-primary" style={{ background: "transparent", border: "1px solid var(--border)", flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Column({ title, tasks, color, bg, onStatusChange, onRefresh }: { title: string; tasks: any[]; color: string; bg: string; onStatusChange: (id: string, status: string) => void; onRefresh: () => void }) {
  return (
    <div>
      <h3 style={{ borderBottom: `2px solid ${color}`, paddingBottom: "0.75rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{title}</span>
        <span style={{ background: bg, color, padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem" }}>{tasks.length}</span>
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {tasks.map(t => <TaskCard key={t.id} task={t} onStatusChange={onStatusChange} onSubtasksUpdate={onRefresh} />)}
        {tasks.length === 0 && <div style={{ textAlign: "center", padding: "2rem 1rem", border: "1px dashed var(--border)", borderRadius: "12px", color: "var(--text-muted)", fontSize: "0.85rem" }}>No tasks here.</div>}
      </div>
    </div>
  );
}
