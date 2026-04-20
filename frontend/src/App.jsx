import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import GraphView from './pages/GraphView';
import Session from './pages/Session';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import SubtopicDetail from './pages/SubtopicDetail';
import ErrorPage from './pages/ErrorPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// A component to render the Navbar only when authenticated
const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  return (
    <nav className="scholarium-navbar">
      <Link to="/" className="scholarium-brand">Scholarium</Link>
      <div>
        <Link to="/leaderboard" className="me-3 text-decoration-none" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Leaderboard</Link>
        <Link to="/" className="btn btn-primary" style={{ backgroundColor: 'var(--accent-primary)', border: 'none', borderRadius: '8px' }}>New Goal</Link>
        <Link to="/profile" className="ms-3 text-decoration-none" style={{ color: 'var(--text-secondary)' }}>Profile</Link>
        <button onClick={logout} className="btn ms-3" style={{ border: '1px solid rgba(0,0,0,0.1)', backgroundColor: 'transparent', color: 'var(--text-secondary)', borderRadius: '8px' }}>Logout</button>
      </div>
    </nav>
  );
};

// A component to render the footer only when authenticated
const Footer = () => {
  const { user } = useContext(AuthContext);
  if (!user) return null;
  return (
    <footer className="text-center py-4" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
      © 2025 Scholarium
    </footer>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/graph/:goalId" element={<ProtectedRoute><GraphView /></ProtectedRoute>} />
            <Route path="/session/:skillId" element={<ProtectedRoute><Session /></ProtectedRoute>} />
            <Route path="/subtopic/:skillName/:subtopicTitle" element={<ProtectedRoute><SubtopicDetail /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            
            <Route path="/error" element={<ErrorPage />} />
          </Routes>
        </AnimatePresence>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
