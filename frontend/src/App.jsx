import React, { useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Roadmaps from './pages/Roadmaps';
import GraphView from './pages/GraphView';
import Session from './pages/Session';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import SubtopicDetail from './pages/SubtopicDetail';
import ErrorPage from './pages/ErrorPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import GoalCompletionPage from './pages/GoalCompletionPage';

// A component to render the Navbar only when authenticated
const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('scholarium-theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('scholarium-theme', theme);
  }, [theme]);

  if (!user) return null;

  return (
    <nav className="navbar navbar-expand-lg scholarium-navbar">
      <div className="container-fluid px-0">
        <Link to="/" className="navbar-brand scholarium-brand m-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          scholarium
        </Link>
        
        <div className="d-flex align-items-center gap-2 ms-auto me-3 me-lg-0 order-lg-last">
          <button 
            className="navbar-toggler border-0 shadow-none p-0 ms-2" 
            type="button" 
            onClick={() => setIsOpen(!isOpen)}
            style={{ filter: 'var(--theme-invert, invert(1))' }}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>

        <div className={`collapse navbar-collapse justify-content-center ${isOpen ? 'show' : ''}`} style={{ zIndex: 1000 }}>
          <ul className="navbar-nav align-items-lg-center gap-1 gap-lg-4 mt-3 mt-lg-0">
            <li className="nav-item">
              <Link to="/" className="nav-link" style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: 600 }} onClick={() => setIsOpen(false)}>Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/roadmaps" className="nav-link" style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: 600 }} onClick={() => setIsOpen(false)}>Roadmaps</Link>
            </li>
            <li className="nav-item">
              <Link to="/profile" className="nav-link" style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: 600 }} onClick={() => setIsOpen(false)}>Profile</Link>
            </li>
            <li className="nav-item">
              <Link to="/settings" className="nav-link" style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: 600 }} onClick={() => setIsOpen(false)}>Settings</Link>
            </li>
            <li className="nav-item">
              <Link to="/about" className="nav-link" style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: 600 }} onClick={() => setIsOpen(false)}>About</Link>
            </li>
          </ul>
        </div>
        
        <div className={`collapse navbar-collapse flex-grow-0 ${isOpen ? 'show' : ''}`}>
          <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-3 mt-3 mt-lg-0">
            <Link 
              to="/contact" 
              className="btn btn-outline-dark px-4 py-2" 
              style={{ borderRadius: '100px', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}
              onClick={() => setIsOpen(false)}
            >
              Get in touch
            </Link>
            <button 
              onClick={() => { setIsOpen(false); logout(); }} 
              className="btn btn-dark px-4 py-2" 
              style={{ borderRadius: '100px', fontWeight: 600, fontSize: '14px' }}
            >
              Logout
            </button>
          </div>
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
            <Route path="/roadmaps" element={<ProtectedRoute><Roadmaps /></ProtectedRoute>} />
            <Route path="/graph/:goalId" element={<ProtectedRoute><GraphView /></ProtectedRoute>} />
            <Route path="/session/:skillId" element={<ProtectedRoute><Session /></ProtectedRoute>} />
            <Route path="/subtopic/:goalId/:skillName/:subtopicTitle" element={<ProtectedRoute><SubtopicDetail /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/goal-completed/:goalId" element={<ProtectedRoute><GoalCompletionPage /></ProtectedRoute>} />
            
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/error" element={<ErrorPage />} />
          </Routes>
        </AnimatePresence>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
