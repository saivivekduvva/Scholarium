import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Settings = () => {
  const { user, logout } = useContext(AuthContext);
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
  return (
    <div className="container py-5" style={{ color: 'var(--text-primary)', transition: 'all 0.3s ease' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <h1 className="mb-4" style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Account Settings</h1>
        
        <div className="p-4 mb-4" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', boxShadow: 'var(--shadow-card)' }}>
          <h2 className="h5 mb-3" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Profile Information</h2>
          <div className="mb-3">
            <label className="form-label" style={{ color: 'var(--text-muted)' }}>Username</label>
            <p className="fw-bold" style={{ color: 'var(--text-primary)' }}>{user?.username}</p>
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ color: 'var(--text-muted)' }}>Email</label>
            <p className="fw-bold" style={{ color: 'var(--text-primary)' }}>{user?.email || 'Not provided'}</p>
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
