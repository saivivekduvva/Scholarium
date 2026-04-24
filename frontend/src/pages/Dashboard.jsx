import React, { useState, useEffect } from 'react';
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
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh' }}>
      
      <div className="container" style={{ paddingTop: '8vh', position: 'relative', zIndex: 10 }}>
        {/* Main Hero Typography inspired by Akademia */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-5"
        >
          <div className="d-flex flex-wrap justify-content-center align-items-center gap-3 mb-2">
            <h1 style={{ fontSize: 'clamp(40px, 8vw, 82px)', fontWeight: 800, letterSpacing: '-2px', color: 'var(--text-primary)' }}>Master</h1>
            <div style={{ 
              width: '160px', height: '80px', 
              backgroundImage: 'url(/pill-1.png)', backgroundSize: 'cover', backgroundPosition: 'center',
              borderRadius: '100px', border: '3px solid var(--border)'
            }} />
            <h1 style={{ fontSize: 'clamp(40px, 8vw, 82px)', fontWeight: 800, letterSpacing: '-2px', color: 'var(--text-primary)' }}>any skill</h1>
          </div>

          <div className="d-flex flex-wrap justify-content-center align-items-center gap-3 mb-4">
            <h1 style={{ fontSize: 'clamp(40px, 8vw, 82px)', fontWeight: 800, letterSpacing: '-2px', color: 'var(--text-primary)' }}>with</h1>
            <div style={{ display: 'flex', gap: '-15px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--accent-highlight)', border: '3px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '24px', zIndex: 2 }}>&</div>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--accent-secondary)', border: '3px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginLeft: '-15px', zIndex: 1 }}>
                <IoBookOutline size={24} />
              </div>
            </div>
            <h1 style={{ fontSize: 'clamp(40px, 8vw, 82px)', fontWeight: 800, letterSpacing: '-2px', color: 'var(--text-primary)' }}>intelligence</h1>
          </div>

          <p className="mt-4 mx-auto" style={{
            fontSize: '18px',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            fontWeight: 500,
            lineHeight: 1.5
          }}>
            Scholarium builds unique learning paths that adapt to you. Enter a goal below to begin your personalized journey.
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
            background: 'var(--bg-surface)',
            border: '3px solid var(--border)',
            borderRadius: '32px',
            padding: '12px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <GoalInput />
          </div>
        </motion.div>

        {/* User's Roadmaps */}
        <div style={{ marginTop: '12vh', paddingBottom: '10vh' }}>
          <div className="d-flex justify-content-between align-items-end mb-5">
            <h2 style={{ fontSize: '32px', fontWeight: 800 }}>Active Journeys</h2>
            <div className="d-none d-md-block" style={{ height: '2px', flex: 1, backgroundColor: 'var(--border)', margin: '0 30px', marginBottom: '12px' }}></div>
          </div>

          <div className="row g-4 justify-content-center">
            {goals.length > 0 ? goals.map((goal, index) => (
              <div className="col-md-6 col-lg-4" key={goal.id}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + (index * 0.1) }}
                  onClick={() => navigate(`/graph/${goal.id}`)}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '3px solid var(--border)',
                    borderRadius: 'var(--radius-card)',
                    padding: '32px',
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s ease',
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
                    <button 
                      className="btn btn-sm p-0"
                      onClick={(e) => handleDeleteGoal(e, goal.id)}
                    >
                      <IoTrashOutline size={20} />
                    </button>
                  </div>
                  <h4 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>{goal.title}</h4>
                  <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>
                    {goal.description || 'Master the fundamentals and advanced concepts to reach your goal.'}
                  </p>
                  <div className="mt-4 pt-3 d-flex align-items-center justify-content-between border-top" style={{ borderColor: 'var(--border)', borderTopWidth: '2px !important' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Resume Journey</span>
                    <IoArrowForward size={18} />
                  </div>
                </motion.div>
              </div>
            )) : (
              <div className="col-12 text-center py-5">
                <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>Your study board is empty. Start by typing a goal above.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .roadmap-card:hover {
          transform: translate(-4px, -4px);
          box-shadow: 8px 8px 0px var(--border) !important;
        }
      `}} />
    </div>
  );
};

export default Dashboard;
