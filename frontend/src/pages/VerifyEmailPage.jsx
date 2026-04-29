import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        await api.verifyEmail({ token });
        setStatus('success');
      } catch (err) {
        console.error("Verification failed", err);
        setStatus('error');
        setErrorMsg(err.response?.data?.error || "Verification link is invalid or has expired.");
      }
    };
    
    if (token) {
      verify();
    }
  }, [token]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#F5F3EF',
      padding: '20px'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ 
          maxWidth: '500px', 
          width: '100%',
          backgroundColor: 'white', 
          border: '2px solid #1A1A1A', 
          borderRadius: '32px',
          padding: '40px',
          boxShadow: '8px 8px 0px #1A1A1A',
          textAlign: 'center'
        }}
      >
        {status === 'verifying' && (
          <div>
            <div className="spinner-border text-primary mb-4" role="status"></div>
            <h2 className="fw-bold">Verifying your email...</h2>
            <p className="text-muted">Please wait while we activate your account.</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="display-1 mb-4">✨</div>
            <h2 className="fw-bold mb-3">Email Verified!</h2>
            <p className="text-muted mb-5">Your account is now active. You can sign in and start your learning journey.</p>
            <Link to="/login" className="btn btn-dark px-5 py-3 w-100" style={{ borderRadius: '100px', fontWeight: 700 }}>
              Sign In &rarr;
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="display-1 mb-4">❌</div>
            <h2 className="fw-bold mb-3">Verification Failed</h2>
            <p className="text-muted mb-4">{errorMsg}</p>
            <Link to="/register" className="btn btn-outline-dark px-5 py-3 w-100 mb-3" style={{ borderRadius: '100px', fontWeight: 700 }}>
              Try Registering Again
            </Link>
            <Link to="/login" className="text-primary fw-bold text-decoration-none small">
              Back to Login
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
