import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import ManageTeachers from './pages/ManageTeachers.jsx';
import ManageStudents from './pages/ManageStudents.jsx';
import RolesPermissions from './pages/RolesPermissions.jsx';
import Layout from './components/Layout.jsx';
import './styles/Global.css';

const AppContent = ({ userName, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === '/admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const renderContent = () => {
    const currentPath = location.pathname;

    if (currentPath === '/admin/dashboard') {
      return <Dashboard />;
    }
    if (currentPath === '/admin/teachers') {
      return <ManageTeachers />;
    }
    if (currentPath === '/admin/students') {
      return <ManageStudents />;
    }
    if (currentPath === '/admin/roles') {
      return <RolesPermissions />;
    }

    return <Dashboard />;
  };

  return (
    <Layout userName={userName} onLogout={onLogout}>
      {renderContent()}
    </Layout>
  );
};

const App = ({ userName, onLogout }) => {
  return <AppContent userName={userName} onLogout={onLogout} />;
};

export default App;
