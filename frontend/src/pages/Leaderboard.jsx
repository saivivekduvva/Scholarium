import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLeaderboard()
      .then(res => setLeaders(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getRankStyle = (index) => {
    switch(index) {
      case 0: return { color: '#FFD700', icon: '👑', border: '2px solid #FFD700', bg: 'rgba(255, 215, 0, 0.05)' };
      case 1: return { color: '#C0C0C0', icon: '🥈', border: '2px solid #C0C0C0', bg: 'rgba(192, 192, 192, 0.05)' };
      case 2: return { color: '#CD7F32', icon: '🥉', border: '2px solid #CD7F32', bg: 'rgba(205, 127, 50, 0.05)' };
      default: return { color: 'var(--text-secondary)', icon: index + 1, border: '1px solid var(--border)', bg: 'var(--bg-surface)' };
    }
  };

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 style={{ fontFamily: 'Outfit', fontWeight: 700 }}>Weekly Leaderboard</h1>
        <p className="text-muted">Top learners based on XP earned this week</p>
      </div>

      <div className="mx-auto" style={{ maxWidth: '600px' }}>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {leaders.map((user, index) => {
              const style = getRankStyle(index);
              return (
                <motion.div
                  key={user.username}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card p-3 d-flex flex-row align-items-center"
                  style={{ 
                    border: style.border, 
                    backgroundColor: style.bg,
                    borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                  }}
                >
                  <div className="rank-circle d-flex align-items-center justify-content-center me-4" 
                       style={{ 
                         width: '40px', height: '40px', 
                         borderRadius: '50%', 
                         backgroundColor: style.bg,
                         fontWeight: 700,
                         fontSize: '18px'
                       }}>
                    {style.icon}
                  </div>
                  
                  <div className="avatar me-3" style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', overflow: 'hidden' }}>
                    {user.avatar_url ? <img src={user.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.username[0].toUpperCase()}
                  </div>

                  <div className="flex-grow-1">
                    <h5 className="mb-0" style={{ fontSize: '17px', fontWeight: 600 }}>{user.username}</h5>
                    <small className="text-muted">Total: {user.total_xp} XP</small>
                  </div>

                  <div className="text-end">
                    <div style={{ color: 'var(--accent-primary)', fontWeight: 700, fontSize: '18px' }}>+{user.weekly_xp}</div>
                    <small className="text-muted" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>XP This Week</small>
                  </div>
                </motion.div>
              );
            })}
            
            {leaders.length === 0 && (
              <div className="text-center py-5">
                <p className="text-muted">No activity yet this week. Be the first to earn XP!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
