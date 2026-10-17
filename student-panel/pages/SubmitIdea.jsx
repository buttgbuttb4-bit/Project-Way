import React, { useState, useEffect } from 'react';
import { submitIdea, checkUser, getUserSession, getUserGroupId, getFirstIdeaByGroup } from '../api/studentPanelApi';
import '../styles/submit-idea.css';

const SubmitIdea = ({ userName = '' }) => {
  const [projectName, setProjectName] = useState('');
  const [session, setSession] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState([]);
  const [memberInput, setMemberInput] = useState('');
  const [errors, setErrors] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [registrationError, setRegistrationError] = useState('');

  // Load draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('submitIdeaDraft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setProjectName(draft.projectName || '');
        setSession(draft.session || '');
        setLeaderName(draft.leaderName || '');
        setDescription(draft.description || '');
        setMembers(draft.members || []);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  const handleSaveDraft = () => {
    const draftData = {
      projectName,
      session,
      leaderName,
      description,
      members,
      savedAt: new Date().toISOString()
    };

    localStorage.setItem('submitIdeaDraft', JSON.stringify(draftData));
    
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const handleAddMember = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (memberInput.trim() && members.length < 3) {
        setMembers([...members, memberInput.trim()]);
        setMemberInput('');
      }
    }
  };

  const removeMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    }
    
    if (!session) {
      newErrors.session = 'Session is required';
    }
    
    if (!leaderName.trim()) {
      newErrors.leaderName = 'Leader name is required';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (members.length === 0) {
      newErrors.members = 'At least one team member is required';
    }
    
    if (members.length > 3) {
      newErrors.members = 'Maximum 3 team members allowed';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Please fill all fields properly');
      return;
    }

    setRegistrationError('');

    // Check if leader is registered
    const leaderCheck = await checkUser(leaderName.trim());
    if (!leaderCheck.exists) {
      setRegistrationError(`The Leader ${leaderName.trim()} is not registered`);
      return;
    }

    // Check if all members are registered
    for (const member of members) {
      const memberCheck = await checkUser(member.trim());
      if (!memberCheck.exists) {
        setRegistrationError(`The Member ${member.trim()} is not registered`);
        return;
      }
    }

    // Validate session: two checks
    // 1. Leader and Members must belong to the same session
    // 2. Selected session must match the group's session
    const leaderSessionData = await getUserSession(leaderName.trim());
    const leaderSessionType = leaderSessionData.session?.includes('Morning') ? 'Morning' : 
                              leaderSessionData.session?.includes('Evening') ? 'Evening' : leaderSessionData.session;

    // Extract session type from selected value (Morning or Evening)
    const selectedSessionType = session.includes('Morning') ? 'Morning' : 'Evening';

    // Check 1: Leader and Members must belong to the same session
    for (const member of members) {
      const memberSessionData = await getUserSession(member.trim());
      const memberSessionType = memberSessionData.session?.includes('Morning') ? 'Morning' : 
                                memberSessionData.session?.includes('Evening') ? 'Evening' : memberSessionData.session;
      
      if (leaderSessionType !== memberSessionType) {
        setRegistrationError(`Leader is registered in ${leaderSessionType} session, but Member(s) are registered in ${memberSessionType} session. All group members must belong to the same session.`);
        return;
      }
    }

    // Check 2: Selected session must match the group's session
    const incorrectSessionNames = [];
    
    if (leaderSessionType !== selectedSessionType) {
      incorrectSessionNames.push(leaderName.trim());
    }

    for (const member of members) {
      const memberSessionData = await getUserSession(member.trim());
      const memberSessionType = memberSessionData.session?.includes('Morning') ? 'Morning' : 
                                memberSessionData.session?.includes('Evening') ? 'Evening' : memberSessionData.session;
      if (memberSessionType !== selectedSessionType) {
        incorrectSessionNames.push(member.trim());
      }
    }

    if (incorrectSessionNames.length > 0) {
      setRegistrationError(`Please select the correct session. The following names have incorrect session: ${incorrectSessionNames.join(', ')}.`);
      return;
    }

    // Validate groupId: current user can only submit ideas for their own group
    const currentUserGroupIdData = await getUserGroupId(userName);
    const currentUserGroupId = currentUserGroupIdData.groupId;

    // Only perform groupId validation if user already has a group (first-time submissions skip this)
    if (currentUserGroupId) {
      // Check leader's groupId
      const leaderGroupIdData = await getUserGroupId(leaderName.trim());
      const leaderGroupId = leaderGroupIdData.groupId;

      if (leaderGroupId && leaderGroupId !== currentUserGroupId) {
        setRegistrationError('You cannot submit ideas for another group.');
        return;
      }

      // Check all members' groupIds
      for (const member of members) {
        const memberGroupIdData = await getUserGroupId(member.trim());
        const memberGroupId = memberGroupIdData.groupId;

        if (memberGroupId && memberGroupId !== currentUserGroupId) {
          setRegistrationError('You cannot submit ideas for another group.');
          return;
        }
      }
    }

    // Validate that leader and members match original group registration (only if group exists)
    if (currentUserGroupId) {
      const firstIdeaData = await getFirstIdeaByGroup(currentUserGroupId);
      
      console.log('First idea data by groupId:', firstIdeaData);
      console.log('Submitted leader:', leaderName.trim());
      console.log('Submitted members:', members.map(m => m.trim()));
      
      if (firstIdeaData.success && firstIdeaData.idea) {
        const originalLeader = firstIdeaData.idea.leaderName?.trim();
        const originalMembers = firstIdeaData.idea.members?.map(m => m.trim()) || [];
        const submittedLeader = leaderName.trim();
        const submittedMembers = members.map(m => m.trim());
        
        console.log('Original leader:', originalLeader);
        console.log('Original members:', originalMembers);
        
        // Check if leader matches exactly
        if (submittedLeader !== originalLeader) {
          console.log('Leader mismatch detected');
          setRegistrationError('Invalid submission: You must use the same leader and member details as originally registered.');
          return;
        }
        
        // Check if members count matches
        if (submittedMembers.length !== originalMembers.length) {
          console.log('Member count mismatch');
          setRegistrationError('Invalid submission: You must use the same leader and member details as originally registered.');
          return;
        }
        
        // Check if all original members are present in submitted members
        const allOriginalMembersPresent = originalMembers.every(originalMember => 
          submittedMembers.includes(originalMember)
        );
        
        // Check if all submitted members are from original members
        const allSubmittedMembersValid = submittedMembers.every(submittedMember => 
          originalMembers.includes(submittedMember)
        );
        
        // Check that leader is not in members array
        const leaderNotInMembers = !submittedMembers.includes(submittedLeader);
        
        console.log('allOriginalMembersPresent:', allOriginalMembersPresent);
        console.log('allSubmittedMembersValid:', allSubmittedMembersValid);
        console.log('leaderNotInMembers:', leaderNotInMembers);
        
        if (!allOriginalMembersPresent || !allSubmittedMembersValid || !leaderNotInMembers) {
          console.log('Member validation failed');
          setRegistrationError('Invalid submission: You must use the same leader and member details as originally registered.');
          return;
        }
      } else {
        console.log('No previous ideas found for this group, skipping validation');
      }
    } else {
      console.log('First-time submission (no groupId), skipping leader/member validation');
    }

    // Submit idea to API
    const result = await submitIdea({
      title: projectName,
      projectName: projectName.trim(),
      session: session,
      leaderName: leaderName,
      description: description,
      members: members
    });

    if (!result.success) {
      alert(result.message || 'Error submitting idea');
      return;
    }

    // Show success message
    alert('Project idea submitted successfully!');
    
    // Clear saved draft after successful submission
    localStorage.removeItem('submitIdeaDraft');
    
    // Reset form
    setProjectName('');
    setSession('');
    setLeaderName('');
    setDescription('');
    setMembers([]);
    setMemberInput('');
    setErrors({});
  };

  return (
    <div className="si-page">
      <div className="si-header-row">
        <div>
          <h2 className="si-title">Submit Project Idea</h2>
          <p className="si-subtitle">
            Submit your ideas to the teachers for review. Make sure to provide a clear description and add your team members if you have any. 
          </p>
        </div>
      </div>

      {showSuccessMessage && (
        <div className="si-success-message">
          <span className="material-symbols-outlined si-success-icon">
            check_circle
          </span>
          <span>Draft Saved Successfully</span>
        </div>
      )}

      {registrationError && (
        <div className="error-message si-registration-error">
          {registrationError}
        </div>
      )}

      <div className="si-card">
        {/* Form */}
        <div className="si-card-inner">
          <div className="si-form-grid">
            <div className="si-field si-field-full">
              <label className="si-label">Project Idea Name</label>
              <input
                className={`si-input ${errors.projectName ? 'error' : ''}`}
                placeholder="Enter your project idea name like ecommerce website ..."
                type="text"
                value={projectName}
                maxLength={50}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^A-Za-z0-9\s]/g, '');
                  const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
                  setProjectName(capitalized);
                }}
              />
              {errors.projectName && <span className="error-message">{errors.projectName}</span>}
            </div>

            <div className="si-field">
              <label className="si-label">Session</label>
              <div className="si-select-wrapper">
               <select className={`si-select ${errors.session ? 'error' : ''}`} value={session} onChange={(e) => setSession(e.target.value)}>
                  <option value="">Select Session</option>
                  <option value="Morning Session (09:00 - 12:00)">Morning Session (09:00 - 12:00)</option>
                  <option value="Evening Session (01:00 - 04:00)">Evening Session (01:00 - 04:00)</option>
                </select>
                <span className="si-select-icon-wrapper">
                  <span className="material-symbols-outlined si-select-icon">
                    expand_more
                  </span>
                </span>
              </div>
              {errors.session && <span className="error-message">{errors.session}</span>}
            </div>

            <div className="si-field">
              <label className="si-label">Leader Name</label>
              <input
                className={`si-input ${errors.leaderName ? 'error' : ''}`}
                placeholder="Enter your name"
                type="text"
                value={leaderName}
                maxLength={20}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                  const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
                  setLeaderName(capitalized);
                }}
              />
              {errors.leaderName && <span className="error-message">{errors.leaderName}</span>}
            </div>

            <div className="si-field si-field-full">
              <label className="si-label">Description</label>
              <textarea
                className={`si-textarea ${errors.description ? 'error' : ''}`}
                placeholder="Describe your project idea including the problem it solves and any technologies you plan to use. "
                rows={5}
                value={description}
                onChange={(e) => {
                    if (e.target.value.length <= 1000) {
                     const value = e.target.value;
                     const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
                     setDescription(capitalized);
                   }
                 }  }
                maxLength={1000}
              ></textarea>
              {errors.description && <span className="error-message">{errors.description}</span>}
              <p className="si-counter">{description.length} / 1000 characters</p>
            </div>

            <div className="si-field si-field-full">
              <label className="si-label">Team Members</label>
              <div className="si-chip-input">
                {members.map((member, idx) => (
                  <div key={idx} className="si-chip">
                    {member}
                    <button
                      type="button"
                      onClick={() => removeMember(idx)}
                      className="si-chip-remove"
                    >
                      <span className="material-symbols-outlined si-chip-remove-icon">
                        close
                      </span>
                    </button>
                  </div>
                ))}
                {members.length < 3 && (
                  <input
                    placeholder="Type name & press Enter..."
                    type="text"
                    value={memberInput}
                    maxLength={20}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                      const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
                      setMemberInput(capitalized);
                    }}
                    onKeyDown={handleAddMember}
                  />
                )}
              </div>
              {errors.members && <span className="error-message">{errors.members}</span>}
              <p className="si-hint">
                <span className="material-symbols-outlined si-hint-icon">
                  info
                </span>
                Press Enter to add a member. Add up to 3 members.
              </p>
            </div>
          </div>

          <div className="si-footer-row">
            <div className="si-footer-actions">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="si-btn-secondary"
              >
                Save Draft
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="si-btn-primary"
              >
                <span className="material-symbols-outlined si-btn-primary-icon">
                  send
                </span>
                Submit Project Idea
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitIdea;