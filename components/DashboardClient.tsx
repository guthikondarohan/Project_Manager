"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardClient({ user }: { user: any }) {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  
  // Modals state
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Forms
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [newTask, setNewTask] = useState({ title: "", description: "", dueDate: "", assigneeId: "" });

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedProject) fetchTasks(selectedProject);
  }, [selectedProject]);

  const fetchProjects = async () => {
    const res = await fetch("/api/projects");
    if (res.ok) {
      const data = await res.json();
      setProjects(data.projects);
      if (data.projects.length > 0 && !selectedProject) {
        setSelectedProject(data.projects[0].id);
      }
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
    }
  };

  const fetchTasks = async (projectId: string) => {
    const res = await fetch(`/api/tasks?projectId=${projectId}`);
    if (res.ok) {
      const data = await res.json();
      setTasks(data.tasks);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProject),
    });
    if (res.ok) {
      setShowProjectModal(false);
      setNewProject({ name: "", description: "" });
      fetchProjects();
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newTask, projectId: selectedProject }),
    });
    if (res.ok) {
      setShowTaskModal(false);
      setNewTask({ title: "", description: "", dueDate: "", assigneeId: "" });
      fetchTasks(selectedProject!);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      fetchTasks(selectedProject!);
    }
  };

  if (loading) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>;

  const todoTasks = tasks.filter(t => t.status === "TODO");
  const progressTasks = tasks.filter(t => t.status === "IN_PROGRESS");
  const doneTasks = tasks.filter(t => t.status === "DONE");

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="container nav-content">
          <div className="logo">ProjectFlow</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {user.name} <span style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '0.75rem', marginLeft: '5px' }}>{user.role}</span>
            </span>
            <button onClick={handleLogout} className="btn-primary" style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--border)' }}>Logout</button>
          </div>
        </div>
      </nav>

      <div className="container" style={{ marginTop: '2rem', display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* Sidebar - Projects */}
        <div style={{ width: '300px', flexShrink: 0 }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Projects</h2>
              {user.role === 'ADMIN' && (
                <button onClick={() => setShowProjectModal(true)} style={{ background: 'var(--primary)', color: 'white', border: 'none', width: '30px', height: '30px', borderRadius: '50%', fontSize: '1.2rem', cursor: 'pointer' }}>+</button>
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {projects.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No projects found.</p>
              ) : (
                projects.map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => setSelectedProject(p.id)}
                    style={{ 
                      padding: '1rem', 
                      borderRadius: '8px', 
                      background: selectedProject === p.id ? 'rgba(108, 92, 231, 0.2)' : 'var(--surface)',
                      border: `1px solid ${selectedProject === p.id ? 'var(--primary)' : 'transparent'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontWeight: '600' }}>{p.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{p._count.tasks} tasks</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Content - Tasks */}
        <div style={{ flexGrow: 1 }}>
          {selectedProject ? (
            <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem' }}>
                  {projects.find(p => p.id === selectedProject)?.name} Tasks
                </h2>
                {user.role === 'ADMIN' && (
                  <button onClick={() => setShowTaskModal(true)} className="btn-primary">Add Task</button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                {/* TODO Column */}
                <div>
                  <h3 style={{ borderBottom: '3px solid var(--status-todo)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>To Do ({todoTasks.length})</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {todoTasks.map(t => (
                      <TaskCard key={t.id} task={t} onStatusChange={handleUpdateTaskStatus} />
                    ))}
                  </div>
                </div>

                {/* IN PROGRESS Column */}
                <div>
                  <h3 style={{ borderBottom: '3px solid var(--status-progress)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>In Progress ({progressTasks.length})</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {progressTasks.map(t => (
                      <TaskCard key={t.id} task={t} onStatusChange={handleUpdateTaskStatus} />
                    ))}
                  </div>
                </div>

                {/* DONE Column */}
                <div>
                  <h3 style={{ borderBottom: '3px solid var(--status-done)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Done ({doneTasks.length})</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {doneTasks.map(t => (
                      <TaskCard key={t.id} task={t} onStatusChange={handleUpdateTaskStatus} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
              Select a project or create one to get started.
            </div>
          )}
        </div>
      </div>

      {/* Project Modal */}
      {showProjectModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '400px', background: '#1e2130' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label className="label">Project Name</label>
                <input type="text" className="input-field" required value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="label">Description</label>
                <textarea className="input-field" rows={3} required value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})}></textarea>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setShowProjectModal(false)} className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--border)', flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '400px', background: '#1e2130' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Add New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label className="label">Task Title</label>
                <input type="text" className="input-field" required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="label">Description</label>
                <textarea className="input-field" rows={3} value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})}></textarea>
              </div>
              <div className="form-group">
                <label className="label">Due Date</label>
                <input type="date" className="input-field" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="label">Assign To (Optional)</label>
                <select className="input-field" value={newTask.assigneeId} onChange={e => setNewTask({...newTask, assigneeId: e.target.value})} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setShowTaskModal(false)} className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--border)', flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, onStatusChange }: { task: any, onStatusChange: (id: string, status: string) => void }) {
  // Check if overdue
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <div style={{ 
      background: 'var(--surface)', 
      border: `1px solid ${isOverdue ? '#ff4757' : 'var(--border)'}`, 
      borderRadius: '8px', 
      padding: '1rem',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <h4 style={{ marginBottom: '0.5rem', fontWeight: '600' }}>{task.title}</h4>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {task.description || "No description provided."}
      </p>
      
      {task.dueDate && (
        <div style={{ fontSize: '0.75rem', marginBottom: '0.25rem', color: isOverdue ? '#ff4757' : 'var(--text-muted)' }}>
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </div>
      )}
      
      {task.assignee && (
        <div style={{ fontSize: '0.75rem', marginBottom: '1rem', color: 'var(--primary)' }}>
          Assignee: {task.assignee.name}
        </div>
      )}
      
      {(!task.assignee || !task.dueDate) && <div style={{ marginBottom: '1rem' }} />}

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
        {task.status !== 'TODO' && (
          <button onClick={() => onStatusChange(task.id, 'TODO')} style={{ flex: 1, padding: '4px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>To Do</button>
        )}
        {task.status !== 'IN_PROGRESS' && (
          <button onClick={() => onStatusChange(task.id, 'IN_PROGRESS')} style={{ flex: 1, padding: '4px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>In Progress</button>
        )}
        {task.status !== 'DONE' && (
          <button onClick={() => onStatusChange(task.id, 'DONE')} style={{ flex: 1, padding: '4px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>Done</button>
        )}
      </div>
    </div>
  );
}
