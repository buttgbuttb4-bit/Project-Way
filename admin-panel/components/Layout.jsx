// Layout.js
import React, { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import '../styles/Layout.css';

const Layout = ({ children, userName, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="admin-layout">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      <Sidebar userName={userName} onLogout={onLogout} isOpen={sidebarOpen} onClose={toggleSidebar} />

      <div className="admin-main">
        {/* Top Header */}
        <header className="admin-header">
          {/* Mobile Menu Toggle */}
          <button className="admin-menu-toggle" onClick={toggleSidebar}>
            <span className="material-symbols-outlined">menu</span>
          </button>

          {/* Spacer */}
          <div className="admin-header-spacer" />
        </header>

        {/* Main Content Scroll Area */}
        <main className="admin-content">
          <div className="admin-content-inner">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;