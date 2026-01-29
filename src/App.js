import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import NoticesPage from './pages/NoticesPage';
import SchedulesPage from './pages/SchedulesPage';
import ComplaintsPage from './pages/ComplaintsPage';
import authService from './services/authService';
import './App.css';

function PrivateRoute({ children }) {
  return authService.isAuthenticated() ? children : <Navigate to="/login" />;
}

function Navigation() {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [user, setUser] = useState(authService.getCurrentUser());
  const location = useLocation();

  // 라우트가 변경될 때마다 인증 상태 확인
  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
    setUser(authService.getCurrentUser());
  }, [location]);

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <h2>아파트 관리 시스템</h2>
      </div>
      <div className="nav-links">
        <Link to="/notices">공지사항</Link>
        <Link to="/schedules">일정 관리</Link>
        <Link to="/complaints">민원 게시판</Link>
      </div>
      <div className="nav-user">
        <span>{user?.name}님</span>
        <button onClick={handleLogout}>로그아웃</button>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Navigate to="/notices" />
              </PrivateRoute>
            }
          />
          <Route
            path="/notices"
            element={
              <PrivateRoute>
                <NoticesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/schedules"
            element={
              <PrivateRoute>
                <SchedulesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/complaints"
            element={
              <PrivateRoute>
                <ComplaintsPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
