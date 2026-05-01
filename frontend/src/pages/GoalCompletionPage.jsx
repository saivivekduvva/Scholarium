import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoCheckmarkCircle, IoCloudDoneOutline, IoShareSocialOutline, IoArrowBackOutline } from 'react-icons/io5';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const GoalCompletionPage = () => {
  const { goalId } = useParams();
  const { user } = useContext(AuthContext);
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getGoals()
      .then(res => {
        const found = res.data.find(g => String(g.id) === String(goalId));
        setGoal(found);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [goalId]);

  if (loading) return null;

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100%', 
      backgroundColor: '#F5F3EF',
      backgroundImage: 'radial-gradient(#00000010 1px, transparent 0)',
      backgroundSize: '24px 24px',
      color: '#1A1A1A',
      fontFamily: 'Outfit, sans-serif',
      padding: '80px 20px'
    }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center"
        >
          {/* Trophy/Success Icon */}
          <div style={{ fontSize: '100px', marginBottom: '20px' }}>🏆</div>
          
          <h1 style={{ fontWeight: 900, fontSize: 'clamp(40px, 8vw, 64px)', letterSpacing: '-2px', marginBottom: '10px' }}>
            Mission Accomplished!
          </h1>
          
          <p style={{ fontSize: '20px', fontWeight: 600, color: '#4F6EF7', marginBottom: '40px' }}>
            You've successfully mastered the roadmap for:
          </p>

          {/* Goal Certificate Card */}
          <div style={{ 
            background: 'white', 
            padding: '40px', 
            borderRadius: '32px', 
            border: '4px solid #1A1A1A', 
            boxShadow: '12px 12px 0px #1A1A1A',
            marginBottom: '60px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative Dots */}
            <div style={{ position: 'absolute', top: '15px', left: '15px', display: 'flex', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F75C5C', border: '2px solid #1A1A1A' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F7C35C', border: '2px solid #1A1A1A' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#06C9A0', border: '2px solid #1A1A1A' }} />
            </div>

            <h2 style={{ fontWeight: 900, fontSize: '32px', marginBottom: '20px' }}>{goal?.title || 'Untitled Goal'}</h2>
            <div style={{ width: '60px', height: '4px', background: '#1A1A1A', margin: '0 auto 30px' }} />
            
            <div style={{ fontSize: '18px', color: '#666', lineHeight: '1.6', marginBottom: '30px' }}>
                This is to certify that <span style={{ fontWeight: 800, color: '#1A1A1A' }}>{user?.username}</span> has demonstrated 100% mastery across all required skills within the {goal?.title} learning path.
            </div>

            <div className="d-flex justify-content-center gap-2 align-items-center" style={{ opacity: 0.7 }}>
                <IoCheckmarkCircle size={24} color="#06C9A0" />
                <span style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase' }}>Verified by Scholarium AI</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex flex-column flex-md-row justify-content-center gap-4">
            <Link 
              to="/" 
              className="btn btn-dark px-5 py-3 d-flex align-items-center justify-content-center gap-2" 
              style={{ borderRadius: '100px', fontWeight: 700, fontSize: '18px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
            >
              <IoArrowBackOutline size={20} /> Back to Dashboard
            </Link>
            
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Achievement link copied to clipboard!");
              }}
              className="btn btn-outline-dark px-5 py-3 d-flex align-items-center justify-content-center gap-2" 
              style={{ borderRadius: '100px', fontWeight: 700, fontSize: '18px', border: '3px solid #1A1A1A' }}
            >
              <IoShareSocialOutline size={20} /> Share Achievement
            </button>
          </div>

          <div className="mt-5" style={{ opacity: 0.5, fontSize: '14px', fontWeight: 600 }}>
            <IoCloudDoneOutline className="me-1" /> All progress synced and secured
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GoalCompletionPage;
