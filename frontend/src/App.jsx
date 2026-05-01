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
import HowToUse from './pages/HowToUse';

// A component to render the Sidebar only when authenticated
const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('scholarium-theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('scholarium-theme', theme);
  }, [theme]);

  if (!user) return null;

  const NavItem = ({ to, label, icon }) => (
    <li className="nav-item mb-2" style={{ listStyle: 'none' }}>
      <Link 
        to={to} 
        className="nav-link d-flex align-items-center gap-3 px-3 py-2" 
        style={{ 
          color: 'var(--text-primary)', 
          fontSize: '16px', 
          fontWeight: 700,
          borderRadius: '12px',
          transition: 'all 0.2s ease',
          border: '2px solid transparent'
        }} 
        onClick={() => setIsOpen(false)}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--bg-page)';
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.transform = 'translate(-2px, -2px)';
          e.currentTarget.style.boxShadow = '4px 4px 0px var(--border)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.borderColor = 'transparent';
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {label}
      </Link>
    </li>
  );

  return (
    <>
      {/* Mobile Toggle Header */}
      <div className="d-lg-none position-fixed top-0 start-0 end-0 px-4 py-3 d-flex justify-content-between align-items-center" style={{ zIndex: 1001, background: 'var(--bg-surface)', borderBottom: '3px solid var(--border)' }}>
        <Link to="/" className="scholarium-brand" style={{ fontSize: '20px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          scholarium
        </Link>
        <button 
          className="btn p-2" 
          onClick={() => setIsOpen(!isOpen)}
          style={{ border: '2px solid var(--border)', borderRadius: '8px' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        </button>
      </div>

      {/* Backdrop for mobile drawer */}
      {isOpen && (
        <div 
          className="d-lg-none position-fixed top-0 start-0 end-0 bottom-0" 
          style={{ zIndex: 1002, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)' }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* The Sidebar */}
      <aside 
        className={`scholarium-sidebar ${isOpen ? 'open' : ''}`}
        style={{
          width: '280px',
          height: '100vh',
          position: 'fixed',
          left: '0',
          top: '0',
          background: 'var(--bg-surface)',
          borderRight: '3px solid var(--border)',
          zIndex: 1003,
          padding: '40px 24px',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isOpen ? 'translateX(0)' : 'translateX(0)' // Desktop default
        }}
      >
        <Link to="/" className="scholarium-brand mb-5 px-3">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          scholarium
        </Link>

        <nav className="flex-grow-1">
          <ul className="p-0 m-0">
            <NavItem to="/" label="Home" />
            <NavItem to="/roadmaps" label="Roadmaps" />
            <NavItem to="/profile" label="Profile" />
            <NavItem to="/settings" label="Settings" />
            <NavItem to="/about" label="About" />
            <NavItem to="/how-to-use" label="How To Use" />
          </ul>
        </nav>

        <div className="d-flex flex-column gap-3 mt-auto">
          <Link 
            to="/contact" 
            className="btn btn-outline-dark px-4 py-3" 
            style={{ borderRadius: '16px', fontWeight: 800, border: '3px solid var(--border)', boxShadow: '4px 4px 0px var(--border)' }}
            onClick={() => setIsOpen(false)}
          >
            Get in touch
          </Link>
          <button 
            onClick={() => { setIsOpen(false); logout(); }} 
            className="btn btn-dark px-4 py-3" 
            style={{ borderRadius: '16px', fontWeight: 800, background: 'var(--accent-primary)', border: '3px solid var(--border)', boxShadow: '4px 4px 0px var(--border)' }}
          >
            Logout
          </button>
        </div>
      </aside>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 991px) {
          .scholarium-sidebar {
            transform: translateX(-100%) !important;
          }
          .scholarium-sidebar.open {
            transform: translateX(0) !important;
          }
          .main-content-wrapper {
            margin-left: 0 !important;
            padding-top: 80px !important;
            --header-height: 80px;
          }
        }
        @media (min-width: 992px) {
          .main-content-wrapper {
            margin-left: 280px !important;
            --header-height: 0px;
          }
        }
      `}} />
    </>
  );
};

// A component to render the footer only when authenticated
const Footer = () => {
  const { user } = useContext(AuthContext);
  if (!user) return null;
  return (
    <footer className="text-center py-4" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
      © 2026 Scholarium
    </footer>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Sidebar />
        <div className="main-content-wrapper" style={{ transition: 'margin-left 0.3s ease' }}>
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
              <Route path="/how-to-use" element={<HowToUse />} />
              <Route path="/error" element={<ErrorPage />} />
            </Routes>
          </AnimatePresence>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
