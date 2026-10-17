import React, { useState } from 'react';
import { getUserGroupId, submitIssue } from '../api/studentPanelApi';
import '../styles/help.css';

const Help = ({ userName, projectName }) => {
  const [issueType, setIssueType] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [charCount, setCharCount] = useState(0);

  const handleDescriptionChange = (e) => {
    const text = e.target.value;

      setIssueDescription(text);
      setCharCount(text.length);

  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!issueType || !issueDescription.trim()) {
      alert('Please select an issue category and provide a description');
      return;
    }

    // Create new issue
    const newIssue = {
      category: issueType,
      description: issueDescription,
      studentName: userName || 'Student',
      projectName: projectName || 'Student Project',
    };

    // Submit to backend API
    try {
      const groupResult = await getUserGroupId(userName);
      if (!groupResult.groupId) {
        alert('Please submit an idea before reporting an issue.');
        return;
      }

      const result = await submitIssue(newIssue);

      if (result.success) {
        // Reset form
        setIssueType('');
        setIssueDescription('');
        setCharCount(0);

        alert('Your issue has been submitted to the teacher!');
      } else {
        alert('Error submitting issue: ' + result.message);
      }
    } catch (error) {
      console.error('Error submitting issue:', error);
      alert('Error submitting issue');
    }
  };

  return (
    <div className="h-container">
      <div className="h-header">
        <h1 className="h-title">Need Assistance?</h1>
        <p className="h-subtitle">If you are facing any issues with your project or task, please let us know.</p>
      </div>

      <div className="h-card">
        <div className="h-card-inner">
          <div className="h-card-header">
            <div>
              <h2 className="h-card-title">Report an Issue</h2>
              <p className="h-card-description">Describe your problem in detail so the teacher can help you.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="h-form-group">
              <label className="h-label" htmlFor="issue-type">
                What type of issue is this?
              </label>
              <select
                className="h-select"
                id="issue-type"
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
              >
                <option value="">Select an issue category...</option>
                <option value="Technical">Technical Problem</option>
                <option value="Guidance">Project Guidance</option>
                <option value="Resource">Resource Issue</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="h-form-group">
              <label className="h-label" htmlFor="issue-description">
                Describe your Issue/Problem.
              </label>
              <textarea 
                className="h-textarea" 
                id="issue-description" 
                placeholder="Please provide specific details about what you're experiencing..."
                value={issueDescription}
                onChange={handleDescriptionChange}
                maxLength={1000}
              ></textarea>
              <p className="h-char-count">{charCount}/1000 characters</p>
            </div>

            <div className="h-footer">
              <div className="h-info-text">
                <span className="material-symbols-outlined h-info-icon">info</span>
                The teacher will be notified immediately.
              </div>
              <div className="h-buttons">
                <button type="button" className="h-cancel-btn" onClick={() => {
                  setIssueType('');
                  setIssueDescription('');
                  setCharCount(0);
                }}>
                  Cancel
                </button>
                <button type="submit" className="h-submit-btn">
                  <span>Submit to Teacher</span>
                  <span className="material-symbols-outlined h-submit-icon">send</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Help;
