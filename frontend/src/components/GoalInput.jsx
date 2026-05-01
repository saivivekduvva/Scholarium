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
      const response = await api.createGoal({ title: goal, description: '' });
      const goalId = response.data.goal.id;
      const isDuplicate = response.data.is_duplicate;
      
      if (isDuplicate) {
        navigate(`/graph/${goalId}`);
      } else {
        navigate(`/graph/${goalId}`);
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error || "Failed to generate roadmap. Please try again.";
      alert(msg);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border mb-3" style={{ color: 'var(--accent-primary)' }} />
        <p className="text-muted">Building your personalized study path...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-100">
      <motion.textarea
        whileFocus={{ scale: 1.01, borderColor: 'var(--accent-primary)' }}
        className="form-control"
        style={{ 
          minHeight: '100px', 
          borderRadius: '16px', 
          padding: '20px', 
          fontSize: '18px',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--border)',
          transition: 'border-color 0.2s ease'
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
