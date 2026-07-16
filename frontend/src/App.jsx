import React, { useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Roadmaps from './pages/Roadmaps';
import GraphView from './pages/GraphView';

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
import RoadmapQuiz from './pages/RoadmapQuiz';
import QuizAnalytics from './pages/QuizAnalytics';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import DatabaseExpired from './pages/DatabaseExpired';

// A component to render the Navigation (Sidebar for mobile, Topbar for desktop)
// A component to render the Navigation (Sidebar for mobile, Topbar for desktop)
const Navigation = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const [isOpen, setIsOpen] = useState(false);

  const authLinks = [
    { to: "/", label: "Home" },
    { to: "/roadmaps", label: "Roadmaps" },
    { to: "/profile", label: "Profile" },
    { to: "/settings", label: "Settings" },
  ];

  const publicLinks = [
    { to: "/about", label: "About" },
    { to: "/how-to-use", label: "How To Use" },
  ];

  const links = user ? [...authLinks, ...publicLinks] : publicLinks;

  return (
    <>
      {/* --- DESKTOP TOPBAR --- */}
      <nav className="desktop-nav d-none d-lg-flex position-fixed top-0 start-0 end-0 py-3 justify-content-center" 
           style={{ zIndex: 1000, background: 'var(--glass-surface)', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container-fluid px-5 d-flex justify-content-between align-items-center">
          <Link to="/" className="scholarium-brand" style={{ fontWeight: 900, fontSize: '26px', letterSpacing: '-1.5px', color: 'var(--text-primary)', textDecoration: 'none' }}>
            Scholarium
          </Link>
          
          <ul className="d-flex align-items-center gap-4 m-0 p-0" style={{ listStyle: 'none' }}>
            {links.map(link => (
              <li key={link.to}>
                <Link to={link.to} className="nav-link" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '15px', transition: 'opacity 0.2s' }}>{link.label}</Link>
              </li>
            ))}
          </ul>

          <div className="d-flex align-items-center gap-3">
            <Link to="/contact" className="btn btn-sm px-4 py-2" style={{ border: '2px solid var(--border)', borderRadius: '100px', fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>Get in touch</Link>
            {user ? (
              <button onClick={logout} className="btn btn-sm btn-dark px-4 py-2 rounded-pill fw-bold" style={{ fontSize: '13px' }}>Logout</button>
            ) : (
              <Link to="/login" className="btn btn-sm btn-dark px-4 py-2 rounded-pill fw-bold" style={{ fontSize: '13px', textDecoration: 'none' }}>Sign In</Link>
            )}
          </div>
        </div>
      </nav>

      {/* --- MOBILE HEADER --- */}
      <div className="mobile-header d-lg-none position-fixed top-0 start-0 end-0 px-4 py-3 d-flex justify-content-between align-items-center" 
           style={{ zIndex: 1001, background: 'var(--glass-surface)', backdropFilter: 'var(--glass-blur)', borderBottom: '1px solid var(--border)' }}>
        <Link to="/" className="scholarium-brand" style={{ fontWeight: 900, fontSize: '22px', letterSpacing: '-1px', color: 'var(--text-primary)', textDecoration: 'none' }}>
          Scholarium
        </Link>
        <button 
          className="btn p-2" 
          onClick={() => setIsOpen(!isOpen)}
          style={{ border: '2px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        </button>
      </div>

      {/* Mobile Sidebar Backdrop */}
      {isOpen && (
        <div 
          className="d-lg-none position-fixed top-0 start-0 end-0 bottom-0" 
          style={{ zIndex: 1002, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)' }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* MOBILE SIDEBAR (Drawer) */}
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
          transform: 'translateX(-100%)' // Default hidden for mobile
        }}
      >
        <Link to="/" className="scholarium-brand mb-5 px-3" style={{ fontWeight: 900, fontSize: '24px', letterSpacing: '-1px', color: 'var(--text-primary)', textDecoration: 'none' }}>
          Scholarium
        </Link>

        <nav className="flex-grow-1">
          <ul className="p-0 m-0">
            {links.map(link => (
              <li key={link.to} className="nav-item mb-2" style={{ listStyle: 'none' }}>
                <Link to={link.to} className="nav-link px-3 py-2" style={{ color: 'var(--text-primary)', fontWeight: 700, borderRadius: '12px', textDecoration: 'none' }} onClick={() => setIsOpen(false)}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="d-flex flex-column gap-3 mt-auto">
          <Link to="/contact" className="btn btn-outline-dark py-3 rounded-4 fw-bold" style={{ border: '3px solid var(--border)', color: 'var(--text-primary)' }} onClick={() => setIsOpen(false)}>Get in touch</Link>
          {user ? (
            <button onClick={() => { setIsOpen(false); logout(); }} className="btn btn-dark py-3 rounded-4 fw-bold">Logout</button>
          ) : (
            <Link to="/login" className="btn btn-dark py-3 rounded-4 fw-bold" style={{ textDecoration: 'none' }} onClick={() => setIsOpen(false)}>Sign In</Link>
          )}
        </div>
      </aside>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 991px) {
          .scholarium-sidebar.open {
            transform: translateX(0) !important;
          }
          .main-content-wrapper {
            padding-top: 80px !important;
            --header-height: 80px;
          }
        }
        @media (min-width: 992px) {
          .main-content-wrapper {
            padding-top: 100px !important;
            --header-height: 100px;
          }
        }
        .nav-link:hover {
          opacity: 0.7;
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
  const DATABASE_EXPIRED = true; // Hardcoded flag to show the database expired popup

  return (
    <ThemeProvider>
      <BrowserRouter>
        {DATABASE_EXPIRED && <DatabaseExpired />}
        <AuthProvider>
          <Navigation />
          <div className="main-content-wrapper" style={{ transition: 'padding-top 0.3s ease' }}>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected Routes */}
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/roadmaps" element={<ProtectedRoute><Roadmaps /></ProtectedRoute>} />
              <Route path="/graph/:goalId" element={<ProtectedRoute><GraphView /></ProtectedRoute>} />

              <Route path="/subtopic/:goalId/:skillName/:subtopicTitle" element={<ProtectedRoute><SubtopicDetail /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/goal-completed/:goalId" element={<ProtectedRoute><GoalCompletionPage /></ProtectedRoute>} />
              <Route path="/quiz/:goalId" element={<ProtectedRoute><RoadmapQuiz /></ProtectedRoute>} />
              <Route path="/analytics/:goalId" element={<ProtectedRoute><QuizAnalytics /></ProtectedRoute>} />
              
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
  </ThemeProvider>
  );
}

export default App;
