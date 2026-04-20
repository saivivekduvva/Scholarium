import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const XPToast = ({ xp, visible }) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: 1, y: -50, scale: 1.2 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            left: '50%',
            top: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            pointerEvents: 'none',
            color: '#06C9A0',
            fontSize: '32px',
            fontWeight: 'bold',
            textShadow: '0 4px 12px rgba(6, 201, 160, 0.3)'
          }}
        >
          +{xp} XP 🔥
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default XPToast;
