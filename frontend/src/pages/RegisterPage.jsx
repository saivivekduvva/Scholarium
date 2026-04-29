import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { register } = useContext(AuthContext);

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await register(username, email, password);
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100%', 
      backgroundColor: '#F5F3EF',
      backgroundImage: 'radial-gradient(#00000010 1px, transparent 0)',
      backgroundSize: '24px 24px',
      color: '#1A1A1A',
      fontFamily: 'Inter, sans-serif',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      
      <nav className="d-flex justify-content-between align-items-center px-5 py-4">
        <div style={{ fontWeight: 900, fontSize: '24px', letterSpacing: '-1px' }}>Scholarium</div>
        <div className="d-none d-md-flex gap-5" style={{ fontSize: '15px', fontWeight: 500 }}>
          <Link to="/about" style={{ textDecoration: 'none', color: 'inherit' }}>About</Link>
          <span style={{ cursor: 'pointer' }}>Resources</span>
        </div>
        <Link to="/contact" className="btn btn-outline-dark px-4 py-2" style={{ borderRadius: '100px', fontWeight: 600, textDecoration: 'none' }}>Get in touch</Link>
      </nav>

      <div className="container" style={{ paddingTop: '5vh' }}>
        <div className="text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="d-flex flex-wrap justify-content-center align-items-center gap-3 mb-5"
          >
            <h1 style={{ fontSize: 'clamp(32px, 6vw, 70px)', fontWeight: 800, letterSpacing: '-2px' }}>Start your</h1>
            <div style={{ 
              width: '140px', height: '70px', 
              backgroundImage: 'url(/pill-2.png)', backgroundSize: 'cover', backgroundPosition: 'center',
              borderRadius: '100px', border: '3px solid #1A1A1A'
            }} />
            <h1 style={{ fontSize: 'clamp(32px, 6vw, 70px)', fontWeight: 800, letterSpacing: '-2px' }}>intellectual</h1>
            <h1 style={{ fontSize: 'clamp(32px, 6vw, 70px)', fontWeight: 800, letterSpacing: '-2px' }}>journey</h1>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto"
            style={{ maxWidth: '480px' }}
          >
            <div style={{ 
              backgroundColor: 'white', 
              border: '2px solid #1A1A1A', 
              borderRadius: '32px',
              padding: '32px',
              boxShadow: '8px 8px 0px #1A1A1A'
            }}>
              <h4 className="fw-bold mb-4">Create Account</h4>
              {error && <div className="alert alert-danger p-2 small mb-3">{error}</div>}
              {success && (
                <div className="alert alert-success border-0 rounded-4 p-4 mb-4" style={{ backgroundColor: 'rgba(6, 201, 160, 0.1)', color: '#06C9A0' }}>
                  <h5 className="fw-bold mb-2">Check your inbox! 📧</h5>
                  <p className="small mb-0">We've sent a verification link to <strong>{email}</strong>. Please verify your account to continue.</p>
                </div>
              )}
              
              {!success && (
                <form onSubmit={handleSubmit}>
                <div className="d-flex flex-column gap-3">
                  <input 
                    type="text" 
                    placeholder="Username" 
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ borderRadius: '100px', padding: '16px 24px', border: '2px solid #EEE' }}
                  />
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ borderRadius: '100px', padding: '16px 24px', border: '2px solid #EEE' }}
                  />
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Password" 
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ borderRadius: '100px', padding: '16px 24px', border: '2px solid #EEE' }}
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
                  <button 
                    type="submit" 
                    className="btn btn-dark w-100 py-3 mt-2" 
                    style={{ borderRadius: '100px', fontWeight: 700, fontSize: '18px' }}
                  >
                    Join Scholarium &rarr;
                  </button>
                </div>
                </form>
              )}
              <div className="mt-4 small">
                Already have an account? <Link to="/login" style={{ color: '#4F6EF7', fontWeight: 700 }}>Sign in</Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
