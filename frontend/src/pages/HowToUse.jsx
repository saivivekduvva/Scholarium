import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { IoRocketOutline, IoMapOutline, IoLibraryOutline, IoRibbonOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';

const HowToUse = () => {
  const steps = [
    {
      title: "Define Your Goal",
      description: "Start by entering any learning objective, from 'Advanced Quantum Mechanics' to 'Baking Sourdough'. Scholarium's AI analyzes the topic and builds a foundational structure.",
      icon: <IoRocketOutline size={40} />,
      color: "#4F6EF7"
    },
    {
      title: "Master the Roadmap",
      description: "View your personalized Skill Graph (DAG). Skills are logically sequenced; foundational concepts unlock advanced ones as you progress. No more guessing what to learn next.",
      icon: <IoMapOutline size={40} />,
      color: "#F7C35C"
    },
    {
      title: "Learn with Precision",
      description: "Dive into specific subtopics. Scholarium prioritizes high-quality academic sources and provides AI-powered explanations and video tutorials for every module.",
      icon: <IoLibraryOutline size={40} />,
      color: "#06C9A0"
    },
    {
      title: "Verify Your Knowledge",
      description: "Complete adaptive assessments for every subtopic. To master a skill node, you must achieve 100% accuracy, ensuring you truly understand the material.",
      icon: <IoRibbonOutline size={40} />,
      color: "#F75C5C"
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
      paddingBottom: '100px'
    }}>
      <div className="container" style={{ maxWidth: '1000px', paddingTop: '80px' }}>
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
