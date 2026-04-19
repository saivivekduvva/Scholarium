import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const GoalInput = () => {
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!goal.trim()) return;
    
    setLoading(true);
    try {
      // Mock user_id = 1 for MVP
      const response = await api.createGoal({ title: goal, description: '', user_id: 1 });
      const goalId = response.data.goal.id;
      navigate(`/graph/${goalId}`);
    } catch (error) {
      console.error(error);
      setLoading(false);
      // Let api.js interceptor handle the 500 error redirect
    }
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="text-center py-5"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{
            width: '60px', height: '60px', 
            border: '4px solid var(--border)', 
            borderTop: '4px solid var(--accent-primary)', 
            borderRadius: '50%', margin: '0 auto 20px'
          }}
        />
        <h3 style={{ color: 'var(--accent-primary)' }}>Scholarium is thinking...</h3>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-100">
      <textarea
        className="form-control"
        style={{ 
          minHeight: '100px', 
          borderRadius: '16px', 
          padding: '20px', 
          fontSize: '18px',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--border)'
        }}
        placeholder="e.g. Become a backend engineer"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
      />
      <div className="text-end mt-3">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn btn-lg" 
          style={{ backgroundColor: 'var(--accent-primary)', color: 'white', borderRadius: '8px' }}
          type="submit"
        >
          Map My Skills &rarr;
        </motion.button>
      </div>
    </form>
  );
};

export default GoalInput;
