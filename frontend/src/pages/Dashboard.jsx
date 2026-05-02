import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const StatCard = ({ label, value, color }) => (
  <div className="card" style={{ textAlign: 'center' }}>
    <div style={{ fontSize: 36, fontWeight: 700, color, fontFamily: 'var(--mono)' }}>{value}</div>
    <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>{label}</div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [t, p] = await Promise.all([
          api.get('/tasks'),
          api.get('/projects'),
        ]);
        setTasks(t.data);
        setProjects(p.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const now = new Date();
  const todo = tasks.filter((t) => t.status === 'todo').length;
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const overdue = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
  ).length;

  if (loading) return <p style={{ color: 'var(--muted)' }}>Loading dashboard...</p>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>
            Here's your work overview
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: 28 }}>
        <StatCard label="Total Tasks" value={tasks.length} color="var(--text)" />
        <StatCard label="Projects" value={projects.length} color="var(--accent)" />
        <StatCard label="Overdue" value={overdue} color={overdue > 0 ? 'var(--danger)' : 'var(--success)'} />
      </div>

      {/* Status breakdown */}
      <div className="grid-3" style={{ marginBottom: 28 }}>
        <div className="card" style={{ borderLeft: '3px solid var(--muted)' }}>
          <div style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>To Do</div>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--mono)' }}>{todo}</div>
        </div>
        <div className="card" style={{ borderLeft: '3px solid var(--accent)' }}>
          <div style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>In Progress</div>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--mono)' }}>{inProgress}</div>
        </div>
        <div className="card" style={{ borderLeft: '3px solid var(--success)' }}>
          <div style={{ color: 'var(--success)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Done</div>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--mono)' }}>{done}</div>
        </div>
      </div>

      {/* Recent tasks */}
      <div className="card">
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Recent Tasks</h2>
        {tasks.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>No tasks yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tasks.slice(0, 6).map((task) => {
              const isOverdue = task.dueDate && new Date(task.dueDate) < now && task.status !== 'done';
              return (
                <div key={task._id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', background: 'var(--surface2)', borderRadius: 8,
                  border: isOverdue ? '1px solid rgba(255,92,92,0.3)' : '1px solid transparent'
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>
                      {task.title}
                      {isOverdue && <span style={{ color: 'var(--danger)', fontSize: 11, marginLeft: 8 }}>⚠ Overdue</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {task.project?.title} {task.assignedTo ? `• ${task.assignedTo.name}` : '• Unassigned'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                    <span className={`badge badge-${task.status}`}>{task.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
