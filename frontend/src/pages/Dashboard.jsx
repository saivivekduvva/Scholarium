import React, { useState, useEffect } from 'react';
import '../styles/premium.css';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GoalInput from '../components/GoalInput';
import api from '../services/api';
import { IoRocketOutline, IoFlameOutline, IoSparklesOutline, IoBookOutline, IoArrowForward, IoTrashOutline } from 'react-icons/io5';

const Dashboard = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [userStats, setUserStats] = useState(null);

  // Fetch goals only; profile data is fetched lazily in Profile page to avoid unnecessary AI calls.
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 120px)', backgroundColor: 'var(--bg-page)', paddingBottom: '80px', transition: 'background-color 0.3s ease' }}>
      
      {/* Premium Hero Header Section */}
      <div style={{ 
        position: 'relative', 
        overflow: 'hidden',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)', 
        padding: '80px 0 60px 0',
        transition: 'background-color 0.3s ease'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.4, background: 'radial-gradient(circle at top right, var(--accent-primary), transparent 40%), radial-gradient(circle at bottom left, var(--accent-secondary), transparent 30%)', zIndex: 0 }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="row align-items-center">
            <div className="col-lg-12">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { 
                    opacity: 1,
                    transition: { staggerChildren: 0.15, delayChildren: 0.2 } 
                  }
                }}
              >
                <motion.div 
                  variants={{ 
                    hidden: { opacity: 0, y: 20 }, 
                    visible: { opacity: 1, y: 0 } 
                  }}
                  className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-4"
                  style={{ background: 'var(--border)', color: 'var(--accent-primary)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.5px' }}
                >
                  <IoRocketOutline size={16} />
                  <span>YOUR PERSONAL MASTERY HUB</span>
                </motion.div>
                
                <motion.h1 
                  variants={{ 
                    hidden: { opacity: 0, y: 20 }, 
                    visible: { opacity: 1, y: 0 } 
                  }}
                  style={{ fontSize: '56px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', lineHeight: 1.1, letterSpacing: '-1px' }}
                >
                  Welcome back,<br />
                  <span style={{ 
                    background: 'linear-gradient(135deg, #4F6EF7 0%, #8E2DE2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'inline-block'
                  }}>
                    {userStats?.username || 'Learner'}
                  </span>
                </motion.h1>
                
                <motion.p 
                  variants={{ 
                    hidden: { opacity: 0, y: 20 }, 
                    visible: { opacity: 1, y: 0 } 
                  }}
                  style={{ fontSize: '20px', color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: 1.6, fontWeight: 500 }}
                >
                  Focus on your goals. You have <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{goals.length} active roadmaps</span> in progress.
                </motion.p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mt-5">
        <div className="row g-5">
          
          {/* Main Action Area */}
          <div className="col-lg-8">
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>Current Mastery Roadmaps</h3>
              </div>

              {goals.length > 0 ? (
                <div className="row g-4">
                  {goals.map(goal => (
                    <motion.div key={goal.id} variants={itemVariants} className="col-md-6">
                      <div 
                        className="card h-100 border-0 shadow-sm p-4 roadmap-card premium-card"
                        style={{ borderRadius: '24px', transition: 'all 0.4s ease', cursor: 'pointer', background: 'var(--bg-glass)', backdropFilter: 'blur(8px)', position: 'relative', border: '1px solid var(--border) !important' }}
                        onClick={() => navigate(`/graph/${goal.id}`)}
                      >
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="p-2 rounded-3" style={{ background: 'var(--border)', color: 'var(--accent-primary)' }}>
                            <IoRocketOutline size={24} />
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <span className={`badge rounded-pill px-3 py-2 ${goal.status === 'active' ? 'bg-primary-subtle text-primary' : 'bg-success-subtle text-success'}`} style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>
                              {goal.status}
                            </span>
                            <button 
                              onClick={(e) => handleDeleteGoal(e, goal.id)}
                              className="btn btn-link text-muted p-0 ms-1"
                              style={{ zIndex: 20, cursor: 'pointer', color: 'var(--text-muted)' }}
                              title="Delete Roadmap"
                            >
                              <IoTrashOutline size={18} />
                            </button>
                          </div>
                        </div>
                        <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{goal.title}</h4>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {goal.description || 'Mastering the fundamentals and advanced concepts...'}
                        </p>
                        <div className="mt-auto d-flex align-items-center justify-content-between pt-3 border-top" style={{ borderColor: 'var(--border)' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-primary)' }}>Continue Learning</span>
                          <IoArrowForward size={18} className="text-primary" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5 bg-white rounded-4 border border-dashed shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                  <IoBookOutline size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No roadmaps yet</h5>
                  <p className="text-muted small">Start your first goal to see it here.</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar Area */}
          <div className="col-lg-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card border-0 shadow-lg p-4" 
              style={{ borderRadius: '28px', background: 'var(--bg-surface)', border: '1px solid var(--border)', position: 'sticky', top: '100px' }}
            >
              <h4 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>New Roadmap</h4>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>Describe your goal, and our AI will build a personalized study path for you.</p>
              
              <div className="goal-input-wrapper mt-2">
                <GoalInput />
              </div>

              <div className="mt-5 p-4 rounded-4" style={{ background: 'linear-gradient(135deg, #4F6EF7 0%, #8E2DE2 100%)', color: 'white' }}>
                <h6 style={{ fontWeight: 700, marginBottom: '8px' }}>Scholarium Pro Tip</h6>
                <p style={{ fontSize: '12px', opacity: 0.9, margin: 0 }}>Be specific with your goals (e.g., "Python for Web Scraping") for a more accurate path!</p>
              </div>
            </motion.div>
          </div>

        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .roadmap-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-card) !important;
        }
        .roadmap-card:hover h4 {
          color: var(--accent-primary) !important;
        }
      `}} />
    </div>
  );
};

export default Dashboard;
