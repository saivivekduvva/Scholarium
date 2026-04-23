import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import ProgressRing from '../components/ProgressRing';
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
            checkpoints: [],
            sessions: []
          });
        });
    } else {
      // If user not loaded yet or no id, show empty state
      setData({
        checkpoints: [],
        sessions: []
      });
    }
  }, [user]);

  if (!data) {
    return <div className="text-center py-5">Loading profile...</div>;
  }

  const radarData = data.checkpoints.map(cp => ({
    subject: cp.skill_name,
    A: cp.proficiency,
    fullMark: 100,
  }));



  return (
    <motion.div 
      className="container py-5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      style={{ minHeight: '80vh', color: 'var(--text-primary)', transition: 'all 0.3s ease' }}
    >
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
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{user?.username ? `${user.username}'s Profile` : 'My Scholarium Profile'}</h2>
          <div className="text-muted" style={{ color: 'var(--text-muted)' }}>Student</div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <h4 className="mb-4" style={{ fontFamily: 'Outfit', color: 'var(--text-primary)' }}>Skill Mastery</h4>
          <div className="d-flex flex-wrap gap-3">
            {data.checkpoints?.map((cp, i) => (
              <div key={i} className="card p-3 border-0 d-flex flex-row align-items-center" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border) !important', boxShadow: 'var(--shadow-node)', borderRadius: '12px', minWidth: '200px' }}>
                <ProgressRing radius={20} stroke={4} progress={cp.proficiency} />
                <div className="ms-3">
                  <div className="fw-bold" style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{cp.skill_name}</div>
                  <div className="small text-muted" style={{ color: 'var(--text-muted)' }}>{cp.proficiency}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-md-6">
          <h4 className="mb-4" style={{ fontFamily: 'Outfit', color: 'var(--text-primary)' }}>Proficiency Radar</h4>
          <div className="card border-0" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border) !important', boxShadow: 'var(--shadow-card)', borderRadius: 'var(--radius-card)', height: '300px' }}>
            {radarData.length > 2 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Proficiency" dataKey="A" stroke="var(--accent-primary)" fill="var(--accent-primary)" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="d-flex h-100 align-items-center justify-content-center text-muted small" style={{ color: 'var(--text-muted)' }}>
                Complete more skills to see your radar chart.
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
