import React from 'react';

const TeacherProfile = ({ userName }) => {
  return (
    <div className="user-profile">
      <div className="user-avatar">
        <span className="user-initial">{userName ? userName.charAt(0).toUpperCase() : 'T'}</span>
      </div>
      <div className="user-info">
        <h1>Teacher Panel</h1>
        <p className="user-name">{userName || 'Teacher'}</p>
      </div>
    </div>
  );
};

export default TeacherProfile;
