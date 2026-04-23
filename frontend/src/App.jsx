import React, { useContext, useState, useEffect } from 'react';
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
import { IoSunnyOutline, IoMoonOutline } from 'react-icons/io5';

// A component to render the Navbar only when authenticated
const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('scholarium-theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('scholarium-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  if (!user) return null;

  return (
    <nav className="navbar navbar-expand-lg scholarium-navbar" style={{ backgroundColor: 'var(--bg-surface)', padding: '12px 24px', borderBottom: '1px solid var(--border)', transition: 'all 0.3s ease' }}>
      <div className="container-fluid px-0">
        <Link to="/" className="navbar-brand scholarium-brand m-0" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-primary)', textDecoration: 'none' }}>Scholarium</Link>
        
        <div className="d-flex align-items-center gap-2 ms-auto me-3 me-lg-0 order-lg-last">
          <button 
            onClick={toggleTheme}
            className="btn d-flex align-items-center justify-content-center"
            style={{ 
              width: '40px', height: '40px', borderRadius: '12px', 
              backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)', 
              border: '1px solid var(--border)', padding: 0
            }}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <IoMoonOutline size={20} /> : <IoSunnyOutline size={20} />}
          </button>
          
          <button 
            className="navbar-toggler border-0 shadow-none p-0 ms-2" 
            type="button" 
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>

        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} style={{ zIndex: 1000 }}>
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center gap-1 gap-lg-3 mt-3 mt-lg-0 me-lg-3">
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
                style={{ border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text-secondary)', borderRadius: '8px', fontWeight: 600 }}
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
