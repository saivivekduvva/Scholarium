import React, { useState, useEffect } from 'react';
import '../styles/premium.css';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GoalInput from '../components/GoalInput';
import api from '../services/api';
import { IoArrowForward, IoTrashOutline, IoBookOutline } from 'react-icons/io5';

const Dashboard = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    api.getGoals()
      .then(res => setGoals(res.data))
      .catch(err => console.error('Failed to fetch goals:', err));
  }, []);

  const handleDeleteGoal = async (e, id) => {
    e.stopPropagation();
    try {
      await api.deleteGoal(id);
      setGoals(goals.filter(g => g.id !== id));
    } catch (err) {
      console.error("Failed to delete goal:", err);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* Hero Image Background */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          backgroundImage: 'url(/hero-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.6,
          zIndex: -1,
          maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)'
        }}
      />

      <div className="container" style={{ paddingTop: '12vh', position: 'relative', zIndex: 10 }}>
        {/* Main Hero Typography */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-5"
        >
          <h1 style={{ 
            fontFamily: 'Newsreader, serif', 
            fontSize: 'clamp(48px, 6vw, 82px)', 
            fontWeight: 400, 
            lineHeight: 1.1,
            letterSpacing: '-1px',
            color: '#FFFFFF',
            textShadow: '0 4px 24px rgba(0,0,0,0.5)'
          }}>
            Transform your learning.<br />
            Elevate your performance.
          </h1>
          <p className="mt-4 mx-auto" style={{
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.7)',
            maxWidth: '600px',
            fontWeight: 300,
            lineHeight: 1.5
          }}>
            Scholarium adapts to your intellectual rhythm in real time — breaking down complex skills, revealing hidden connections, and helping you achieve true mastery.
          </p>
        </motion.div>

        {/* Goal Input Area */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto"
          style={{ maxWidth: '640px', marginTop: '6vh' }}
        >
          <div style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid var(--glass-border)',
            borderRadius: '32px',
            padding: '8px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <GoalInput />
          </div>
        </motion.div>

        {/* User's Roadmaps */}
        <div style={{ marginTop: '15vh', paddingBottom: '10vh' }}>
          <h3 style={{ 
            fontFamily: 'Inter, sans-serif', 
            fontSize: '14px', 
            textTransform: 'uppercase', 
            letterSpacing: '2px', 
            color: 'var(--text-secondary)',
            marginBottom: '32px',
            textAlign: 'center'
          }}>
            Your Active Journeys
          </h3>

          <div className="row g-4 justify-content-center">
            {goals.length > 0 ? goals.map((goal, index) => (
              <div className="col-md-6 col-lg-4" key={goal.id}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + (index * 0.1) }}
                  onClick={() => navigate(`/graph/${goal.id}`)}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-card)',
                    padding: '32px',
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(16px)'
                  }}
                  className="roadmap-card"
                >
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    <div style={{ 
                      width: '48px', height: '48px', 
                      borderRadius: '16px', 
                      background: 'rgba(255, 255, 255, 0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--accent-primary)'
                    }}>
                      <IoBookOutline size={24} />
                    </div>
                    <button 
                      className="btn btn-sm btn-link text-muted p-0"
                      onClick={(e) => handleDeleteGoal(e, goal.id)}
                    >
                      <IoTrashOutline size={18} />
                    </button>
                  </div>
                  <h4 style={{ fontFamily: 'Newsreader, serif', fontSize: '24px', color: 'var(--text-primary)', marginBottom: '12px' }}>{goal.title}</h4>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, flex: 1 }}>
                    {goal.description || 'Master the fundamentals and advanced concepts to reach your goal.'}
                  </p>
                  <div className="mt-4 pt-3 d-flex align-items-center justify-content-between border-top" style={{ borderColor: 'var(--border)' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Resume</span>
                    <IoArrowForward size={16} color="var(--accent-primary)" />
                  </div>
                </motion.div>
              </div>
            )) : (
              <div className="col-12 text-center py-5">
                <p style={{ color: 'var(--text-muted)' }}>No active journeys yet. Start by typing a goal above.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .roadmap-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.6) !important;
          border-color: rgba(255, 255, 255, 0.15) !important;
        }
      `}} />
    </div>
  );
};

export default Dashboard;
