import React, { useContext, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import GraphView from './pages/GraphView';
import Session from './pages/Session';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import SubtopicDetail from './pages/SubtopicDetail';
import ErrorPage from './pages/ErrorPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// A component to render the Navbar only when authenticated
const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  return (
    <nav className="navbar navbar-expand-lg scholarium-navbar" style={{ backgroundColor: 'white', padding: '12px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
      <div className="container-fluid px-0">
        <Link to="/" className="navbar-brand scholarium-brand m-0" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-primary)', textDecoration: 'none' }}>Scholarium</Link>
        <button 
          className="navbar-toggler border-0 shadow-none" 
          type="button" 
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''} bg-white`} style={{ zIndex: 1000 }}>
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center gap-1 gap-lg-3 mt-3 mt-lg-0">
            <li className="nav-item">
              <Link to="/" className="nav-link" style={{ color: 'var(--text-secondary)', fontWeight: 600 }} onClick={() => setIsOpen(false)}>Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/settings" className="nav-link" style={{ color: 'var(--text-secondary)', fontWeight: 600 }} onClick={() => setIsOpen(false)}>Settings</Link>
            </li>
            <li className="nav-item">
              <Link to="/profile" className="nav-link" style={{ color: 'var(--text-secondary)', fontWeight: 600 }} onClick={() => setIsOpen(false)}>Profile</Link>
            </li>
            <li className="nav-item mt-2 mt-lg-0">
              <button 
                onClick={() => { setIsOpen(false); logout(); }} 
                className="btn w-100" 
                style={{ border: '1px solid rgba(0,0,0,0.1)', backgroundColor: 'transparent', color: 'var(--text-secondary)', borderRadius: '8px', fontWeight: 600 }}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
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
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            
            <Route path="/error" element={<ErrorPage />} />
          </Routes>
        </AnimatePresence>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
