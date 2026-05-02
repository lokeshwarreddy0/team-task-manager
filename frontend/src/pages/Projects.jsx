import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Modal = ({ title, onClose, children }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20,
  }}>
    <div className="card" style={{ width: '100%', maxWidth: 480, position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h2>
        <button className="btn-ghost" onClick={onClose} style={{ padding: '4px 10px' }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', members: [] });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [p] = await Promise.all([api.get('/projects')]);
      setProjects(p.data);
      if (user.role === 'admin') {
        const u = await api.get('/users');
        setUsers(u.data.filter((u2) => u2._id !== user._id));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditProject(null);
    setForm({ title: '', description: '', members: [] });
    setError('');
    setShowModal(true);
  };

  const openEdit = (proj) => {
    setEditProject(proj);
    setForm({ title: proj.title, description: proj.description || '', members: proj.members.map((m) => m._id) });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editProject) {
        const { data } = await api.put(`/projects/${editProject._id}`, form);
        setProjects(projects.map((p) => (p._id === data._id ? data : p)));
      } else {
        const { data } = await api.post('/projects', form);
        setProjects([data, ...projects]);
      }
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const toggleMember = (uid) => {
    setForm((prev) => ({
      ...prev,
      members: prev.members.includes(uid)
        ? prev.members.filter((m) => m !== uid)
        : [...prev.members, uid],
    }));
  };

  if (loading) return <p style={{ color: 'var(--muted)' }}>Loading projects...</p>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Projects</h1>
        {user.role === 'admin' && (
          <button className="btn-primary" onClick={openCreate}>+ New Project</button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
          No projects yet. {user.role === 'admin' && 'Create one to get started.'}
        </div>
      ) : (
        <div className="grid-2">
          {projects.map((proj) => (
            <div key={proj._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>{proj.title}</h3>
                {user.role === 'admin' && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn-ghost" onClick={() => openEdit(proj)} style={{ padding: '4px 10px', fontSize: 12 }}>Edit</button>
                    <button className="btn-danger" onClick={() => handleDelete(proj._id)} style={{ padding: '4px 10px', fontSize: 12 }}>Delete</button>
                  </div>
                )}
              </div>
              {proj.description && <p style={{ fontSize: 13, color: 'var(--muted)' }}>{proj.description}</p>}
              <div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Owner: {proj.owner?.name}</div>
                {proj.members.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {proj.members.map((m) => (
                      <span key={m._id} style={{
                        background: 'var(--surface2)', border: '1px solid var(--border)',
                        borderRadius: 20, padding: '2px 10px', fontSize: 11, color: 'var(--text)'
                      }}>{m.name}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editProject ? 'Edit Project' : 'New Project'} onClose={() => setShowModal(false)}>
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Project Title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Website Redesign" required />
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Brief description..." style={{ resize: 'vertical' }} />
            </div>
            {users.length > 0 && (
              <div>
                <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 8 }}>Team Members</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 140, overflowY: 'auto' }}>
                  {users.map((u) => (
                    <label key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.members.includes(u._id)} onChange={() => toggleMember(u._id)} style={{ width: 'auto' }} />
                      {u.name} <span style={{ color: 'var(--muted)', fontSize: 11 }}>{u.email}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button className="btn-primary" type="submit" disabled={saving} style={{ flex: 1, padding: '11px' }}>
                {saving ? 'Saving...' : editProject ? 'Update Project' : 'Create Project'}
              </button>
              <button className="btn-ghost" type="button" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
