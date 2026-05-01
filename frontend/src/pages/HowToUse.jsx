import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { IoRocketOutline, IoMapOutline, IoLibraryOutline, IoRibbonOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';

const HowToUse = () => {
  const { user } = useContext(AuthContext);
  const steps = [
    {
      title: "1. Sign In",
      description: "Go to the Scholarium homepage. New user? Click Join now to register. Returning user? Enter your username and password, then click Sign In.",
      icon: <IoRocketOutline size={40} />,
      color: "#4F6EF7"
    },
    {
      title: "2. Generate a Roadmap",
      description: "Click Roadmaps in the top navigation bar. Type your learning goal (e.g. 'Become a Backend Engineer'). The AI will build a visual skill roadmap for you in seconds.",
      icon: <IoMapOutline size={40} />,
      color: "#F7C35C"
    },
    {
      title: "3. Navigate the Roadmap",
      description: "Your current skill is shown at the top — click it to start. Locked nodes have a padlock icon. Complete the current skill to unlock them. Use zoom and minimap to explore.",
      icon: <IoCheckmarkCircleOutline size={40} />,
      color: "#06C9A0"
    },
    {
      title: "4. Learn a Skill",
      description: "Click an unlocked node to open subtopics. Read content sourced from high-quality platforms like Wikipedia and GeeksforGeeks. Use resource links for deeper reading.",
      icon: <IoLibraryOutline size={40} />,
      color: "#9D7BFF"
    },
    {
      title: "5. Mastery Quiz",
      description: "Answer all 4 MCQs. You must score 100% to unlock the next skill. If you don't pass, click Retry — the AI generates fresh questions every time.",
      icon: <IoRibbonOutline size={40} />,
      color: "#F75C5C"
    },
    {
      title: "6. Contact & Help",
      description: "Click About in the navigation bar to find us. Phone: +91 80197 92969 | Email: saivivekduvva@gmail.com. We're here to help you master your goals!",
      icon: <IoRibbonOutline size={40} />,
      color: "#1A1A1A"
    }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100%', 
      backgroundColor: '#F5F3EF',
      backgroundImage: 'radial-gradient(#00000010 1px, transparent 0)',
      backgroundSize: '24px 24px',
      color: '#1A1A1A',
      fontFamily: 'Inter, sans-serif',
      paddingBottom: '100px',
      paddingTop: user ? '80px' : '0'
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
      <div className="container" style={{ maxWidth: '1000px', paddingTop: '5vh' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-5 pb-5"
        >
          <h1 style={{ fontWeight: 900, fontSize: 'clamp(40px, 8vw, 72px)', letterSpacing: '-3px', marginBottom: '20px' }}>
            Master Any Skill.
          </h1>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#4F6EF7', maxWidth: '700px', margin: '0 auto' }}>
            A step-by-step guide to achieving mastery with Scholarium's AI-driven platform.
          </p>
        </motion.div>

        <div className="row g-5">
          {steps.map((step, index) => (
            <div key={index} className="col-md-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                style={{ 
                  background: 'white', 
                  padding: '40px', 
                  borderRadius: '32px', 
                  border: '3px solid #1A1A1A', 
                  boxShadow: '10px 10px 0px #1A1A1A',
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ 
                  position: 'absolute', top: '-10px', right: '-10px', 
                  fontSize: '120px', fontWeight: 900, opacity: 0.05, 
                  color: step.color, zIndex: 0 
                }}>
                  {index + 1}
                </div>
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ 
                    width: '80px', height: '80px', borderRadius: '24px', 
                    background: step.color + '15', color: step.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '24px', border: `2px solid ${step.color}`
                  }}>
                    {step.icon}
                  </div>
                  <h3 style={{ fontWeight: 800, fontSize: '28px', marginBottom: '16px' }}>{step.title}</h3>
                  <p style={{ fontSize: '18px', lineHeight: '1.6', color: '#444', marginBottom: 0 }}>
                    {step.description}
                  </p>
                </div>
              </motion.div>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-5 pt-5 text-center"
        >
          <div style={{ 
            background: '#1A1A1A', color: 'white', padding: '50px', borderRadius: '32px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontWeight: 800, marginBottom: '20px' }}>Ready to start?</h2>
            <p style={{ fontSize: '18px', opacity: 0.8, marginBottom: '40px' }}>Join thousands of learners building their future, one roadmap at a time.</p>
            <Link to="/login" className="btn btn-light btn-lg px-5 py-3" style={{ borderRadius: '100px', fontWeight: 800 }}>
              Create Your First Roadmap &rarr;
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HowToUse;
