import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(username, password);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
      {/* High-level Bubbly Background */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            width: 100 + Math.random() * 300,
            height: 100 + Math.random() * 300,
            borderRadius: '50%',
            background: i % 2 === 0 ? 'rgba(79,110,247,0.1)' : 'rgba(142,45,226,0.08)',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            filter: 'blur(40px)',
            zIndex: 0
          }}
        />
      ))}

      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '24px', border: '1px solid rgba(0, 0, 0, 0.05)', padding: '48px', width: '100%', maxWidth: '420px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.05)', color: '#1e293b'
          }}
        >
          <div className="text-center mb-4">
            <div className="d-inline-block px-3 py-1 rounded-pill mb-3" style={{ background: 'rgba(79,110,247,0.1)', color: '#4F6EF7', fontSize: '12px', fontWeight: 700 }}>SCHOLARIUM</div>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '32px', color: '#0f172a' }}>Welcome Back</h2>
          </div>
          
          {error && <div className="alert alert-danger" style={{ fontSize: '14px', borderRadius: '8px' }}>{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label" style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Username</label>
              <input 
                type="text" 
                className="form-control" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
                style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#0f172a', padding: '12px 16px', borderRadius: '12px' }} 
              />
            </div>
            <div className="mb-5">
              <label className="form-label" style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Password</label>
              <input 
                type="password" 
                className="form-control" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#0f172a', padding: '12px 16px', borderRadius: '12px' }} 
              />
            </div>
            <motion.button 
              whileHover={{ scale: 1.02, boxShadow: '0 10px 20px rgba(79,110,247,0.2)' }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className="btn w-100" 
              style={{ background: 'linear-gradient(135deg, #4F6EF7 0%, #8E2DE2 100%)', color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontWeight: 600, fontSize: '16px' }}
            >
              Sign In
            </motion.button>
          </form>
          <div className="text-center mt-4" style={{ color: '#64748b', fontSize: '14px' }}>
            Don't have an account? <Link to="/register" style={{ color: '#4F6EF7', textDecoration: 'none', fontWeight: 600 }}>Create one</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
