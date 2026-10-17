import React, { useEffect, useState } from "react";
import "../styles/assign-task.css";

const AssignTask = ({ onAddTask, leaderName, members, leaderPassword, groupId }) => {
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [gatePassword, setGatePassword] = useState("");
  const [isAssignUnlocked, setIsAssignUnlocked] = useState(false);
  const [gateError, setGateError] = useState("");

  useEffect(() => {
    setIsAssignUnlocked(false);
    setGatePassword("");
    setGateError("");
  }, [leaderName, leaderPassword]);

  if (!leaderName || !leaderPassword) {
    return (
      <div className="at-access-wrapper">
        <div className="at-access-icon">
          <span className="material-symbols-outlined at-access-lock">
            lock
          </span>
        </div>
        <h2 className="at-access-title">Access Restricted</h2>
        <p className="at-access-text">
          Only the Group Leader can assign tasks.
          The leader must enter the same password from the Progress Tracking page to unlock this page.
        </p>
      </div>
    );
  }


  const handleUnlockAssign = () => {
    if (gatePassword !== leaderPassword) {
      setGateError("Password does not match the one you saved with your team.");
      return;
    }
    setGateError("");
    setIsAssignUnlocked(true);
  };

  if (!isAssignUnlocked) {
    return (
      <div className="at-page">
        <div className="at-header">
          <h1 className="at-title">Confirm leader access</h1>
          <p className="at-subtitle">
            Enter the same password you saved for{" "}
            <span className="at-leader-name">{leaderName}</span> on
            Progress Tracking.
          </p>
        </div>

        <div className="at-card">
          <div className="at-card-border" />
          <div className="at-card-header">
            <h2 className="at-card-header-title">
              <span className="material-symbols-outlined at-card-header-icon">
                verified_user
              </span>
              Leader password
            </h2>
          </div>
          <div className="at-card-body at-gate-body">
            <div className="at-field at-field-full">
              <label className="at-label" htmlFor="at-gate-password">
                Password <span className="at-required">*</span>
              </label>
              <div className="at-password-wrapper">
                <input
                  id="at-gate-password"
                  type="password"
                  value={gatePassword}
                  onChange={(e) => {
                    setGatePassword(e.target.value);
                    setGateError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleUnlockAssign()}
                  className="at-input at-password-input"
                  placeholder="Type your leader password"
                  autoComplete="new-password"
                />
              </div>
              {gateError ? (
                <p className="at-gate-error" >
                  {gateError}
                </p>
              ) : null}
            </div>
            <div className="at-footer at-footer-narrow">
              <button
                type="button"
                onClick={handleUnlockAssign}
                className="at-submit-btn"
                disabled={!gatePassword.trim()}
              >
                <span className="material-symbols-outlined at-submit-icon">
                  lock_open
                </span>
                Continue to assign tasks
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleAddTask = () => {
    if (!newTaskName.trim()) {
      alert("Please enter a Task Description.");
      return;
    }

    if (!newTaskAssignee) {
      alert("Please select a member to assign the task to.");
      return;
    }

    const newTask = {
      id: Date.now(),
      name: newTaskName,
      assignedTo: newTaskAssignee,
      deadline: newTaskDate || "TBD",
      status: "Pending",
      groupId,
    };

    onAddTask(newTask);

    setNewTaskName("");
    setNewTaskDate("");
    setNewTaskAssignee("");

    alert(`Task assigned to ${newTaskAssignee}!`);
  };

  return (
    <div className="at-page">
      <div className="at-header">
        <h1 className="at-title">Assign New Task</h1>
        <p className="at-subtitle">
          Logged in as Leader:{" "}
          <span className="at-leader-name">{leaderName}</span>
        </p>
      </div>

      <div className="at-card">
        <div className="at-card-header">
          <h2 className="at-card-header-title">
            <span className="material-symbols-outlined at-card-header-icon">
              assignment_add
            </span>
            Task Details
          </h2>
        </div>

        <div className="at-card-body">
          {/* Task Name */}
          <div className="at-field at-field-full">
            <label className="at-label">
              Task Description <span className="at-required">*</span>
            </label>
            <input
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              className="at-input"
              placeholder="Enter task description like 'Design the homepage'..."
              type="text"
            />
          </div>

          {/* Assign To */}
          <div className="at-field">
            <label className="at-label">
              Assign To <span className="at-required">*</span>
            </label>
            <div className="at-select-wrapper">
              <select
                value={newTaskAssignee}
                onChange={(e) => setNewTaskAssignee(e.target.value)}
                className="at-select"
              >
                <option value="">Select a member...</option>
                <option value={leaderName}>{leaderName} (leader)</option>
                {members.map((member, idx) => (
                  <option key={idx} value={member}>
                    {member}
                  </option>
                ))}
              </select>
              <span className="at-select-icon-wrapper">
                <span className="material-symbols-outlined at-select-icon">
                  expand_more
                </span>
              </span>
            </div>
          </div>

          {/* Deadline */}
          <div className="at-field">
            <label className="at-label">Deadline</label>
            <div className="at-date-wrapper">
              <input
                value={newTaskDate}
                onChange={(e) => setNewTaskDate(e.target.value)}
                className="at-input at-input-date"
                type="date"
              />
              <span className="material-symbols-outlined at-date-icon">
                calendar_today
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="at-footer">
            <button type="button" onClick={handleAddTask} className="at-submit-btn">
              <span className="material-symbols-outlined at-submit-icon">
                add_task
              </span>
              Confirm Assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignTask;
