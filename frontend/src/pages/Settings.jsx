import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, logout } = useContext(AuthContext);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/delete-account/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (response.ok) {
        logout();
        navigate('/login');
      } else {
        alert("Failed to delete account. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("An error occurred. Please try again later.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container py-5">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <h1 className="mb-4" style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Account Settings</h1>
        
        <div className="scholarium-card p-4 mb-4">
          <h2 className="h5 mb-3" style={{ fontWeight: 600 }}>Profile Information</h2>
          <div className="mb-3">
            <label className="form-label text-muted">Username</label>
            <p className="fw-bold">{user?.username}</p>
          </div>
          <div className="mb-3">
            <label className="form-label text-muted">Email</label>
            <p className="fw-bold">{user?.email || 'Not provided'}</p>
          </div>
        </div>

        <div className="scholarium-card p-4 border-danger">
          <h2 className="h5 mb-3 text-danger" style={{ fontWeight: 600 }}>Danger Zone</h2>
          <p className="text-muted small mb-4">
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
            <div className="bg-danger bg-opacity-10 p-3 rounded border border-danger border-opacity-25">
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
