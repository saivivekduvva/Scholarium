import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { IoArrowForward, IoTrashOutline, IoBookOutline } from 'react-icons/io5';

const Roadmaps = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getGoals()
      .then(res => {
        setGoals(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch goals:', err);
        setError("Failed to load your roadmaps. Please check your connection.");
        setLoading(false);
      });
  }, []);

  const handleDeleteGoal = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this roadmap?")) return;
    try {
      await api.deleteGoal(id);
      setGoals(goals.filter(g => g.id !== id));
    } catch (err) {
      console.error("Failed to delete goal:", err);
      alert("Failed to delete roadmap. Please try again.");
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: '8vh', paddingBottom: '10vh' }}>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="d-flex justify-content-between align-items-end mb-5"
        >
          <div>
            <h1 style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '8px' }}>Your Roadmaps</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '18px', fontWeight: 500 }}>Pick up where you left off or review your progress.</p>
          </div>
          <div className="d-none d-md-block" style={{ height: '2px', flex: 1, backgroundColor: 'var(--border)', margin: '0 40px', marginBottom: '18px' }}></div>
        </motion.div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-5">
            <p className="text-danger">{error}</p>
            <button className="btn btn-outline-dark" onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : (
          <div className="row g-4">
            {goals.length > 0 ? goals.map((goal, index) => (
              <div className="col-md-6 col-lg-4" key={goal.id}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -8, x: -4, boxShadow: '12px 12px 0px var(--border)' }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/graph/${goal.id}`)}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '3px solid var(--border)',
                    borderRadius: '24px',
                    padding: '32px',
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '4px 4px 0px var(--border)'
                  }}
                  className="roadmap-card"
                >
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    <div style={{ 
                      width: '48px', height: '48px', 
                      borderRadius: '12px', 
                      background: 'var(--accent-highlight)',
                      border: '2px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <IoBookOutline size={24} />
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.2, color: 'var(--accent-danger)' }}
                      whileTap={{ scale: 0.8 }}
                      className="btn btn-sm p-0"
                      onClick={(e) => handleDeleteGoal(e, goal.id)}
                    >
                      <IoTrashOutline size={20} />
                    </motion.button>
                  </div>
                  <h4 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>{goal.title}</h4>
                  <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>
                    {goal.description || 'Continue your journey to master this skill.'}
                  </p>
                  <div className="mt-4 pt-3 d-flex align-items-center justify-content-between border-top" style={{ borderColor: 'var(--border)', borderTopWidth: '2px !important' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Open Roadmap</span>
                    <IoArrowForward size={18} />
                  </div>
                </motion.div>
              </div>
            )) : (
              <div className="col-12 text-center py-5">
                <div style={{ padding: '60px', border: '3px dashed var(--border)', borderRadius: '32px' }}>
                  <h3 style={{ fontWeight: 800 }}>No active roadmaps yet.</h3>
                  <p className="text-muted mb-4">Go to Home and enter a goal to generate your first learning path!</p>
                  <button onClick={() => navigate('/')} className="btn btn-dark px-4 py-2" style={{ borderRadius: '100px', fontWeight: 600 }}>Go to Home</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
    </div>
  );
};

export default Roadmaps;
