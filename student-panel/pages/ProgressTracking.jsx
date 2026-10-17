import React, { useEffect, useState } from "react";
import { updateStudentProgress, getIdeasByGroupId, getGroupByGroupId, getAllIdeas } from "../api/studentPanelApi";
import "../styles/progress-tracking.css";

const ProgressTracking = ({
  tasks,
  leaderName,
  members,
  onToggleTask,
  projectName,
  groupId,
  onSaveTeam,
  isGroupProfileSaved,
  currentUser,
}) => {
  const [draftProjectName, setDraftProjectName] = useState("");
  const [leaderDraft, setLeaderDraft] = useState("");
  const [passwordDraft, setPasswordDraft] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [pendingMembers, setPendingMembers] = useState([]);
  const [groupData, setGroupData] = useState(null);


  // Load group data when groupId is available
  useEffect(() => {
    const loadGroupData = async () => {
      if (groupId) {
        try {
          const result = await getGroupByGroupId(groupId);
          if (result.success && result.group) {
            setGroupData(result.group);
          }
        } catch (error) {
          console.error('Error loading group data:', error);
        }
      }
    };

    loadGroupData();
  }, [groupId]);


  const handleAddMemberClick = () => {
    const name = newMemberName.trim();
    if (!name || pendingMembers.includes(name)) return;
    setPendingMembers((prev) => [...prev, name]);
    setNewMemberName("");
  };

  const handleRemovePendingMember = (name) => {
    setPendingMembers((prev) => prev.filter((m) => m !== name));
  };

  const handleProjectNameChange = (e) => {
    let value = e.target.value;
    // Allow alphabets, numbers, and spaces
    value = value.replace(/[^a-zA-Z0-9 ]/g, '');
    // Capitalize first letter
    if (value.length > 0) {
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }
    // Max 50 characters
    if (value.length > 50) {
      value = value.slice(0, 50);
    }
    setDraftProjectName(value);
  };

  const handleLeaderNameChange = (e) => {
    let value = e.target.value;
    // Allow alphabets and spaces only
    value = value.replace(/[^a-zA-Z ]/g, '');
    // Capitalize first letter of each word
    value = value.replace(/\b\w/g, char => char.toUpperCase());
    // Max 20 characters
    if (value.length > 20) {
      value = value.slice(0, 20);
    }
    setLeaderDraft(value);
  };

  const handleMemberNameChange = (e) => {
    let value = e.target.value;
    // Allow alphabets and spaces only
    value = value.replace(/[^a-zA-Z ]/g, '');
    // Capitalize first letter of each word
    value = value.replace(/\b\w/g, char => char.toUpperCase());
    // Max 20 characters
    if (value.length > 20) {
      value = value.slice(0, 20);
    }
    setNewMemberName(value);
  };

  const handleSaveTeamClick = async () => {
    const trimmedProjectName = draftProjectName.trim();
    const leader = leaderDraft.trim();

    if (!trimmedProjectName || !leader || !passwordDraft.trim() || pendingMembers.length === 0) {
      alert("All fields must be filled before saving the team.");
      return;
    }

    if (passwordDraft.trim().length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    // Validate leader and member names against group data (role-swap check)
    if (groupData) {
      const validGroupMembers = [groupData.leaderName, ...groupData.members];
      
      // Validate leader name
      if (!validGroupMembers.includes(leader)) {
        alert("Invalid entry: You can only enter the leader or members from your own group.");
        return;
      }
      if (groupData.members.includes(leader)) {
        alert("Invalid entry: Please enter the correct role (Leader or Member) from your group.");
        return;
      }
      
      // Validate all member names
      for (const member of pendingMembers) {
        if (!validGroupMembers.includes(member)) {
          alert("Invalid entry: You can only enter the leader or members from your own group.");
          return;
        }
        if (member === groupData.leaderName) {
          alert("Invalid entry: Please enter the correct role (Leader or Member) from your group.");
          return;
        }
      }
    }

      // Only the person who is registering as leader can save
      if (currentUser !== leader) {
        alert("Only the group leader can save the team. Members cannot save the team.");
        return;
      }
    

    // Check if the project name is valid for this group
    if (groupId) {
      try {
        const ideasResult = await getIdeasByGroupId(groupId);
        if (ideasResult.success && ideasResult.ideas) {
          const matchingIdea = ideasResult.ideas.find(idea => 
            idea.projectName === trimmedProjectName || idea.title === trimmedProjectName
          );
          
          if (matchingIdea) {
            // Check if the project is rejected
            if (matchingIdea.status === 'Rejected') {
              alert("Invalid entry: This project was rejected. You can only save an Accepted project name.");
              return;
            }
            // If status is Accepted, allow save
          } else {
            // Project name not found in current group's ideas
            // Check if it belongs to another group
            const allIdeasResult = await getAllIdeas();
            if (allIdeasResult.success && allIdeasResult.ideas) {
              const otherGroupIdea = allIdeasResult.ideas.find(idea => 
                (idea.projectName === trimmedProjectName || idea.title === trimmedProjectName) &&
                idea.groupId !== groupId
              );
              
              if (otherGroupIdea) {
                alert("Invalid entry: This project name belongs to another group. You cannot use it.");
                return;
              }
            }
          }
        }
      } catch (error) {
        console.error('Error checking project status:', error);
      }
    }

    await onSaveTeam(leader, pendingMembers, passwordDraft.trim(), trimmedProjectName);
  };

  const handleToggleTaskWithValidation = (taskId, assignedTo) => {
    // Check if current user is the one assigned to this task
    if (currentUser !== assignedTo) {
      alert("You can only mark your own assigned tasks as done.");
      return;
    }
    // If validation passes, call the original toggle function
    onToggleTask(taskId);
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const progressPercentage =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // Send progress updates to backend when tasks change
  useEffect(() => {
    if (groupId && projectName && leaderName && isGroupProfileSaved) {
      const sendProgressUpdate = async () => {
        try {
          const progressData = {
            groupId,
            projectName,
            leaderName,
            members,
            progress: progressPercentage,
            tasks: tasks.map(t => ({
              name: t.name,
              assignedTo: t.assignedTo,
              deadline: t.deadline,
              status: t.status
            })),
            milestones: {
              current: progressPercentage === 0 ? 'Not started' : progressPercentage === 100 ? 'Completed' : 'In progress',
              next: progressPercentage < 100 ? 'Continue working' : 'Project completed'
            }
          };

          await updateStudentProgress(progressData);
        } catch (error) {
          console.error('Error sending progress update:', error);
        }
      };

      sendProgressUpdate();
    }
  }, [tasks, groupId, projectName, leaderName, members, progressPercentage, isGroupProfileSaved]);

  const allPeople = leaderName ? [leaderName, ...members] : [...members];
  const memberStats = allPeople.map((person) => {
    const personTasks = tasks.filter((t) => t.assignedTo === person);
    const personTotal = personTasks.length;
    const personCompleted = personTasks.filter(
      (t) => t.status === "Completed"
    ).length;
    const personProgress =
      personTotal === 0
        ? 0
        : Math.round((personCompleted / personTotal) * 100);
    return {
      name: person,
      total: personTotal,
      completed: personCompleted,
      progress: personProgress,
    };
  });

  const renderGroupBlock = () => {
    if (isGroupProfileSaved ) {
      return (
        <div className="pt-card">
          <div className="pt-card-header pt-card-header-muted">
            <h2 className="pt-card-header-title">
              <span className="material-symbols-outlined pt-card-header-icon">
                badge
              </span>
              Your group
            </h2>
          </div>
          <div className="pt-card-body pt-summary-body">
            <div className="pt-summary-row">
              <span className="pt-summary-label">Project name</span>
              <span className="pt-summary-value">{projectName}</span>
            </div>
            <div className="pt-summary-row">
              <span className="pt-summary-label">Leader</span>
              <span className="pt-summary-value">{leaderName}</span>
            </div>
            <div className="pt-summary-row ">
              <span className="pt-summary-label">Members</span>
              <span className="pt-summary-value">
                {members.length > 0 ? members.join(", ") : "None added"}
              </span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="pt-card">
          <div className="pt-card-header pt-card-header-muted">
            <h2 className="pt-card-header-title">
              <span className="material-symbols-outlined pt-card-header-icon">
                folder_special
              </span>
              Project & team setup
            </h2>
          </div>
          <div className="pt-card-body">
            <div className="pt-field">
              <label className="pt-field-label" htmlFor="pt-project-name">
                Project name
              </label>
              <input
                id="pt-project-name"
                type="text"
                value={draftProjectName}
                onChange={handleProjectNameChange}
                placeholder="Enter your project name…"
                className="pt-input"
                maxLength={50}
              />
            </div>

            <div className="pt-field">
              <label className="pt-field-label" htmlFor="pt-leader-name">
                Leader name 
              </label>
              <input
                id="pt-leader-name"
                type="text"
                value={leaderDraft}
                onChange={handleLeaderNameChange}
                placeholder="Enter your name"
                className="pt-input"
                maxLength={20}
              />
            </div>

            <div className="pt-field">
              <label className="pt-field-label" htmlFor="pt-leader-password">
                Leader password
              </label>
              <input
                id="pt-leader-password"
                type="password"
                value={passwordDraft}
                onChange={(e) => setPasswordDraft(e.target.value)}
                placeholder="Choose a password…"
                className="pt-input"
                autoComplete="new-password"
              />
              <p className="pt-help-text">
                The leader should remember the password because it will be used when assigning tasks.
              </p>
            </div>

            <div className="pt-field">
              <label className="pt-field-label" htmlFor="pt-member-input">
                Add team members
              </label>
              <div className="pt-members-input-row">
                <input
                  id="pt-member-input"
                  type="text"
                  value={newMemberName}
                  onChange={handleMemberNameChange}
                  placeholder="Enter member name"
                  className="pt-input pt-input-flex"
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={handleAddMemberClick}
                  className="pt-add-member-btn"
                  aria-label="Add member"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
              <div className="pt-member-tags">
                {pendingMembers.map((member, idx) => (
                  <div key={`${member}-${idx}`} className="pt-member-tag">
                    <span className="pt-member-tag-name">{member}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePendingMember(member)}
                      className="pt-member-tag-remove"
                    >
                      <span className="material-symbols-outlined pt-member-tag-remove-icon">
                        close
                      </span>
                    </button>
                  </div>
                ))}
                {pendingMembers.length === 0 && (
                  <span className="pt-member-empty">
                    No members added yet.
                  </span>
                )}
              </div>
            </div>

            <div className="pt-field pt-team-save-row">
              <button
                type="button"
                onClick={handleSaveTeamClick}
                className="pt-primary-btn"
              >
                Save team
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="pt-page">
      <div className="pt-header-row">
        <div>
          <h1 className="pt-title">Progress Tracking</h1>
          <p className="pt-subtitle">
            {isGroupProfileSaved
              ? "Your project and group are set. Track tasks below."
              : "Enter your project name, add your group members, view tasks and track progress as tasks are completed."}
          </p>
        </div>
      </div>

      <div className="pt-grid">
        <div className="pt-left">
          {renderGroupBlock()}

          <div className="pt-card">
            <div className="pt-card-header">
              <h2 className="pt-card-header-title">
                <span className="material-symbols-outlined pt-card-header-icon">
                  list_alt
                </span>
                All Tasks
              </h2>
              <div className="pt-count-badge">{tasks.length} Total</div>
            </div>

            {tasks.length === 0 ? (
              <div className="pt-empty-state">
                <span className="material-symbols-outlined pt-empty-icon">
                  assignment
                </span>
                <p>No tasks assigned yet.</p>
                <p className="pt-empty-sub">Go to "Assign Task" to start.</p>
              </div>
            ) : (
              <div className="pt-table-wrapper">
                <table className="pt-table">
                  <thead className="pt-table-head">
                    <tr>
                      <th className="pt-th pt-th-small">Done</th>
                      <th className="pt-th">Task Name</th>
                      <th className="pt-th">Assigned To</th>
                      <th className="pt-th">Deadline</th>
                      <th className="pt-th">Status</th>
                    </tr>
                  </thead>
                  <tbody className="pt-table-body">
                    {tasks.map((task) => (
                      <tr
                        key={task.id}
                        className={
                          "pt-tr " +
                          (task.status === "Completed"
                            ? "pt-tr-completed"
                            : "")
                        }
                      >
                        <td className="pt-td pt-td-small">
                          <button
                            type="button"
                            onClick={() => handleToggleTaskWithValidation(task.id, task.assignedTo)}
                            className={
                              "pt-done-btn " +
                              (task.status === "Completed"
                                ? "pt-done-btn-completed"
                                : "pt-done-btn-pending")
                            }
                          >
                            {task.status === "Completed" && (
                              <span className="material-symbols-outlined pt-done-check">
                                check
                              </span>
                            )}
                          </button>
                        </td>
                        <td
                          className={
                            "pt-td pt-task-name " +
                            (task.status === "Completed"
                              ? "pt-task-name-completed"
                              : "")
                          }
                        >
                          {task.name}
                        </td>
                        <td className="pt-td">
                          <div
                            className={
                              "pt-assignee " +
                              (task.status === "Completed"
                                ? "pt-assignee-muted"
                                : "")
                            }
                          >
                            <div className="pt-assignee-avatar">
                              {task.assignedTo.charAt(0).toUpperCase()}
                            </div>
                            <span>
                              {task.assignedTo === leaderName
                                ? `${task.assignedTo} (You)`
                                : task.assignedTo}
                            </span>
                          </div>
                        </td>
                        <td
                          className={
                            "pt-td " +
                            (task.status === "Completed"
                              ? "pt-deadline-completed"
                              : "pt-deadline-normal")
                          }
                        >
                          {task.deadline}
                        </td>
                        <td className="pt-td">
                          <span
                            className={
                              "pt-status-pill " +
                              (task.status === "Completed"
                                ? "pt-status-pill-completed"
                                : "pt-status-pill-pending")
                            }
                          >
                            {task.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="pt-right">
          <div className="pt-card">
            <h3 className="pt-card-header-title pt-card-title-with-icon">
              <span className="material-symbols-outlined pt-card-header-icon">
                analytics
              </span>
              Overall Progress
            </h3>
            <div className="pt-progress-circle-wrapper">
              <div className="pt-progress-circle">
                <svg className="pt-progress-svg" viewBox="0 0 36 36">
                  {/* Background circle */}
                  <circle
                    className="pt-progress-bg"
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />

                  {/* Progress circle */}
                  <circle
                    className="pt-progress-fg"
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="3"
                    strokeLinecap="round"
                    pathLength="100"
                    strokeDasharray={`${progressPercentage} 100`}
                    transform="rotate(-90 18 18)"
                  />
                </svg>
                <div className="pt-progress-center">
                  <span className="pt-progress-percent">
                    {progressPercentage}%
                  </span>
                  <span className="pt-progress-label">Complete</span>
                </div>
              </div>
            </div>
            <div className="pt-progress-summary">
              {completedTasks} of {totalTasks} tasks completed
            </div>
          </div>

          <div className="pt-card">
            <h3 className="pt-card-header-title">Member Contributions</h3>
            <div className="pt-member-stats">
              {memberStats.length === 0 ? (
                <p className="pt-member-stats-empty">
                  Complete team setup to see stats.
                </p>
              ) : (
                memberStats.map((stat, idx) => (
                  <div key={idx} className="pt-member-stat">
                    <div className="pt-member-stat-header">
                      <div className="pt-member-stat-left">
                        <div className="pt-member-stat-avatar">
                          {stat.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="pt-member-stat-name">
                          {stat.name === leaderName
                            ? `${stat.name} (You)`
                            : stat.name}
                        </span>
                      </div>
                      <span className="pt-member-stat-count">
                        {stat.completed}/{stat.total} Done
                      </span>
                    </div>
                    <div className="pt-member-stat-bar">
                      <div
                        className="pt-member-stat-bar-fill"
                        style={{
                          width:
                            stat.total === 0
                              ? "0%"
                              : `${(stat.completed / stat.total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracking;
