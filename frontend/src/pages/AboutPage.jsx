import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AboutPage = () => {
  const { user } = useContext(AuthContext);

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100%', 
      backgroundColor: 'var(--bg-page)',
      backgroundImage: 'var(--gradient-bg)',
      backgroundSize: '24px 24px',
      color: 'var(--text-primary)',
      fontFamily: 'Inter, sans-serif',
      position: 'relative',
      paddingBottom: '50px',
      paddingTop: '0' // Handled by main-content-wrapper in App.jsx
    }}>

      <div className="container" style={{ paddingTop: '5vh', maxWidth: '800px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 style={{ fontWeight: 900, fontSize: '56px', marginBottom: '10px', letterSpacing: '-2px' }}>About Us</h1>
          <p style={{ fontSize: '24px', fontWeight: 600, color: 'var(--accent-secondary)', marginBottom: '48px' }}>AI-driven mastery, not memorization</p>

          <section className="mb-5">
            <h3 style={{ fontWeight: 800, marginBottom: '16px' }}>Who We Are</h3>
            <div style={{ fontSize: '18px', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
              Scholarium is an AI-powered learning platform built to solve a simple but frustrating problem: most learners don't know what to learn next, and have no reliable way to verify they've truly understood something. We built Scholarium to change that — with structured roadmaps and real mastery checks.
            </div>
          </section>

          <section className="mb-5">
            <h3 style={{ fontWeight: 800, marginBottom: '16px' }}>Our Mission</h3>
            <div style={{ fontSize: '18px', lineHeight: '1.7', color: '#333' }}>
              We believe learning should be structured, honest, and effective. Scholarium uses Gemini AI to turn any goal into a step-by-step skill roadmap. Every module requires a perfect score before moving on — no skipping, no shortcuts, just real understanding.
            </div>
          </section>

          <section className="mb-5">
            <h3 style={{ fontWeight: 800, marginBottom: '24px' }}>The Team</h3>
            <div className="row g-4">
              <div className="col-md-6">
                <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '24px', border: '3px solid var(--border)', boxShadow: '6px 6px 0px var(--border)' }}>
                  <h5 style={{ fontWeight: 900, marginBottom: '4px' }}>Duvva Sai Vivek</h5>
                  <p className="m-0 fw-bold text-muted" style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Founder</p>
                </div>
              </div>
              <div className="col-md-6">
                <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '24px', border: '3px solid var(--border)', boxShadow: '6px 6px 0px var(--border)' }}>
                  <h5 style={{ fontWeight: 900, marginBottom: '4px' }}>Mokshagna BC</h5>
                  <p className="m-0 fw-bold text-muted" style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Co-Founder</p>
                </div>
              </div>
            </div>
          </section>

          <div className="text-center mt-5 pt-4">
            <Link to="/login" className="btn btn-dark px-5 py-3" style={{ borderRadius: '100px', fontWeight: 700, fontSize: '18px' }}>
              Back to Scholarium &rarr;
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;
