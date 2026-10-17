import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = ({ userName, onLogout, isOpen, onClose }) => {

  const linkClass = ({ isActive }) =>
    [
      'sidebar-link',
      isActive ? 'sidebar-link-active' : 'sidebar-link-inactive',
    ].join(' ');

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Mobile Close Button */}
        <button className="sidebar-close-btn" onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <span className="material-symbols-outlined">school</span>
          </div>
          <div>
            <h1 className="sidebar-logo-title">EduAdmin</h1>
            <p className="sidebar-logo-subtitle">Platform Manager</p>
          </div>
        </div>

        {/* User Profile */}
        <div className="sidebar-user-profile">
          <div className="sidebar-user-avatar">
            <span className="sidebar-user-initial">{userName ? userName.charAt(0).toUpperCase() : 'A'}</span>
          </div>
          <div className="sidebar-user-info">
            <h1 className="sidebar-user-name">{userName || 'Admin'}</h1>
            <p className="sidebar-user-role">Administrator</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="sidebar-nav">
          <NavLink to="/admin/dashboard" className={linkClass} end onClick={onClose}>
            <span className="material-symbols-outlined">dashboard</span>
            <span className="sidebar-link-text">Dashboard</span>
          </NavLink>

          <div className="sidebar-section-label">User Management</div>

          <NavLink to="/admin/teachers" className={linkClass} onClick={onClose}>
            <span className="material-symbols-outlined">people</span>
            <span className="sidebar-link-text">Manage Teachers</span>
          </NavLink>

          <NavLink to="/admin/students" className={linkClass} onClick={onClose}>
            <span className="material-symbols-outlined">school</span>
            <span className="sidebar-link-text">Manage Students</span>
          </NavLink>

          <div className="sidebar-section-label">System</div>

          <NavLink to="/admin/roles" className={linkClass} onClick={onClose}>
            <span className="material-symbols-outlined">verified_user</span>
            <span className="sidebar-link-text">Roles & Permissions</span>
          </NavLink>
        </nav>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="sidebar-logout-btn"
          title="Logout"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="sidebar-logout-btn-text">Logout</span>
        </button>
      </aside>

    </>
  );
};

export default Sidebar;