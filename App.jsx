import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';

// Import panel components
import StudentPanel from './student-panel/App.jsx';
import AdminPanel from './admin-panel/App.jsx';
import TeacherPanel from './teacher-panel/App.jsx';
import Login from './login/Login.jsx';

function getLoginUserIdFromToken() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    const part = token.split('.')[1];
    const padded = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=');
    const payload = JSON.parse(atob(padded));
    return payload.id || payload._id || payload.userId || null;
  } catch (error) {
    return null;
  }
}

function AppContent() {
  const getStoredSession = () => {
    try {
      const savedSession = JSON.parse(localStorage.getItem('projectWaySession') || '{}');
      const hasToken = Boolean(localStorage.getItem('authToken'));

      if (!hasToken && !savedSession.isAuthenticated) {
        return { isAuthenticated: false, userRole: null, userName: null, userId: null };
      }

      const recoveredUserId = savedSession.userId || getLoginUserIdFromToken();
      if (recoveredUserId && !savedSession.userId && savedSession.isAuthenticated) {
        localStorage.setItem(
          'projectWaySession',
          JSON.stringify({ ...savedSession, userId: recoveredUserId })
        );
      }
      return {
        isAuthenticated: Boolean(savedSession.isAuthenticated || hasToken),
        userRole: savedSession.userRole || null,
        userName: savedSession.userName || null,
        userId: recoveredUserId,
      };
    } catch (error) {
      return { isAuthenticated: false, userRole: null, userName: null, userId: null };
    }
  };

  const storedSession = getStoredSession();
  const [isAuthenticated, setIsAuthenticated] = useState(storedSession.isAuthenticated);
  const [userRole, setUserRole] = useState(storedSession.userRole);
  const [userName, setUserName] = useState(storedSession.userName);
  const [userId, setUserId] = useState(storedSession.userId);
  const navigate = useNavigate();

  const handleLogin = async (loginData) => {
    try {
      console.log('Sending login request:', loginData);
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      console.log('Response status:', response.status, response.ok);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setIsAuthenticated(true);
        setUserRole(loginData.role);
        // Store the token in localStorage for API calls
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }
        // Get the name from the response data, fallback to form data, then to role name
        const name = data.user?.name || data.name || loginData.name || loginData.role.charAt(0).toUpperCase() + loginData.role.slice(1);
        const loginUserId = data.user?.id || data.user?._id || getLoginUserIdFromToken();
        console.log('Login response data:', data);
        console.log('Extracted user name:', name);
        setUserName(name);
        setUserId(loginUserId);
        localStorage.setItem(
          'projectWaySession',
          JSON.stringify({
            isAuthenticated: true,
            userRole: loginData.role,
            userName: name,
            userId: loginUserId,
          })
        );
        // #region agent log
        fetch('http://127.0.0.1:7411/ingest/c0938a3d-2dee-4849-8c64-0c4df412df16',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c16f08'},body:JSON.stringify({sessionId:'c16f08',runId:'post-fix',hypothesisId:'A',location:'App.jsx:login',message:'login session stored with userId',data:{hasLoginUserId:Boolean(loginUserId),storedSessionKeys:['isAuthenticated','userRole','userName','userId'],role:loginData.role},timestamp:Date.now()})}).catch(()=>{});
        // #endregion

        // Redirect directly to the appropriate panel based on role
        if (loginData.role === 'student') {
          navigate('/students/dashboard');
        } else if (loginData.role === 'teacher') {
          navigate('/teacher/dashboard');
        } else if (loginData.role === 'admin') {
          navigate('/admin');
        }

        return { success: true, message: 'Login successful' };
      } else {
        console.log('Login failed:', data);
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.log('Login error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserName(null);
    setUserId(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('projectWaySession');
    navigate('/');
  };

  return (
    <Routes>
      <Route path="/" element={<Login onLogin={handleLogin} />} />
      <Route path="/students/*" element={isAuthenticated ? <StudentPanel onLogout={handleLogout} userName={userName || 'Student'} userId={userId} /> : <Navigate to="/" replace />} />
      <Route path="/admin/*" element={isAuthenticated ? <AdminPanel onLogout={handleLogout} userName={userName || 'Admin'} /> : <Navigate to="/" replace />} />
      <Route path="/teacher/*" element={isAuthenticated ? <TeacherPanel onLogout={handleLogout} userName={userName || 'Teacher'} /> : <Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
