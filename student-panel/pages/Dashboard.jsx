import React, { useState, useEffect } from 'react';
import { getAllUploads, getIdeaStatsByGroup, getUserGroupId } from '../api/studentPanelApi';
import { notificationApi } from '../api/NotificationApi';
import '../styles/dashboard.css';

const Dashboard = ({ userName }) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [ideaStats, setIdeaStats] = useState({
    submitted: 0,
    approved: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [groupId, setGroupId] = useState(null);

  useEffect(() => {
    if (!userName) return;

    const loadIdeaStats = async (currentGroupId) => {
      const result = await getIdeaStatsByGroup(currentGroupId);
      if (result.success && result.stats) {
        const stats = {
          submitted: result.stats.submitted,
          approved: result.stats.approved
        };
        setIdeaStats(stats);
        localStorage.setItem(`dashboardIdeaStats_${currentGroupId}`, JSON.stringify(stats));
      }
    };

    const loadNotifications = async (currentGroupId) => {
      try {
        const result = await notificationApi.getNotificationsByGroup(currentGroupId, userName);
        if (result.success) {
          setNotifications(result.notifications);
          setUnreadCount(result.notifications.filter(n => !n.read).length);
          localStorage.setItem(
            `dashboardNotifications_${currentGroupId}_${userName}`,
            JSON.stringify(result.notifications)
          );
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    const refreshDashboard = async () => {
      const groupResult = await getUserGroupId(userName);
      const currentGroupId = groupResult.groupId;

      if (currentGroupId) {
        setGroupId(currentGroupId);
        await loadIdeaStats(currentGroupId);
        await loadNotifications(currentGroupId);
      }

      const uploadsResult = await getAllUploads();
      if (uploadsResult.success && uploadsResult.uploads) {
        setUploadedFiles(uploadsResult.uploads);
      }
    };

    const bootstrap = async () => {
      const groupResult = await getUserGroupId(userName);
      if (groupResult.groupId) {
        const cachedStats = localStorage.getItem(`dashboardIdeaStats_${groupResult.groupId}`);
        if (cachedStats) {
          setIdeaStats(JSON.parse(cachedStats));
        }
        const cachedNotifications = localStorage.getItem(`dashboardNotifications_${groupResult.groupId}_${userName}`);
        if (cachedNotifications) {
          const parsed = JSON.parse(cachedNotifications);
          setNotifications(parsed);
          setUnreadCount(parsed.filter(n => !n.read).length);
        }
        setGroupId(groupResult.groupId);
      }
    };

    bootstrap();
    refreshDashboard();
    const interval = setInterval(refreshDashboard, 2000);

    return () => clearInterval(interval);
  }, [userName]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return 'picture_as_pdf';
    if (fileType.includes('image')) return 'image';
    if (fileType.includes('doc') || fileType.includes('word')) return 'description';
    return 'insert_drive_file';
  };

  const getFileIconColor = (fileType) => {
    if (fileType.includes('pdf')) return 'df-icon-red';
    if (fileType.includes('image')) return 'df-icon-green';
    if (fileType.includes('doc') || fileType.includes('word')) return 'df-icon-blue';
    return 'df-icon-gray';
  };

  const handleDownloadFile = (file) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId, userName);
      if (groupId) {
        const result = await notificationApi.getNotificationsByGroup(groupId, userName);
        if (result.success) {
          setNotifications(result.notifications);
          setUnreadCount(result.notifications.filter(n => !n.read).length);
          localStorage.setItem(
            `dashboardNotifications_${groupId}_${userName}`,
            JSON.stringify(result.notifications)
          );
        }
      }
      setShowNotifications(false);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="d-container">
      <div className="dn-wrapper">
        <button
          className="dn-icon"
          type="button"
          aria-label="Notifications"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <span className="material-symbols-outlined">notifications</span>
          {unreadCount > 0 && <span className="dn-badge">{unreadCount}</span>}
        </button>
        {showNotifications && (
          <div className="dn-dropdown">
            <div className="dn-header">
              <h3>Notifications</h3>
              <button onClick={() => setShowNotifications(false)} className="d-close-btn">×</button>
            </div>
            <div className="dn-list">
              {notifications.length === 0 ? (
                <p className="dn-empty">No notifications</p>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification._id}
                    type="button"
                    className={`dn-item ${notification.read ? 'dn-read' : ''}`}
                    onClick={() => handleMarkAsRead(notification._id)}
                  >
                    <p className="dn-title">{notification.title}</p>
                    <p className="dn-leader">Leader: {notification.leaderName}</p>
                    <p className="dn-leader">Status: {notification.status}</p>
                    <p className="dn-leader">Time: {formatTimestamp(notification.submittedAt)}</p>
                    {!notification.read && <span className="dn-new">New</span>}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Welcome Banner */}
      <div className="dw-banner">
        <div className="dw-content">
          <h2 className="dw-title">Welcome back, Student!</h2>
          <p className="dw-subtitle">Here's a quick overview of your dashboard.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="ds-grid">
        <div className="ds-card">
          <div className="ds-header">
            <div className="ds-icon ds-icon-purple">
              <span className="material-symbols-outlined text-2xl">upload</span>
            </div>
            <span className="ds-badge ds-badge-purple">Submitted</span>
          </div>
          <div className="ds-content">
            <h3 className="ds-label">Submit Ideas</h3>
            <p className="ds-value">{ideaStats.submitted}</p>
          </div>
        </div>

        <div className="ds-card">
          <div className="ds-header">
            <div className="ds-icon ds-icon-green">
              <span className="material-symbols-outlined text-2xl">check_circle</span>
            </div>
            <span className="ds-badge ds-badge-green">Approved</span>
          </div>
          <div className="ds-content">
            <h3 className="ds-label">Approved Ideas</h3>
            <p className="ds-value">{ideaStats.approved}</p>
          </div>
        </div>

        <div className="df-card">
          <div className="df-header">
            <h3 className="df-title">Latest File Uploads</h3>
            <span className="ds-badge ds-badge-slate">{uploadedFiles.length} files</span>
          </div>
          <div className="df-list">
            {uploadedFiles.length === 0 ? (
              <div className="df-empty">
                <span className="material-symbols-outlined df-empty-icon">folder_open</span>
                <p className="df-empty-title">No files uploaded yet</p>
                <p className="df-empty-subtitle">Check back later for new materials</p>
              </div>
            ) : (
              uploadedFiles.map((file) => (
                <div key={file.id} className="df-item">
                  <div className={`df-icon ${getFileIconColor(file.type)}`}>
                    <span className="material-symbols-outlined text-[20px]">{getFileIcon(file.type)}</span>
                  </div>
                  <div className="df-info">
                    <p className="df-name">{file.name}</p>
                    {file.announcement && file.announcement !== 'No announcement' && (
                      <p className="df-announcement">{file.announcement}</p>
                    )}
                    <div className="df-meta"> 
                      <span>{file.size}</span>
                      <span>•</span>
                      <span>{formatTimestamp(file.uploadDate)}</span>
                    </div>
                  </div>
                  <button 
                    className="d-view-btn"
                    onClick={() => handleDownloadFile(file)}
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span>Download</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
