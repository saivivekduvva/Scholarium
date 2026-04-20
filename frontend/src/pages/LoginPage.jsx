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
    <div style={{ position: 'relative', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#0f172a' }}>
      {/* Animated Background */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          borderRadius: ["20%", "50%", "20%"],
        }}
        transition={{ duration: 15, ease: "linear", repeat: Infinity }}
        style={{
          position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw',
          background: 'radial-gradient(circle, rgba(79,110,247,0.4) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)', zIndex: 0
        }}
      />
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          rotate: [0, -90, 0],
        }}
        transition={{ duration: 20, ease: "linear", repeat: Infinity }}
        style={{
          position: 'absolute', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw',
          background: 'radial-gradient(circle, rgba(142,45,226,0.3) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(80px)', zIndex: 0
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '48px', width: '100%', maxWidth: '420px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.3)', color: 'white'
          }}
        >
          <h2 className="mb-4 text-center" style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '32px' }}>Welcome Back</h2>
          
          {error && <div className="alert alert-danger" style={{ fontSize: '14px', borderRadius: '8px' }}>{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Username</label>
              <input 
                type="text" 
                className="form-control" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '12px 16px', borderRadius: '12px' }} 
              />
            </div>
            <div className="mb-5">
              <label className="form-label" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Password</label>
              <input 
                type="password" 
                className="form-control" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '12px 16px', borderRadius: '12px' }} 
              />
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className="btn w-100" 
              style={{ background: 'linear-gradient(135deg, #4F6EF7 0%, #8E2DE2 100%)', color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontWeight: 600, fontSize: '16px' }}
            >
              Sign In
            </motion.button>
          </form>
          <div className="text-center mt-4" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
            Don't have an account? <Link to="/register" style={{ color: '#4F6EF7', textDecoration: 'none', fontWeight: 600 }}>Create one</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
