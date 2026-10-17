import React, { useState, useEffect } from 'react';
import { getAllFeedback, getStudentIssues, getUserGroupId, markFeedbackAsRead, markIssueAsRead } from '../api/studentPanelApi';
import '../styles/feedback.css';

const Feedback = ({ userName }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [groupId, setGroupId] = useState('');
  const [activeFilter, setActiveFilter] = useState('feedback');

  useEffect(() => {
    // Get groupId for the current user
    const loadGroupId = async () => {
      const groupData = await getUserGroupId(userName);
      setGroupId(groupData?.groupId || '');
    };
    loadGroupId();
  }, [userName]);

  useEffect(() => {
    // Clear localStorage for this user on mount to prevent showing old data
    localStorage.removeItem('feedbackData');
    localStorage.removeItem('issueData');

    // Load feedback from API
    const loadFeedbacks = async () => {
      const result = await getAllFeedback(groupId, userName);
      if (result.success && result.feedbacks) {
        setFeedbacks(result.feedbacks);
        if (result.feedbacks.length > 0) {
          localStorage.setItem('feedbackData', JSON.stringify(result.feedbacks));
        }
      } else {
        setFeedbacks([]);
      }
    };

    // Load issues with teacher replies
    const loadIssues = async () => {
      const result = await getStudentIssues(groupId, userName);
      if (result.success && result.issues) {
        setIssues(result.issues);
        if (result.issues.length > 0) {
          localStorage.setItem('issueData', JSON.stringify(result.issues));
        }
      } else {
        setIssues([]);
      }
    };

    // Only load feedback and issues when groupId is available
    if (groupId) {
      loadFeedbacks();
      loadIssues();

      const interval1 = setInterval(loadFeedbacks, 2000);
      const interval2 = setInterval(loadIssues, 2000);

      return () => {
        clearInterval(interval1);
        clearInterval(interval2);
      };
    } else {
      // New user (no groupId) → empty feedback and issues
      setFeedbacks([]);
      setIssues([]);
    }
  }, [groupId]);

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

  const getStatusClass = (status) => {
    switch (status) {
      case 'Accepted': return 'fd-status-accepted';
      case 'Rejected': return 'fd-status-rejected';
      default: return 'fd-status-pending';
    }
  };

  const handleMarkAsRead = async (feedbackId) => {
    try {
      await markFeedbackAsRead(feedbackId, userName);
      // Update local state to mark as read
      setFeedbacks(prev => prev.map(f => 
        f._id === feedbackId ? { ...f, isRead: true } : f
      ));
    } catch (error) {
      console.error('Error marking feedback as read:', error);
    }
  };

  const handleIssueMarkAsRead = async (issueId) => {
    try {
      await markIssueAsRead(issueId, userName);
      // Update local state to mark as read
      setIssues(prev => prev.map(i => 
        i._id === issueId ? { ...i, isRead: true } : i
      ));
    } catch (error) {
      console.error('Error marking issue as read:', error);
    }
  };

  return (
    <div className="fd-page">
      <div className="fb-header">
        <h2 className="fb-title">Feedback</h2>
        <p className="fb-subtitle">Review feedback and comments from teachers on your submissions.</p>
      </div>

      <div className="fb-filter">
        <button 
          className={`fb-filter-btn ${activeFilter === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveFilter('feedback')}
        >
          Feedback
        </button>
        <button 
          className={`fb-filter-btn ${activeFilter === 'issue' ? 'active' : ''}`}
          onClick={() => setActiveFilter('issue')}
        >
          Issue Feedback
        </button>
      </div>

      <div className="fb-list">
        {(() => {
          const issuesWithReplies = issues.filter(i => i.teacherReply);
          const hasItems = activeFilter === 'feedback'
            ? feedbacks.length > 0
            : issuesWithReplies.length > 0;

          if (!hasItems) {
            return (
              <div className="fd-empty">
                <span className="material-symbols-outlined fd-empty-icon">inbox</span>
                <p className="fd-empty-title">No feedback yet</p>
                <p className="fd-empty-subtitle">Teachers haven't provided any feedback on your submissions.</p>
              </div>
            );
          }

          return (
            <>
              {activeFilter === 'feedback' && feedbacks.map((feedback) => (
                <div key={feedback.id} className="fd-card" onClick={() => handleMarkAsRead(feedback._id)}>
                  <div className="fd-card-header">
                    <span className={`fd-status-tag ${getStatusClass(feedback.ideaCurrentStatus || feedback.status)}`}>
                       {(feedback.ideaCurrentStatus || feedback.status).toUpperCase()}
                    </span>
                    {!feedback.isRead && <span className="fd-new-badge">New</span>}
                    
                  </div>
                  <div className="fd-project-info">
                    <strong>Project:</strong> {feedback.projectName || feedback.ideaTitle}
                  </div>
                    <div className="fd-message">
                       <strong>Teacher Feedback:</strong> {feedback.feedback}
                    </div>
                  <div className="fd-timestamp">{formatTimestamp(feedback.timestamp)}</div>
                </div>
              ))}

              {activeFilter === 'issue' && issuesWithReplies.map((issue) => (
                <div key={issue.id} className="fd-card" onClick={() => handleIssueMarkAsRead(issue._id)}>
                  <div className="fd-card-header">
                    
                    {!issue.isRead && <span className="fd-new-badge">New</span>}
                    
                  </div>
                  <div className="fd-project-info">
                    <strong>Issue Category:</strong> {issue.category}
                  </div>
                  <div className="fd-message">
                    <strong>Issue by {issue.studentName}:</strong> {issue.description}
                  </div>
                  <div className="fd-reply">
                    <strong>Teacher Reply:</strong> {issue.teacherReply}
                  </div>
                  <div className="fd-timestamp">{formatTimestamp(issue.timestamp)}</div>
                </div>
              ))}
            </>
          );
        })()}
</div>

    </div>
  );
};

export default Feedback;
