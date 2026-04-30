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
      backgroundColor: '#F5F3EF',
      backgroundImage: 'radial-gradient(#00000010 1px, transparent 0)',
      backgroundSize: '24px 24px',
      color: '#1A1A1A',
      fontFamily: 'Inter, sans-serif',
      position: 'relative',
      paddingBottom: '50px',
      paddingTop: user ? '80px' : '0' // Add padding if global navbar is present
    }}>
      {!user && (
        <nav className="d-flex justify-content-between align-items-center px-5 py-4">
          <Link to="/login" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontWeight: 900, fontSize: '24px', letterSpacing: '-1px' }}>Scholarium</div>
          </Link>
          <div className="d-none d-md-flex gap-5" style={{ fontSize: '15px', fontWeight: 500 }}>
            <Link to="/about" style={{ textDecoration: 'none', color: 'inherit' }}>About</Link>
            <Link to="/how-to-use" style={{ textDecoration: 'none', color: 'inherit' }}>How To Use</Link>
          </div>
          <Link to="/contact" className="btn btn-outline-dark px-4 py-2" style={{ borderRadius: '100px', fontWeight: 600, textDecoration: 'none' }}>Get in touch</Link>
        </nav>
      )}

      <div className="container" style={{ paddingTop: '5vh', maxWidth: '800px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 style={{ fontWeight: 900, fontSize: '48px', marginBottom: '10px' }}>About Scholarium</h1>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#4F6EF7', marginBottom: '40px' }}>AI-driven mastery, not memorization</p>

          <div style={{ fontSize: '18px', lineHeight: '1.6', marginBottom: '40px' }}>
            Scholarium transforms any learning goal into a personalized, gamified journey — powered by Gemini AI. Simply enter your goal, and get a structured skill roadmap designed to guide you step by step. Prove your mastery through adaptive quizzes that regenerate on every retry, ensuring true understanding instead of rote learning.
          </div>

          <h3 style={{ fontWeight: 800, marginBottom: '20px' }}>Key Highlights</h3>
          <div className="row g-4 mb-5">
            <div className="col-md-4">
              <div style={{ background: 'white', padding: '20px', borderRadius: '24px', border: '2px solid #1A1A1A', boxShadow: '4px 4px 0px #1A1A1A', height: '100%' }}>
                <h5 style={{ fontWeight: 800 }}>Dynamic Roadmaps</h5>
                <p className="small m-0">AI builds a skill DAG (Directed Acyclic Graph) tailored to any goal you enter.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div style={{ background: 'white', padding: '20px', borderRadius: '24px', border: '2px solid #1A1A1A', boxShadow: '4px 4px 0px #1A1A1A', height: '100%' }}>
                <h5 style={{ fontWeight: 800 }}>Rigorous Assessments</h5>
                <p className="small m-0">A perfect score (4/4) is required to master each module — no shortcuts.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div style={{ background: 'white', padding: '20px', borderRadius: '24px', border: '2px solid #1A1A1A', boxShadow: '4px 4px 0px #1A1A1A', height: '100%' }}>
                <h5 style={{ fontWeight: 800 }}>On-Demand Content</h5>
                <p className="small m-0">Content is generated only when needed, keeping learning efficient and focused.</p>
              </div>
            </div>
          </div>

          <h3 style={{ fontWeight: 800, marginBottom: '20px' }}>Platform Features</h3>
          <ul style={{ fontSize: '18px', paddingLeft: '20px', marginBottom: '40px' }}>
            <li className="mb-2">Skill graph per goal (DAG-based structure)</li>
            <li className="mb-2">100% mastery required per module</li>
            <li className="mb-2">Infinite fresh quiz sets on every retry</li>
            <li className="mb-2">Open-source under MIT License</li>
          </ul>

          <div style={{ 
            background: '#1A1A1A', 
            color: 'white', 
            padding: '30px', 
            borderRadius: '24px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '18px', fontWeight: 600, marginBottom: '0' }}>
              Built with React, Django, Gemini AI & PostgreSQL
            </p>
          </div>

          <div className="text-center mt-5">
            <Link to="/login" className="btn btn-dark px-5 py-3" style={{ borderRadius: '100px', fontWeight: 700 }}>
              Back to Scholarium &rarr;
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;
