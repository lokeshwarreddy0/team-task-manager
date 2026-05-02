import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLink = (to, label) => (
    <Link
      to={to}
      style={{
        color: pathname === to ? 'var(--accent)' : 'var(--muted)',
        fontWeight: 600,
        fontSize: 14,
        padding: '6px 14px',
        borderRadius: 8,
        background: pathname === to ? 'rgba(108,99,255,0.12)' : 'transparent',
        transition: 'all 0.2s',
      }}
    >
      {label}
    </Link>
  );

  return (
    <nav
      style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent)', fontWeight: 700, fontSize: 16 }}>
          ⬡ TaskFlow
        </span>
        <div style={{ display: 'flex', gap: 4, marginLeft: 24 }}>
          {navLink('/', 'Dashboard')}
          {navLink('/projects', 'Projects')}
          {navLink('/tasks', 'Tasks')}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>
          {user?.name}
        </span>
        <span className={`badge badge-${user?.role}`}>{user?.role}</span>
        <button className="btn-ghost" onClick={handleLogout} style={{ padding: '6px 14px', fontSize: 13 }}>
          Logout
        </button>
      </div>
    </nav>
  );
}
