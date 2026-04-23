import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const [data, setData] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?.id) {
      api.getProgress(user.id)
        .then(res => {
          setData(res.data);
        })
        .catch(err => {
          console.error(err);
          // Fallback for UI if DB empty or error
          setData({
            total_points: 0,
            streak_days: 0,
            checkpoints: []
          });
        });
    } else {
      setData({
        total_points: 0,
        streak_days: 0,
        checkpoints: []
      });
    }
  }, [user]);

  if (!data) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" />
    </div>
  );

  return (
    <motion.div 
      className="container py-5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      style={{ minHeight: '80vh', color: 'var(--text-primary)', transition: 'all 0.3s ease', position: 'relative' }}
    >
      <button 
        onClick={() => window.history.back()}
        className="btn btn-link text-decoration-none p-0 mb-4 d-flex align-items-center gap-2"
        style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '15px' }}
      >
        <span>&larr;</span> Go Back
      </button>
      <div className="d-flex align-items-center mb-5">
        <div 
          style={{ 
            width: '80px', height: '80px', borderRadius: '50%', 
            backgroundColor: 'var(--accent-primary)', color: 'white', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: '32px', fontWeight: 'bold', marginRight: '24px',
            boxShadow: '0 8px 16px rgba(79, 110, 247, 0.2)'
          }}
        >
          {user?.username ? user.username.charAt(0).toUpperCase() : 'S'}
        </div>
        <div>
          <h2 style={{ fontFamily: 'Newsreader, serif', fontWeight: 400, margin: 0, color: 'var(--text-primary)' }}>{user?.username ? `${user.username}'s Profile` : 'My Scholarium Profile'}</h2>
          <div className="text-muted" style={{ color: 'var(--text-muted)' }}>Intellectual Explorer</div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12">
          <div className="card p-5 border-0 text-center" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border) !important', boxShadow: 'var(--shadow-card)', borderRadius: 'var(--radius-card)' }}>
            <h1 className="display-4 fw-bold mb-2" style={{ color: 'var(--accent-primary)' }}>{data.total_points || 0}</h1>
            <p className="text-muted text-uppercase letter-spacing-1 mb-0" style={{ fontSize: '12px', letterSpacing: '2px' }}>Total Mastery Points</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
