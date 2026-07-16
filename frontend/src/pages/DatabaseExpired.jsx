import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const DatabaseExpired = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(10px)',
      zIndex: 9999
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: 'var(--glass-surface, #1a1a2e)',
          border: '1px solid var(--border, #2d2d44)',
          borderRadius: '24px',
          padding: '40px',
          maxWidth: '500px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          color: 'var(--text-primary, #ffffff)'
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
        <h2 style={{ fontWeight: 900, marginBottom: '15px' }}>Database Expired</h2>
        <p style={{ color: 'var(--text-muted, #a0a0b0)', lineHeight: '1.6', marginBottom: '30px' }}>
          The free trial for our database provider has expired. The Scholarium platform is currently undergoing maintenance and will be back online soon once the database is migrated. 
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-dark px-4 py-2 rounded-pill fw-bold"
          >
            Check Status
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default DatabaseExpired;
