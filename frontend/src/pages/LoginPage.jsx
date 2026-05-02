import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user } = useContext(AuthContext);

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(username, password);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100%', 
      backgroundColor: 'var(--bg-page)', // Paper-like off-white
      backgroundImage: 'var(--gradient-bg)',
      backgroundSize: '24px 24px',
      color: 'var(--text-primary)',
      fontFamily: 'Inter, sans-serif',
      position: 'relative',
      overflowX: 'hidden',
      paddingTop: '0'
    }}>
      

      <div className="container" style={{ paddingTop: '10vh' }}>
        <div className="text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="d-flex flex-wrap justify-content-center align-items-center gap-3 mb-2"
          >
            <h1 style={{ fontSize: 'clamp(40px, 8vw, 90px)', fontWeight: 800, letterSpacing: '-2px' }}>Discover</h1>
            <div style={{ 
              width: '180px', height: '90px', 
              backgroundImage: 'url(/pill-1.png)', backgroundSize: 'cover', backgroundPosition: 'center',
              borderRadius: '100px', border: '3px solid var(--border)'
            }} />
            <h1 style={{ fontSize: 'clamp(40px, 8vw, 90px)', fontWeight: 800, letterSpacing: '-2px' }}>wisdom</h1>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="d-flex flex-wrap justify-content-center align-items-center gap-3 mb-5"
          >
            <h1 style={{ fontSize: 'clamp(40px, 8vw, 90px)', fontWeight: 800, letterSpacing: '-2px' }}>curriculums</h1>
            <div style={{ display: 'flex', gap: '-10px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--accent-warn)', border: '3px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '24px', zIndex: 2 }}>&</div>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--accent-secondary)', border: '3px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginLeft: '-15px', zIndex: 1 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              </div>
            </div>
            <h1 style={{ fontSize: 'clamp(40px, 8vw, 90px)', fontWeight: 800, letterSpacing: '-2px' }}>mastery</h1>
            <div style={{ 
              width: '100px', height: '100px', 
              backgroundImage: 'url(/pill-2.png)', backgroundSize: 'cover', backgroundPosition: 'center',
              borderRadius: '50%', border: '3px solid var(--border)'
            }} />
          </motion.div>

          <p className="mx-auto text-muted mb-5" style={{ maxWidth: '500px', fontSize: '18px' }}>
            Ready to unlock your potential? Our AI-driven roadmap adapts to your goals in real-time.
          </p>

          {/* Login Box inspired by the Email Box */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto"
            style={{ maxWidth: '480px' }}
          >
            <div style={{ 
              backgroundColor: 'var(--bg-surface)', 
              border: '2px solid var(--border)', 
              borderRadius: '32px',
              padding: '32px',
              boxShadow: '8px 8px 0px var(--border)'
            }}>
              <h4 className="fw-bold mb-4">Welcome Back</h4>
              {error && <div className="alert alert-danger p-2 small mb-3">{error}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="d-flex flex-column gap-3">
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      placeholder="Username" 
                      className="form-control"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      style={{ 
                        borderRadius: '100px', 
                        padding: '16px 24px', 
                        border: '2px solid #EEE',
                        fontSize: '16px'
                      }}
                    />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Password" 
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ 
                        borderRadius: '100px', 
                        padding: '16px 24px', 
                        border: '2px solid #EEE',
                        fontSize: '16px'
                      }}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#AAA',
                        cursor: 'pointer'
                      }}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      )}
                    </button>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: '#333' }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    className="btn btn-dark w-100 py-3 mt-2" 
                    style={{ borderRadius: '100px', fontWeight: 700, fontSize: '18px' }}
                  >
                    Sign In &rarr;
                  </motion.button>
                </div>
              </form>
              <div className="mt-4 small">
                Don't have an account? <Link to="/register" style={{ color: 'var(--accent-secondary)', fontWeight: 700 }}>Join now</Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Badges */}
      <div style={{ position: 'absolute', top: '25%', left: '10%', opacity: 0.1 }}>
        <svg width="100" height="100" viewBox="0 0 100 100"><path d="M10 50 Q 50 10 90 50 T 170 50" fill="none" stroke="black" strokeWidth="2" strokeDasharray="5,5" /></svg>
      </div>

    </div>
  );
};

export default LoginPage;
