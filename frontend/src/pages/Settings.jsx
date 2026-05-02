import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Settings = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, setTheme } = useContext(ThemeContext);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await api.deleteAccount();
      if (response.status === 204 || response.status === 200) {
        logout();
        navigate('/login');
      } else {
        alert("Failed to delete account. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert(error.response?.data?.error || "An error occurred. Please try again later.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container py-5" style={{ color: 'var(--text-primary)', transition: 'all 0.3s ease' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <button 
          onClick={() => window.history.back()}
          className="btn btn-link text-decoration-none p-0 mb-4 d-flex align-items-center gap-2"
          style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '15px' }}
        >
          <span>&larr;</span> Go Back
        </button>
        <h1 className="mb-4" style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Account Settings</h1>
        
        <div className="p-4 mb-4" style={{ backgroundColor: 'var(--bg-surface)', border: `2px solid var(--border)`, borderRadius: '32px', boxShadow: 'var(--shadow-lg)' }}>
          <h2 className="h4 mb-4 fw-black" style={{ fontFamily: 'Outfit' }}>Personalization</h2>
          <div className="mb-4">
            <label className="form-label text-muted small fw-bold text-uppercase mb-3">Choose Your Interface Theme</label>
            <div className="d-flex flex-wrap gap-3">
              {[
                { id: 'light', name: 'Akademia', color: '#F5F3EF' },
                { id: 'forest', name: 'Forest', color: '#064E3B' },
                { id: 'ocean', name: 'Ocean', color: '#0C4A6E' }
              ].map(t => (
                <motion.button
                  key={t.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTheme(t.id)}
                  className="btn d-flex align-items-center gap-3 p-3 text-start"
                  style={{ 
                    flex: '1 1 150px',
                    backgroundColor: 'white',
                    border: `2px solid var(--border)`,
                    borderRadius: '16px',
                    boxShadow: theme === t.id ? '4px 4px 0px var(--border)' : 'none'
                  }}
                >
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: t.color, border: '1px solid rgba(0,0,0,0.1)' }} />
                  <span className="fw-bold small">{t.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 mb-4" style={{ backgroundColor: 'var(--bg-surface)', border: `2px solid var(--border)`, borderRadius: '32px', boxShadow: 'var(--shadow-lg)' }}>
          <h2 className="h4 mb-4 fw-black" style={{ fontFamily: 'Outfit' }}>Profile Information</h2>
          <div className="mb-4">
            <label className="form-label text-muted small fw-bold text-uppercase">Username</label>
            <p className="fw-black h5" style={{ color: 'var(--text-primary)' }}>{user?.username}</p>
          </div>
          <div className="mb-0">
            <label className="form-label text-muted small fw-bold text-uppercase">Email</label>
            <p className="fw-black h5" style={{ color: 'var(--text-primary)' }}>{user?.email || 'Not provided'}</p>
          </div>
        </div>

        <div className="p-4 border-danger" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--accent-danger)', borderRadius: '16px', boxShadow: 'var(--shadow-card)' }}>
          <h2 className="h5 mb-3 text-danger" style={{ fontWeight: 600 }}>Danger Zone</h2>
          <p className="small mb-4" style={{ color: 'var(--text-muted)' }}>
            Permanently delete your account and all associated data, including your goals, 
            learning progress, and session history. This action cannot be undone.
          </p>
          
          {!showConfirmDelete ? (
            <button 
              onClick={() => setShowConfirmDelete(true)}
              className="btn btn-outline-danger"
            >
              Delete My Account
            </button>
          ) : (
            <div className="p-3 rounded border border-danger border-opacity-25" style={{ backgroundColor: 'rgba(247, 92, 92, 0.05)' }}>
              <p className="fw-bold text-danger mb-3">Are you absolutely sure?</p>
              <div className="d-flex gap-2">
                <button 
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="btn btn-danger"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete Permanently'}
                </button>
                <button 
                  onClick={() => setShowConfirmDelete(false)}
                  className="btn btn-light"
                  style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
