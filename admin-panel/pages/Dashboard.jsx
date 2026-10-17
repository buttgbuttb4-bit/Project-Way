import React, { useEffect, useState } from 'react';
import adminApi from '../api/adminApi';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({ studentCount: 0, teacherCount: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await adminApi.getDashboard();
        setStats(data);
      } catch (err) {
        setError('Unable to load dashboard stats.');
      }
    };
    loadStats();
  }, []);

  return (
    <div className="dash-root">
      <div className="dash-header">
        <div>
          <h2 className="dash-title">Dashboard Overview</h2>
          <p className="dash-sub">
            Easily view and manage all student and teacher information from this dashboard.
          </p>
          {error && <p className="dash-err">{error}</p>}
        </div>
      </div>

      <div className="dash-grid">
        <div className="dash-card">
          <div>
            <p className="dash-card-lbl">Total Students</p>
            <h3 className="dash-card-val">{stats.studentCount}</h3>
          </div>
          <div className="dash-card-icon dash-icon-blue">
            <span className="material-symbols-outlined">school</span>
          </div>
        </div>

        <div className="dash-card">
          <div>
            <p className="dash-card-lbl">Total Teachers</p>
            <h3 className="dash-card-val">{stats.teacherCount}</h3>
          </div>
          <div className="dash-card-icon dash-icon-purple">
            <span className="material-symbols-outlined">people</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;