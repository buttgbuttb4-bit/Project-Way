import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardView from './pages/DashboardView';
import AllIdeasView from './pages/AllIdeasView';
import ProgressView from './pages/ProgressView';
import Upload from './pages/Upload';
import NavButton from './components/NavButton';
import TeacherProfile from './components/TeacherProfile';
import { notifications, getAllIssues, markIssueAsRead, getRoles } from './api/teacherPanelApi';
import './styles/main.css';
import './styles/utilities.css';
import './styles/scrollbar.css';

const Navigation = ({ userName, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showIssues, setShowIssues] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [ideaNotifications, setIdeaNotifications] = useState([]);
  const [studentIssues, setStudentIssues] = useState([]);
  const [notificationSelectId, setNotificationSelectId] = useState(null);
  const [teacherPermissions, setTeacherPermissions] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const response = await getRoles();
        if (response.roles && response.roles.length > 0) {
          const roles = response.roles.map((role) => ({
            ...role,
            id: role.roleId || role._id || role.id,
          }));
          const teacher = roles.find(r => r.id === '2');
          if (teacher) {
            setTeacherPermissions(teacher.permissions);
          }
        }
      } catch (error) {
        console.error('Failed to load permissions from backend:', error);
      }
    };

    loadPermissions();

    // Poll for permission updates every 30 seconds
    const interval = setInterval(loadPermissions, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const result = await notifications.getAllNotifications(userName);
        if (result.success) {
          setIdeaNotifications(result.notifications.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)));
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
        setIdeaNotifications([]);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 2000);
    return () => clearInterval(interval);
  }, [userName]);

  useEffect(() => {
    const loadIssues = async () => {
      try {
        const result = await getAllIssues(userName);
        if (result.success) {
          setStudentIssues(result.issues || []);
        }
      } catch (error) {
        console.error('Error loading issues:', error);
        setStudentIssues([]);
      }
    };

    loadIssues();
    const interval = setInterval(loadIssues, 2000);
    return () => clearInterval(interval);
  }, [userName]);

  const canUpload = teacherPermissions.includes('idea.upload');
  const canViewProgress = teacherPermissions.includes('progress.track');
  const canReviewIdeas = teacherPermissions.includes('idea.review');
  const canCreateTasks = teacherPermissions.includes('idea.viewdashboard');

  const isActive = (path) => {
    const currentPath = location.pathname;
    return currentPath === `/teacher${path}` || currentPath === path;
  };

  const unreadNotificationCount = ideaNotifications.filter((n) => !n.read).length;
  const unreadIssueCount = studentIssues.filter((issue) => !issue.isRead).length;

  const handleOpenIssues = () => {
    const unread = studentIssues.filter((issue) => !issue.isRead);
    setStudentIssues((prev) => prev.map((issue) => ({ ...issue, isRead: true })));
    setShowIssues(true);
    unread.forEach((issue) => {
      const issueId = issue._id || issue.id;
      if (issueId && userName) {
        markIssueAsRead(issueId, userName);
      }
    });
  };

  const handleNotificationClick = async (notification) => {
    try {
      const result = await notifications.markAsRead(notification._id, userName);
      if (result.success) {
        const updated = ideaNotifications.map((n) =>
          n._id === notification._id ? { ...n, read: true } : n
        );
        setIdeaNotifications(updated);
        setNotificationSelectId(notification.ideaId);
        setShowNotifications(false);
        if (!isActive('/dashboard')) {
          navigate('/teacher/dashboard');
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationHandled = useCallback(() => {
    setNotificationSelectId(null);
  }, []);

  const dashboardProps = {
    showIssues,
    setShowIssues,
    notificationSelectId,
    onNotificationHandled: handleNotificationHandled,
  };

  const handleNavigation = (path) => {
    navigate(`/teacher${path}`);
  };

  const navItems = [
    { label: 'Dashboard', icon: 'dashboard', path: '/dashboard', visible: canCreateTasks },
    { label: 'All Ideas', icon: 'tips_and_updates', path: '/allideas', visible: canReviewIdeas },
    { label: 'Progress', icon: 'bar_chart', path: '/progress', visible: canViewProgress },
    { label: 'Upload', icon: 'upload', path: '/upload', visible: canUpload },
  ];

  return (
    <div className="app-container">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-content">
          {/* Mobile Close Button */}
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
            <span className="material-symbols-outlined">close</span>
          </button>

          <TeacherProfile userName={userName} />
          <nav className="nav-menu">
            {navItems
              .filter((item) => item.visible)
              .map((item) => (
                <NavButton
                  key={item.path}
                  label={item.label}
                  icon={item.icon}
                  isActive={isActive(item.path)}
                  onClick={() => {
                    handleNavigation(item.path);
                    setSidebarOpen(false);
                  }}
                />
              ))}
          </nav>
          <button
            type="button"
            onClick={onLogout}
            className="logout-btn"
            title="Logout"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="logout-btn-text">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          {/* Mobile Menu Toggle */}
          <button className="mobile-menu-toggle" onClick={() => setSidebarOpen(true)}>
            <span className="material-symbols-outlined">menu</span>
          </button>

          <div className="header-actions">
            {isActive('/dashboard') && canCreateTasks && (
              <>
                <button 
                  onClick={handleOpenIssues}
                  className="issues-btn"
                >
                  <span className="material-symbols-outlined">help</span>
                  Issues
                  {unreadIssueCount > 0 && (
                    <span className="issues-badge">{unreadIssueCount}</span>
                  )}
                </button>
                <div className="notification-wrapper">
                  <button
                    type="button"
                    className="notification-btn"
                    onClick={() => setShowNotifications((prev) => !prev)}
                    aria-label="Idea notifications"
                  >
                    <span className="material-symbols-outlined">notifications</span>
                    {unreadNotificationCount > 0 && (
                      <span className="notification-badge">{unreadNotificationCount}</span>
                    )}
                  </button>
                  {showNotifications && (
                    <>
                      <div
                        className="notification-backdrop"
                        onClick={() => setShowNotifications(false)}
                      />
                      <div className="notification-panel">
                        <div className="notification-panel-header">
                          <h3 className="notification-panel-title">New Idea Submissions</h3>
                          <button
                            type="button"
                            className="notification-panel-close"
                            onClick={() => setShowNotifications(false)}
                          >
                            <span className="material-symbols-outlined">close</span>
                          </button>
                        </div>
                        <div className="notification-panel-body">
                          {ideaNotifications.length === 0 ? (
                            <p className="notification-empty">No idea submissions yet.</p>
                          ) : (
                            ideaNotifications.map((notification, index) => {
                              const notificationKey = notification._id || notification.id || `notification-${index}`;

                              return (
                                <button
                                  key={notificationKey}
                                  type="button"
                                  className={`notification-item ${notification.read ? 'notification-item-read' : ''}`}
                                  onClick={() => handleNotificationClick(notification)}
                                >
                                  <p className="notification-item-title">{notification.title}</p>
                                  <p className="notification-item-leader">
                                    Leader: {notification.leaderName}
                                  </p>
                                  {!notification.read && (
                                    <span className="notification-item-new">New</span>
                                  )}
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="content-area">
          <div className="content-wrapper">
            {(() => {
              const currentPath = location.pathname;
              if ((currentPath === '/teacher/dashboard' || currentPath === '/teacher') && canCreateTasks) {
                return <DashboardView {...dashboardProps} />;
              } else if (currentPath === '/teacher/allideas' && canReviewIdeas) {
                return <AllIdeasView />;
              } else if (currentPath === '/teacher/progress' && canViewProgress) {
                return <ProgressView />;
              } else if (currentPath === '/teacher/upload' && canUpload) {
                return <Upload />;
              }
              return <DashboardView {...dashboardProps} />;
            })()}
          </div>
        </div>
      </main>
    </div>
  );
};

const App = ({ userName, onLogout }) => {
  return <Navigation userName={userName} onLogout={onLogout} />;
};

export default App;
