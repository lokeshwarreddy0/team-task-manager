import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const STATUSES = ['todo', 'in-progress', 'done'];
const PRIORITIES = ['low', 'medium', 'high'];

const Modal = ({ title, onClose, children }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20,
  }}>
    <div className="card" style={{ width: '100%', maxWidth: 500, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h2>
        <button className="btn-ghost" onClick={onClose} style={{ padding: '4px 10px' }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [statusModal, setStatusModal] = useState(null); // for member status update
  const [filter, setFilter] = useState({ status: '', priority: '', project: '' });
  const [form, setForm] = useState({ title: '', description: '', project: '', assignedTo: '', status: 'todo', priority: 'medium', dueDate: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [t, p] = await Promise.all([api.get('/tasks'), api.get('/projects')]);
      setTasks(t.data);
      setProjects(p.data);
      if (user.role === 'admin') {
        const u = await api.get('/users');
        setUsers(u.data);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditTask(null);
    setForm({ title: '', description: '', project: '', assignedTo: '', status: 'todo', priority: 'medium', dueDate: '' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      title: task.title, description: task.description || '',
      project: task.project?._id || '', assignedTo: task.assignedTo?._id || '',
      status: task.status, priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { ...form, assignedTo: form.assignedTo || null, dueDate: form.dueDate || null };
      if (editTask) {
        const { data } = await api.put(`/tasks/${editTask._id}`, payload);
        setTasks(tasks.map((t) => (t._id === data._id ? data : t)));
      } else {
        const { data } = await api.post('/tasks', payload);
        setTasks([data, ...tasks]);
      }
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving task');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      const { data } = await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map((t) => (t._id === data._id ? data : t)));
      setStatusModal(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const filtered = tasks.filter((t) => {
    if (filter.status && t.status !== filter.status) return false;
    if (filter.priority && t.priority !== filter.priority) return false;
    if (filter.project && t.project?._id !== filter.project) return false;
    return true;
  });

  const now = new Date();

  if (loading) return <p style={{ color: 'var(--muted)' }}>Loading tasks...</p>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Tasks</h1>
        {user.role === 'admin' && (
          <button className="btn-primary" onClick={openCreate}>+ New Task</button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })} style={{ width: 'auto', minWidth: 140 }}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filter.priority} onChange={(e) => setFilter({ ...filter, priority: e.target.value })} style={{ width: 'auto', minWidth: 140 }}>
          <option value="">All Priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filter.project} onChange={(e) => setFilter({ ...filter, project: e.target.value })} style={{ width: 'auto', minWidth: 160 }}>
          <option value="">All Projects</option>
          {projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
        </select>
        {(filter.status || filter.priority || filter.project) && (
          <button className="btn-ghost" onClick={() => setFilter({ status: '', priority: '', project: '' })}>Clear</button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
          No tasks found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((task) => {
            const isOverdue = task.dueDate && new Date(task.dueDate) < now && task.status !== 'done';
            return (
              <div key={task._id} className="card" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                border: isOverdue ? '1px solid rgba(255,92,92,0.35)' : '1px solid var(--border)',
                flexWrap: 'wrap',
              }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                    {task.title}
                    {isOverdue && <span style={{ color: 'var(--danger)', fontSize: 11, marginLeft: 8, fontWeight: 700 }}>⚠ OVERDUE</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {task.project?.title}
                    {task.assignedTo ? ` • ${task.assignedTo.name}` : ' • Unassigned'}
                    {task.dueDate && ` • Due: ${new Date(task.dueDate).toLocaleDateString()}`}
                  </div>
                  {task.description && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{task.description}</div>}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                  <span className={`badge badge-${task.status}`}>{task.status}</span>
                  {user.role === 'admin' ? (
                    <>
                      <button className="btn-ghost" onClick={() => openEdit(task)} style={{ padding: '4px 10px', fontSize: 12 }}>Edit</button>
                      <button className="btn-danger" onClick={() => handleDelete(task._id)} style={{ padding: '4px 10px', fontSize: 12 }}>Delete</button>
                    </>
                  ) : (
                    <button className="btn-ghost" onClick={() => setStatusModal(task)} style={{ padding: '4px 10px', fontSize: 12 }}>Update Status</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Member status update modal */}
      {statusModal && (
        <Modal title="Update Task Status" onClose={() => setStatusModal(null)}>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>{statusModal.title}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {STATUSES.map((s) => (
              <button
                key={s}
                className={statusModal.status === s ? 'btn-primary' : 'btn-ghost'}
                onClick={() => handleStatusUpdate(statusModal._id, s)}
                style={{ width: '100%', padding: '11px', textAlign: 'left', textTransform: 'capitalize' }}
              >
                {s === 'todo' ? '📋 To Do' : s === 'in-progress' ? '🔄 In Progress' : '✅ Done'}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {/* Admin create/edit modal */}
      {showModal && (
        <Modal title={editTask ? 'Edit Task' : 'New Task'} onClose={() => setShowModal(false)}>
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Task Title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Design login page" required />
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Brief task details..." style={{ resize: 'vertical' }} />
            </div>
            <div className="grid-2">
              <div>
                <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Project *</label>
                <select value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} required>
                  <option value="">Select project</option>
                  {projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Assign To</label>
                <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
                  <option value="">Unassigned</option>
                  {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div>
                <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Priority</label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Due Date</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button className="btn-primary" type="submit" disabled={saving} style={{ flex: 1, padding: '11px' }}>
                {saving ? 'Saving...' : editTask ? 'Update Task' : 'Create Task'}
              </button>
              <button className="btn-ghost" type="button" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
