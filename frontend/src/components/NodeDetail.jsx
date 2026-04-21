import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import XPToast from './XPToast';

const subtopicsCache = {};

const NodeDetail = ({ node, onClose, onUpdate }) => {
  const [subtopics, setSubtopics] = useState(null);
  const [xpEarned, setXpEarned] = useState(null);
  const navigate = useNavigate();

  const skillName = node?.data?.label || node?.label || node?.id;

  const [errorMsg, setErrorMsg] = useState(null);

  const currentProgress = subtopics 
    ? Math.round((subtopics.filter(s => s.is_studied).length / subtopics.length) * 100) 
    : (node.data.progress || 0);

  useEffect(() => {
    // ... rest of useEffect ...
    if (node && skillName) {
      if (subtopicsCache[skillName]) {
        setSubtopics(subtopicsCache[skillName]);
        setErrorMsg(null);
        return;
      }
      
      setSubtopics(null);
      setErrorMsg(null);
      
      api.expandSkill(1, skillName) // mocked ID
        .then(res => {
          subtopicsCache[skillName] = res.data.subtopics;
          setSubtopics(res.data.subtopics);
        })
        .catch(err => {
          console.error(err);
          if (err.response && err.response.status === 429) {
            setErrorMsg("AI is thinking too fast! Please wait a moment before expanding more skills.");
          } else {
            setErrorMsg("Failed to load subtopics. The AI might be taking a break.");
          }
        });
    }
  }, [node, skillName]);

  const handleToggleSubtopic = (subtopic, index) => {
    if (!subtopic.id) return;
    
    const newSubtopics = [...subtopics];
    newSubtopics[index].is_studied = !newSubtopics[index].is_studied;
    setSubtopics(newSubtopics);
    subtopicsCache[skillName] = newSubtopics;

    // Calculate new progress
    const completedCount = newSubtopics.filter(s => s.is_studied).length;
    const totalCount = newSubtopics.length;
    const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    // Notify parent to update graph
    if (onUpdate) {
      onUpdate(skillName, newProgress);
    }

    api.toggleSubtopic(subtopic.id)
      .then(res => {
        if (res.data.xp_earned > 0) {
          setXpEarned(res.data.xp_earned);
          setTimeout(() => setXpEarned(null), 2000);
        }
      })
      .catch(err => {
        console.error("Failed to toggle subtopic", err);
        const reverted = [...subtopics];
        reverted[index].is_studied = !reverted[index].is_studied;
        setSubtopics(reverted);
        subtopicsCache[skillName] = reverted;
        
        const revertedProgress = totalCount > 0 ? Math.round((reverted.filter(s => s.is_studied).length / totalCount) * 100) : 0;
        if (onUpdate) onUpdate(skillName, revertedProgress);
      });
  };

  if (!node) return null;

  return (
    <>
      <div 
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }} 
        onClick={onClose} 
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{
          position: 'fixed', left: '10%', right: '10%', top: '5vh', bottom: '5vh',
          backgroundColor: 'var(--bg-surface)', boxShadow: '0 32px 80px rgba(0,0,0,0.2)',
          zIndex: 1001, padding: '40px', overflowY: 'auto', borderRadius: '24px'
        }}
      >
        <button onClick={onClose} className="btn-close float-end"></button>
        <h4 className="mb-1" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>Scholarium — {skillName}</h4>
        <span className="badge mb-4" style={{ backgroundColor: 'var(--accent-primary)' }}>{node.data.status || 'Active'}</span>
        
        <div className="mb-4">
          <label className="form-label text-muted small">Proficiency</label>
          <div className="progress" style={{ height: '8px' }}>
            <div className="progress-bar" style={{ width: `${currentProgress}%`, backgroundColor: 'var(--accent-secondary)' }}></div>
          </div>
          <div className="text-end small text-muted mt-1 fw-bold">{currentProgress}% Mastery</div>
        </div>

        <h5 className="mb-3" style={{ fontFamily: 'Outfit', fontWeight: 600 }}>Subtopics</h5>
        {errorMsg ? (
          <div className="alert alert-warning" style={{ fontSize: '13px' }}>{errorMsg}</div>
        ) : !subtopics ? (
          <div className="skeleton" style={{ height: '80px', marginBottom: '12px' }} />
        ) : (
          <motion.div variants={{ animate: { transition: { staggerChildren: 0.06 } } }} initial="initial" animate="animate">
            {subtopics.map((st, i) => {
              const isDone = st.is_studied || node.data.status === 'done';
              
              return (
                <motion.div
                  key={st.id || i}
                  variants={{ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } }}
                  whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  className="card mb-2 p-3 d-flex flex-column"
                  style={{ 
                    backgroundColor: isDone ? 'rgba(6, 201, 160, 0.05)' : 'var(--bg-page)', 
                    border: isDone ? '1px solid var(--accent-secondary)' : '1px solid transparent',
                    borderRadius: '12px',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleToggleSubtopic(st, i)}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div 
                      className="checkbox-custom"
                      style={{ 
                        width: '20px', 
                        height: '20px', 
                        borderRadius: '4px', 
                        border: isDone ? 'none' : '2px solid var(--border)',
                        backgroundColor: isDone ? 'var(--accent-secondary)' : 'transparent',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'white'
                      }}
                    >
                      {isDone && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                    </div>
                    <div>
                      <div className="fw-bold" style={{ fontSize: '14px', color: isDone ? 'var(--text-primary)' : 'inherit', opacity: isDone ? 0.7 : 1, textDecoration: isDone ? 'line-through' : 'none' }}>{st.title}</div>
                      <div className="small text-muted">{st.duration_mins} mins</div>
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <button 
                      className="btn btn-sm btn-outline-primary rounded-pill px-4" 
                      style={{ fontSize: '12px', fontWeight: 700 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/subtopic/${encodeURIComponent(skillName)}/${encodeURIComponent(st.title)}`);
                      }}
                    >
                      {isDone ? 'Review Content' : 'Start Learning'} &rarr;
                    </button>
                    {isDone && (
                      <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill" style={{ fontSize: '11px' }}>
                        MASTERED
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        <div className="alert alert-info mt-4" style={{ borderRadius: '16px', fontSize: '13px' }}>
          💡 <strong>Pro Tip:</strong> Click on a subtopic to study it. You'll need to pass a quick assessment at the bottom of the page to mark it as mastered!
        </div>
        <XPToast xp={xpEarned} visible={!!xpEarned} />
      </motion.div>
    </>
  );
};

export default NodeDetail;
