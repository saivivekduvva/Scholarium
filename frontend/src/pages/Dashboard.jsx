import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GoalInput from '../components/GoalInput';
import api from '../services/api';
import { IoRocketOutline, IoFlameOutline, IoSparklesOutline, IoBookOutline, IoArrowForward } from 'react-icons/io5';

const Dashboard = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [userStats, setUserStats] = useState(null);

  useEffect(() => {
    api.getGoals()
      .then(res => setGoals(res.data))
      .catch(err => console.error("Failed to fetch goals:", err));
      
    api.getProfile()
      .then(res => setUserStats(res.data))
      .catch(err => console.error("Failed to fetch profile:", err));
  }, []);

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
    <div style={{ minHeight: 'calc(100vh - 120px)', backgroundColor: '#F8FAFC', paddingBottom: '80px' }}>
      
      {/* Premium Hero Header Section */}
      <div style={{ 
        position: 'relative', 
        overflow: 'hidden',
        background: 'radial-gradient(circle at top right, rgba(79, 110, 247, 0.05), transparent 40%), radial-gradient(circle at bottom left, rgba(142, 45, 226, 0.03), transparent 30%), #FFFFFF',
        borderBottom: '1px solid #E2E8F0', 
        padding: '80px 0 60px 0' 
      }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
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
                  style={{ background: 'rgba(79, 110, 247, 0.08)', color: 'var(--accent-primary)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.5px' }}
                >
                  <IoRocketOutline size={16} />
                  <span>YOUR PERSONAL LEARNING ENGINE</span>
                </motion.div>
                
                <motion.h1 
                  variants={{ 
                    hidden: { opacity: 0, y: 20 }, 
                    visible: { opacity: 1, y: 0 } 
                  }}
                  style={{ fontSize: '56px', fontWeight: 800, color: '#0F172A', marginBottom: '16px', lineHeight: 1.1, letterSpacing: '-1px' }}
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
                  style={{ fontSize: '20px', color: '#64748B', maxWidth: '600px', lineHeight: 1.6, fontWeight: 500 }}
                >
                  You've already mastered <span style={{ color: '#0F172A', fontWeight: 700 }}>{goals.length} mastery roadmaps</span>. Ready to dive back in or explore something new?
                </motion.p>
              </motion.div>
            </div>
            
            <div className="col-lg-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, rotate: -2 }} 
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, type: 'spring' }}
                className="d-flex flex-column gap-3 mt-5 mt-lg-0"
              >
                <div className="card border-0 shadow-sm p-4 d-flex flex-row align-items-center gap-4" style={{ borderRadius: '24px', background: 'white' }}>
                  <div className="p-3 rounded-4" style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#EF4444' }}>
                    <IoFlameOutline size={32} />
                  </div>
                  <div>
                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{userStats?.streak_count || 0}</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>Day Streak</div>
                  </div>
                </div>
                
                <div className="card border-0 shadow-sm p-4 d-flex flex-row align-items-center gap-4" style={{ borderRadius: '24px', background: 'white' }}>
                  <div className="p-3 rounded-4" style={{ background: 'rgba(245, 158, 11, 0.08)', color: '#F59E0B' }}>
                    <IoSparklesOutline size={32} />
                  </div>
                  <div>
                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{userStats?.total_xp || 0}</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>Total XP</div>
                  </div>
                </div>
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
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>Current Mastery Roadmaps</h3>
                {goals.length > 0 && <span className="text-primary small fw-bold" style={{ cursor: 'pointer' }}>View All</span>}
              </div>

              {goals.length > 0 ? (
                <div className="row g-4">
                  {goals.map(goal => (
                    <motion.div key={goal.id} variants={itemVariants} className="col-md-6">
                      <div 
                        className="card h-100 border-0 shadow-sm p-4 roadmap-card" 
                        style={{ borderRadius: '24px', transition: 'all 0.3s ease', cursor: 'pointer', background: 'white' }}
                        onClick={() => navigate(`/graph/${goal.id}`)}
                      >
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="p-2 rounded-3" style={{ background: 'rgba(79, 110, 247, 0.1)', color: 'var(--accent-primary)' }}>
                            <IoRocketOutline size={24} />
                          </div>
                          <span className={`badge rounded-pill px-3 py-2 ${goal.status === 'active' ? 'bg-light text-primary' : 'bg-success-subtle text-success'}`} style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>
                            {goal.status}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>{goal.title}</h4>
                        <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {goal.description || 'Mastering the fundamentals and advanced concepts...'}
                        </p>
                        <div className="mt-auto d-flex align-items-center justify-content-between pt-3 border-top" style={{ borderColor: '#F1F5F9' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-primary)' }}>Continue Learning</span>
                          <IoArrowForward size={18} className="text-primary" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5 bg-white rounded-4 border border-dashed shadow-sm">
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
              style={{ borderRadius: '28px', background: 'white', position: 'sticky', top: '100px' }}
            >
              <h4 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>New Roadmap</h4>
              <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px' }}>Describe your goal, and our AI will build a personalized study path for you.</p>
              
              <div style={{ transform: 'scale(1.05)', transformOrigin: 'top center' }}>
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
          box-shadow: 0 12px 24px rgba(79, 110, 247, 0.12) !important;
        }
        .roadmap-card:hover h4 {
          color: var(--accent-primary) !important;
        }
      `}} />
    </div>
  );
};

export default Dashboard;
