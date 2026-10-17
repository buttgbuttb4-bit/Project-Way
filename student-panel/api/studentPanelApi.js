const API_BASE_URL = 'http://localhost:4000';

// Student Issues API
export const submitIssue = async (issueData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/teacher/issues/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(issueData),
    });
    return await response.json();
  } catch (error) {
    console.error('Error submitting issue:', error);
    return { success: false, message: 'Error submitting issue', error: error.message };
  }
};

// Student Ideas API
export const submitIdea = async (ideaData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/student-ideas/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ideaData),
    });
    return await response.json();
  } catch (error) {
    console.error('Error submitting idea:', error);
    return { success: false, message: 'Error submitting idea', error: error.message };
  }
};

export const getAllIdeas = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/student-ideas/all`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching ideas:', error);
    return { success: false, message: 'Error fetching ideas', error: error.message };
  }
};


export const getIdeaStats = async (projectName = '', leaderName = '', groupId = '') => {
  try {
    const params = new URLSearchParams();
    if (projectName) params.append('projectName', projectName);
    if (leaderName) params.append('leaderName', leaderName);
    if (groupId) params.append('groupId', groupId);
    const query = params.toString();
    const response = await fetch(`${API_BASE_URL}/api/student-ideas/stats${query ? '?' + query : ''}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching idea stats:', error);
    return { success: false, message: 'Error fetching idea stats', error: error.message };
  }
};

export const getIdeaStatsByGroup = async (groupId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/student-ideas/stats/group/${encodeURIComponent(groupId)}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching idea stats by group:', error);
    return { success: false, message: 'Error fetching idea stats by group', error: error.message };
  }
};

export const getFirstIdeaByGroup = async (groupId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/student-ideas/first/${encodeURIComponent(groupId)}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching first idea by group:', error);
    return { success: false, message: 'Error fetching first idea by group', error: error.message };
  }
};

export const getIdeasByGroupId = async (groupId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/student-ideas/group/${encodeURIComponent(groupId)}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching ideas by groupId:', error);
    return { success: false, message: 'Error fetching ideas by groupId', error: error.message };
  }
};

// Teacher Uploads API
export const getAllUploads = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/teacher-uploads/all`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching uploads:', error);
    return { success: false, message: 'Error fetching uploads', error: error.message };
  }
};


// Tasks API
export const createTask = async (taskData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tasks/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });
    return await response.json();
  } catch (error) {
    console.error('Error creating task:', error);
    return { success: false, message: 'Error creating task', error: error.message };
  }
};


export const toggleTaskStatus = async (taskId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tasks/toggle/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Error toggling task status:', error);
    return { success: false, message: 'Error toggling task status', error: error.message };
  }
};



// Teams API
export const saveTeam = async (teamData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/teams/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamData),
    });
    return await response.json();
  } catch (error) {
    console.error('Error saving team:', error);
    return { success: false, message: 'Error saving team', error: error.message };
  }
};


export const getTeamByGroupId = async (groupId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/teams/group/${encodeURIComponent(groupId)}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching team by groupId:', error);
    return { success: false, message: 'Error fetching team by groupId', error: error.message };
  }
};

export const getTasksByGroupId = async (groupId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tasks/group/${encodeURIComponent(groupId)}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching tasks by groupId:', error);
    return { success: false, message: 'Error fetching tasks by groupId', error: error.message };
  }
};

export const getGroupByGroupId = async (groupId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/teams/group-data/${encodeURIComponent(groupId)}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching group by groupId:', error);
    return { success: false, message: 'Error fetching group by groupId', error: error.message };
  }
};



// Feedback API

export const getAllFeedback = async (groupId = '', userName) => {
  try {
    const params = new URLSearchParams();
    if (groupId) params.append('groupId', groupId);
    if (userName) params.append('userName', userName);
    const query = params.toString();
    const response = await fetch(`${API_BASE_URL}/api/feedback/all${query ? '?' + query : ''}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching all feedback:', error);
    return { success: false, message: 'Error fetching all feedback', error: error.message };
  }
};

export const markFeedbackAsRead = async (feedbackId, userName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/feedback/${feedbackId}/read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userName }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error marking feedback as read:', error);
    return { success: false, message: 'Error marking feedback as read', error: error.message };
  }
};



// Student Issues API
export const getStudentIssues = async (groupId = '', userName) => {
  try {
    const params = new URLSearchParams();
    if (groupId) params.append('groupId', groupId);
    if (userName) params.append('userName', userName);
    const query = params.toString();
    const response = await fetch(`${API_BASE_URL}/api/teacher/issues/all${query ? '?' + query : ''}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching student issues:', error);
    return { success: false, message: 'Error fetching student issues', error: error.message };
  }
};

export const markIssueAsRead = async (issueId, userName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/teacher/issues/${issueId}/read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userName }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error marking issue as read:', error);
    return { success: false, message: 'Error marking issue as read', error: error.message };
  }
};

// Student Progress API
export const updateStudentProgress = async (progressData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/teacher/progress/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(progressData),
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating student progress:', error);
    return { success: false, message: 'Error updating student progress', error: error.message };
  }
};

// User Verification API
export const checkUser = async (name) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/check-user/${encodeURIComponent(name)}`);
    return await response.json();
  } catch (error) {
    console.error('Error checking user:', error);
    return { exists: false, name };
  }
};

export const getUserGroupId = async (name) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/user-group/${encodeURIComponent(name)}`);
    return await response.json();
  } catch (error) {
    console.error('Error getting user group:', error);
    return { groupId: null };
  }
};

export const getUserSession = async (name) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/user-session/${encodeURIComponent(name)}`);
    return await response.json();
  } catch (error) {
    console.error('Error getting user session:', error);
    return { session: null };
  }
};

export const getRoles = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/roles/public`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching roles:', error);
    return { success: false, message: 'Error fetching roles', error: error.message };
  }
};
