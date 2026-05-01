import React from 'react';
import { motion } from 'framer-motion';
import GoalInput from '../components/GoalInput';
import { IoBookOutline } from 'react-icons/io5';

const Dashboard = () => {
  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      
      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
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
            background: 'var(--glass-surface)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            border: '3px solid var(--border)',
            borderRadius: '32px',
            padding: '12px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <GoalInput />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
