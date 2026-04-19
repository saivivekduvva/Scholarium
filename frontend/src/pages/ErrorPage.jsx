import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ErrorPage = () => {
  return (
    <motion.div 
      className="container text-center py-5 mt-5"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ fontSize: '80px', marginBottom: '20px' }}
      >
        😵‍💫 💥 🤖
      </motion.div>
      <h1 style={{ color: 'var(--accent-danger)' }}>Oh no! The AI Brain is Fried!</h1>
      <p className="lead mt-3" style={{ color: 'var(--text-secondary)' }}>
        Our servers are currently overwhelmed and thinking too hard.<br/>
        Please give Scholarium a moment to cool down and try again later.
      </p>
      <Link to="/" className="btn btn-lg mt-4" style={{ backgroundColor: 'var(--accent-primary)', color: 'white', borderRadius: '8px' }}>
        Take me home
      </Link>
    </motion.div>
  );
};

export default ErrorPage;
