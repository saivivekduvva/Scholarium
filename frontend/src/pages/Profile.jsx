import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { IoBarChartOutline, IoCheckmarkCircleOutline, IoFlagOutline, IoSchoolOutline } from 'react-icons/io5';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const StatCard = ({ icon, label, value, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    style={{ 
      background: 'white', 
      padding: '30px', 
      borderRadius: '24px', 
      border: '3px solid #1A1A1A', 
      boxShadow: '8px 8px 0px #1A1A1A',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}
  >
    <div style={{ color, marginBottom: '15px' }}>{icon}</div>
    <div style={{ fontSize: '32px', fontWeight: 900, marginBottom: '5px' }}>{value}</div>
    <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: '#666', letterSpacing: '1px' }}>{label}</div>
  </motion.div>
);

const Profile = () => {
  const [stats, setStats] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    api.getUserStats()
      .then(res => setStats(res.data))
      .catch(err => console.error('Failed to fetch stats:', err));
  }, []);

  if (!stats) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="spinner-border" style={{ color: '#4F6EF7' }} />
    </div>
  );

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100%', 
      backgroundColor: '#F5F3EF',
      backgroundImage: 'radial-gradient(#00000010 1px, transparent 0)',
      backgroundSize: '24px 24px',
      color: '#1A1A1A',
      paddingBottom: '80px'
    }}>
      <motion.div 
        className="container py-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button 
          onClick={() => window.history.back()}
          className="btn btn-link text-decoration-none p-0 mb-5 d-flex align-items-center gap-2"
          style={{ color: '#1A1A1A', fontWeight: 800, fontSize: '16px' }}
        >
          <span>&larr;</span> Back
        </button>

        <div className="d-flex align-items-center mb-5 pb-4" style={{ borderBottom: '3px solid #1A1A1A' }}>
          <div 
            style={{ 
              width: '100px', height: '100px', borderRadius: '30px', 
              backgroundColor: '#4F6EF7', color: 'white', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: '42px', fontWeight: 900, marginRight: '30px',
              border: '4px solid #1A1A1A',
              boxShadow: '6px 6px 0px #1A1A1A'
            }}
          >
            {user?.username ? user.username.charAt(0).toUpperCase() : 'S'}
          </div>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: '42px', margin: 0, letterSpacing: '-1.5px' }}>
              {user?.username ? `${user.username}` : 'Scholarium Learner'}
            </h1>
            <div style={{ fontWeight: 600, fontSize: '18px', color: '#666' }}>Intellectual Explorer • Member since {new Date(user?.date_joined || Date.now()).getFullYear()}</div>
          </div>
        </div>

        <div className="row g-4 mb-5">
          {/* Main Hero Stat */}
          <div className="col-12">
            <div style={{ 
              background: '#1A1A1A', 
              color: 'white', 
              padding: '60px 40px', 
              borderRadius: '32px', 
              boxShadow: '12px 12px 0px rgba(0,0,0,0.1)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
                <div style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '10px', opacity: 0.7 }}>Lifetime Mastery</div>
                <h2 style={{ fontSize: '84px', fontWeight: 900, margin: 0, letterSpacing: '-4px' }}>{stats.total_mastery_points}</h2>
                <div style={{ fontSize: '18px', fontWeight: 600 }}>Total Knowledge Points Earned</div>
            </div>
          </div>

          {/* Secondary Stats Grid */}
          <div className="col-md-4">
            <StatCard 
                icon={<IoFlagOutline size={32} />} 
                label="Active Goals" 
                value={stats.total_goals} 
                color="#4F6EF7"
            />
          </div>
          <div className="col-md-4">
            <StatCard 
                icon={<IoCheckmarkCircleOutline size={32} />} 
                label="Goals Completed" 
                value={stats.completed_goals} 
                color="#06C9A0"
            />
          </div>
          <div className="col-md-4">
            <StatCard 
                icon={<IoSchoolOutline size={32} />} 
                label="Quizzes Taken" 
                value={stats.total_quizzes} 
                color="#F75C5C"
            />
          </div>
        </div>

        <div className="mt-5 p-5" style={{ background: 'white', borderRadius: '32px', border: '3px solid #1A1A1A', boxShadow: '8px 8px 0px #1A1A1A' }}>
            <div className="d-flex align-items-center gap-3 mb-4">
                <IoBarChartOutline size={28} />
                <h3 style={{ fontWeight: 900, margin: 0 }}>Learning Activity</h3>
            </div>
            <p style={{ fontSize: '18px', color: '#666', lineHeight: '1.6' }}>
                You have engaged with <span style={{ fontWeight: 800, color: '#1A1A1A' }}>{stats.total_goals} roadmaps</span> and successfully completed <span style={{ fontWeight: 800, color: '#1A1A1A' }}>{stats.completed_goals}</span> of them. Your average quiz frequency shows a dedication to mastery, with <span style={{ fontWeight: 800, color: '#1A1A1A' }}>{stats.total_quizzes} attempts</span> recorded across your profile. Keep pushing towards 100% mastery!
            </p>
        </div>

      </motion.div>
    </div>
  );
};

export default Profile;
