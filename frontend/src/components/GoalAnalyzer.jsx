import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const steps = [
  "NLP goal parsing",
  "Skill dependency graph",
  "Pre-req detection",
  "Timeline estimation"
];

const GoalAnalyzer = ({ goalTitle }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 1800); // Slightly faster

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="goal-analyzer-container"
    >
      <div className="analyzer-header">
        <h2 className="analyzer-title">Goal Analyzer</h2>
        <p className="analyzer-subtitle">Breaking "{goalTitle}" into skills...</p>
      </div>

      <div className="analyzer-steps">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`analyzer-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            >
              <div className="d-flex align-items-center w-100">
                <span className="me-3" style={{ width: '20px', display: 'flex', justifyContent: 'center' }}>
                  {isCompleted ? (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ color: 'var(--accent-secondary)' }}>●</motion.span>
                  ) : isActive ? (
                    <motion.div 
                      animate={{ scale: [0.8, 1.2, 0.8] }} 
                      transition={{ duration: 1.5, repeat: Infinity }} 
                      style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)' }} 
                    />
                  ) : (
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#E5E7EB' }} />
                  )}
                </span>
                <span>{step}</span>
                {isActive && (
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="ms-auto small text-muted"
                  >
                    Processing...
                  </motion.span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default GoalAnalyzer;
