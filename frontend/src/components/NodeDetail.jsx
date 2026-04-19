import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const subtopicsCache = {};

const NodeDetail = ({ node, onClose }) => {
  const [subtopics, setSubtopics] = useState(null);
  const navigate = useNavigate();

  const skillName = node?.data?.label || node?.label || node?.id;

  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
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

  if (!node) return null;

  return (
    <>
      <div 
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }} 
        onClick={onClose} 
      />
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          position: 'fixed', right: 0, top: '64px', bottom: 0, width: '360px',
          backgroundColor: 'var(--bg-surface)', boxShadow: '-4px 0 32px rgba(0,0,0,0.1)',
          zIndex: 1001, padding: '24px', overflowY: 'auto'
        }}
      >
        <button onClick={onClose} className="btn-close float-end"></button>
        <h4 className="mb-1" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>Scholarium — {skillName}</h4>
        <span className="badge mb-4" style={{ backgroundColor: 'var(--accent-primary)' }}>{node.data.status || 'Active'}</span>
        
        <div className="mb-4">
          <label className="form-label text-muted small">Proficiency</label>
          <div className="progress" style={{ height: '8px' }}>
            <div className="progress-bar" style={{ width: `${node.data.progress || 0}%`, backgroundColor: 'var(--accent-secondary)' }}></div>
          </div>
        </div>

        <h5 className="mb-3" style={{ fontFamily: 'Outfit', fontWeight: 600 }}>Subtopics</h5>
        {errorMsg ? (
          <div className="alert alert-warning" style={{ fontSize: '13px' }}>{errorMsg}</div>
        ) : !subtopics ? (
          <div className="skeleton" style={{ height: '80px', marginBottom: '12px' }} />
        ) : (
          <motion.div variants={{ animate: { transition: { staggerChildren: 0.06 } } }} initial="initial" animate="animate">
            {subtopics.map((st, i) => (
              <motion.div
                key={i}
                variants={{ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } }}
                whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                className="card mb-2 p-3 border-0"
                style={{ backgroundColor: 'var(--bg-page)', borderRadius: '12px' }}
              >
                <div className="fw-bold" style={{ fontSize: '14px' }}>{st.title}</div>
                <div className="small text-muted">{st.duration_mins} mins</div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <button 
          className="btn w-100 mt-4" 
          style={{ backgroundColor: 'var(--accent-primary)', color: 'white', borderRadius: '8px' }}
          onClick={() => navigate(`/session/${encodeURIComponent(skillName)}`)}
        >
          Practice This Skill &rarr;
        </button>
      </motion.div>
    </>
  );
};

export default NodeDetail;
