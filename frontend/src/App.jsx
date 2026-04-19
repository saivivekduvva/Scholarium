import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Dashboard from './pages/Dashboard';
import GraphView from './pages/GraphView';
import Session from './pages/Session';
import Profile from './pages/Profile';
import ErrorPage from './pages/ErrorPage';

function App() {
  return (
    <BrowserRouter>
      <nav className="scholarium-navbar">
        <Link to="/" className="scholarium-brand">Scholarium</Link>
        <div>
          <Link to="/" className="btn btn-primary" style={{ backgroundColor: 'var(--accent-primary)', border: 'none', borderRadius: '8px' }}>New Goal</Link>
          <Link to="/profile" className="ms-3 text-decoration-none" style={{ color: 'var(--text-secondary)' }}>Profile</Link>
        </div>
      </nav>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/graph/:goalId" element={<GraphView />} />
          <Route path="/session/:skillId" element={<Session />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/error" element={<ErrorPage />} />
        </Routes>
      </AnimatePresence>
      <footer className="text-center py-4" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
        © 2025 Scholarium
      </footer>
    </BrowserRouter>
  );
}

export default App;
