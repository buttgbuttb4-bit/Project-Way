import React from "react";

const Sidebar = ({
  isActive,
  onNavigate,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  canViewProgress,
  canCreateDiagram,
  canSubmitIdea,
  canViewHelp,
  userName,
  onLogout,
}) => {
  const isEduDashContext =
    isActive("/progress") ||
    isActive("/help") ||
    isActive("/assign-task");

  const NavItem = ({ path, icon, label, filled = false }) => {
    const active = isActive(path);
    return (
      <button
        onClick={() => {
          onNavigate(path);
          setIsMobileMenuOpen(false);
        }}
        className={
          "sb-nav-item " +
          (active ? "sb-nav-item-active" : "sb-nav-item-inactive")
        }
      >
        <span
          className={
            "material-symbols-outlined sb-nav-item-icon " +
            (filled && active ? "sb-nav-item-icon-filled" : "")
          }
        >
          {icon}
        </span>
        <span className="sb-nav-item-label">{label}</span>
      </button>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="sb-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={
          "sb-aside " +
          (isMobileMenuOpen ? "sb-aside-open" : "sb-aside-closed")
        }
      >
        <div className="sb-header">
          <div className="sb-user-profile">
            <div className="sb-user-avatar">
              <span className="sb-user-initial">{userName ? userName.charAt(0).toUpperCase() : 'U'}</span>
            </div>
            <div className="sb-user-info">
              <h1 className="sb-title">
                {isEduDashContext ? "Task Management" : "Student Panel"}
              </h1>
              <p className="sb-user-name">{userName || 'User'}</p>
            </div>
          </div>
        </div>

        <nav className="sb-nav">
          {!isEduDashContext ? (
            <>
              <NavItem path="/dashboard" icon="dashboard" label="Dashboard" />
              {canSubmitIdea && <NavItem path="/submit" icon="add_circle" label="Submit Idea" />}
              <NavItem path="/feedback" icon="forum" label="Feedback" />
              {canCreateDiagram && <NavItem path="/diagram-editor" icon="schema" label="Diagram Editor" />}

              <div className="sb-project-section">
                <p className="sb-project-heading">Projects</p>
                {canViewProgress && <button
                  onClick={() => onNavigate("/progress")}
                  className="sb-project-link"
                >
                  
                  <span className="sb-project-label">
                    Task Management
                  </span>
                </button>}
              </div>
            </>
          ) : (
            <>
              <div className="sb-back-wrapper">
                <button
                  onClick={() => onNavigate("/dashboard")}
                  className="sb-back-btn"
                >
                  <span className="material-symbols-outlined sb-back-icon">
                    arrow_back
                  </span>
                  Back to Portal
                </button>
              </div>

              {canViewProgress && <NavItem
                path="/progress"
                icon="trending_up"
                label="Progress Tracking"
                filled
              />}
              <NavItem
                path="/assign-task"
                icon="assignment_add"
                label="Assign Task"
                filled
              />
              {canViewHelp && <NavItem path="/help" icon="help" label="Help" filled />}
            </>
          )}
        </nav>

        <button
          onClick={onLogout}
          className="sb-logout-btn"
          title="Logout"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="sb-logout-btn-text">Logout</span>
        </button>

      </aside>
    </>
  );
};

export default Sidebar;