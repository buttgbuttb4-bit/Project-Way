import React from 'react';

const NavButton = ({ label, icon, isActive, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`nav-button ${isActive ? 'active' : ''}`}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className="material-symbols-outlined nav-icon">{icon}</span>
      <p className={`nav-text ${isActive ? 'active' : ''}`}>{label}</p>
    </button>
  );
};

export default NavButton;
