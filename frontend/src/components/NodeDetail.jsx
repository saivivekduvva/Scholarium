import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { IoBookOutline, IoTimeOutline, IoCheckmarkCircle, IoRefreshOutline } from 'react-icons/io5';

const subtopicsCache = {};

const NodeDetail = ({ node, goalId, onClose, onUpdate, onNext }) => {
  const [subtopics, setSubtopics] = useState(null);
  const [xpEarned, setXpEarned] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  const skillName = node?.data?.label || node?.label || node?.id;

  const [errorMsg, setErrorMsg] = useState(null);

  const refreshSubtopics = () => {
    setIsRefreshing(true);
    setErrorMsg(null);
    api.expandSkill(goalId, skillName, true) // force=true
      .then(res => {
        subtopicsCache[skillName] = res.data.subtopics;
        setSubtopics(res.data.subtopics);
      })
      .catch(err => {
        console.error(err);
        const msg = err.response?.data?.error || "Failed to refresh curriculum. Please try again.";
        setErrorMsg(msg);
      })
      .finally(() => setIsRefreshing(false));
  };

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
      
      api.expandSkill(goalId, skillName)
        .then(res => {
          subtopicsCache[skillName] = res.data.subtopics;
          setSubtopics(res.data.subtopics);
        })
        .catch(err => {
          console.error(err);
          if (err.response && err.response.status === 429) {
            setErrorMsg("AI is thinking too fast! Please wait a moment before expanding more skills.");
          } else {
            const msg = err.response?.data?.error || "Failed to load subtopics. The AI might be taking a break.";
            setErrorMsg(msg);
          }
        });
    }
  }, [node, skillName]);

  const handleToggleSubtopic = (subtopic, index) => {
    if (!subtopic.id) return;
    
    setSubtopics(prev => {
      const updated = prev.map(st => 
        st.id === subtopic.id ? { ...st, is_studied: !st.is_studied } : st
      );
      subtopicsCache[skillName] = updated;
      return updated;
    });

    // Calculate new progress using the updated state logic
    if (subtopics) {
      const newSubtopics = subtopics.map(st => 
        st.id === subtopic.id ? { ...st, is_studied: !st.is_studied } : st
      );
      const completedCount = newSubtopics.filter(s => s.is_studied).length;
      const totalCount = newSubtopics.length;
      const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      
      // Notify parent to update graph
      if (onUpdate) {
        onUpdate(skillName, newProgress);
      }
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
        setSubtopics(prev => {
          const reverted = prev.map(st => 
            st.id === subtopic.id ? { ...st, is_studied: !st.is_studied } : st
          );
          subtopicsCache[skillName] = reverted;
          return reverted;
        });
        
        const totalCount = subtopics.length;
        const revertedProgress = totalCount > 0 ? Math.round((subtopics.filter(s => s.is_studied).length / totalCount) * 100) : 0;
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
        className="node-detail-modal"
        style={{
          position: 'fixed', left: 0, right: 0, margin: '0 auto', top: '5vh', bottom: '5vh',
          width: '92%', maxWidth: '800px',
          backgroundColor: 'var(--bg-surface)', boxShadow: '0 32px 80px rgba(0,0,0,0.2)',
          zIndex: 1001, padding: 'clamp(20px, 5vw, 40px)', overflowY: 'auto', borderRadius: '24px',
          border: '1px solid var(--border)', transition: 'background-color 0.3s ease, color 0.3s ease'
        }}
      >
        <button onClick={onClose} className="btn-close float-end" style={{ filter: 'var(--theme-invert)' }}></button>
        <h4 className="mb-1" style={{ fontFamily: 'Outfit', fontWeight: 700, color: 'var(--text-primary)' }}>Scholarium — {skillName}</h4>
        <span className="badge mb-4" style={{ backgroundColor: 'var(--accent-primary)' }}>{node.data.status || 'Active'}</span>
        
        {/* Removed Proficiency Bar as requested */}

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-end gap-3 mb-4 pb-3 border-bottom" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h5 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>Curriculum Flow</h5>
            <p className="text-muted small mb-0" style={{ color: 'var(--text-muted)' }}>Master each module to reach full proficiency</p>
          </div>
          <div className="d-flex flex-wrap align-items-center gap-2">
            <button 
              className={`btn btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-pill ${isRefreshing ? 'disabled' : ''}`}
              style={{ fontSize: '11px', fontWeight: 700, backgroundColor: 'var(--bg-page)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              onClick={refreshSubtopics}
            >
              <IoRefreshOutline className={isRefreshing ? 'spin' : ''} size={14} />
              {isRefreshing ? 'Refining...' : 'Refresh'}
            </button>
            <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fw-bold" style={{ fontSize: '12px', background: 'var(--border)', color: 'var(--accent-primary)' }}>
              {subtopics?.length || 0} Modules
            </span>
          </div>
        </div>

        {errorMsg ? (
          <div className="alert alert-warning border-0 shadow-sm rounded-4">{errorMsg}</div>
        ) : !subtopics ? (
          <div className="py-5 text-center">
            <div className="spinner-border text-primary mb-3" />
            <p className="text-muted" style={{ color: 'var(--text-muted)' }}>Analyzing curriculum structure...</p>
          </div>
        ) : (
          <div className="position-relative ps-4 ms-2">
            {/* Timeline Line */}
            <div 
              style={{ 
                position: 'absolute', left: '0', top: '10px', bottom: '10px', width: '2px', 
                background: 'var(--border)',
                borderRadius: '2px'
              }} 
            />

            <motion.div 
              className="d-flex flex-column gap-4"
              variants={{ animate: { transition: { staggerChildren: 0.1 } } }} 
              initial="initial" 
              animate="animate"
            >
              {subtopics.map((st, i) => {
                const isDone = st.is_studied || node.data.status === 'done';
                
                return (
                  <motion.div
                    key={st.id || i}
                    variants={{ 
                      initial: { opacity: 0, x: -20 }, 
                      animate: { opacity: 1, x: 0 } 
                    }}
                    className="position-relative"
                  >
                    {/* Timeline Node Icon */}
                    <div 
                      style={{ 
                        position: 'absolute', left: '-33px', top: '50%', transform: 'translateY(-50%)',
                        width: '20px', height: '20px', borderRadius: '50%',
                        backgroundColor: isDone ? '#06C9A0' : 'var(--bg-surface)',
                        border: `4px solid ${isDone ? 'rgba(6, 201, 160, 0.2)' : 'var(--border)'}`,
                        boxShadow: isDone ? '0 0 0 4px rgba(6, 201, 160, 0.1)' : 'none',
                        zIndex: 2, transition: 'all 0.3s ease'
                      }}
                    />

                    <motion.div
                      whileHover={{ scale: 1.01, x: 4 }}
                      onClick={() => handleToggleSubtopic(st, i)}
                      className="p-4"
                      style={{ 
                        backgroundColor: isDone ? 'rgba(6, 201, 160, 0.05)' : 'var(--bg-surface)', 
                        border: `1px solid ${isDone ? '#06C9A0' : 'var(--border)'}`,
                        borderRadius: '24px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div className="row align-items-center">
                        <div className="col-md-8">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="fw-bold" style={{ fontSize: '16px', color: 'var(--text-primary)' }}>{st.title}</span>
                            {isDone && <IoCheckmarkCircle className="text-success" size={18} />}
                          </div>
                          <p className="text-muted small mb-0 d-flex align-items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                            <IoTimeOutline size={14} /> {st.duration_mins} mins &bull; {st.description || 'Module ' + (i+1)}
                          </p>
                        </div>
                        <div className="col-md-4 text-md-end mt-3 mt-md-0">
                          <button 
                            className={`btn btn-sm px-4 py-2 rounded-pill fw-bold ${isDone ? 'btn-light' : 'btn-dark shadow-sm'}`} 
                            style={{ 
                              fontSize: '12px', 
                              backgroundColor: isDone ? 'var(--bg-page)' : 'var(--accent-primary)',
                              color: isDone ? 'var(--text-muted)' : '#FFFFFF',
                              border: isDone ? '1px solid var(--border)' : 'none'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/subtopic/${goalId}/${encodeURIComponent(skillName)}/${encodeURIComponent(st.title)}`);
                            }}
                          >
                            {isDone ? 'Review Module' : 'Launch Learning'} &rarr;
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        )}

        <div className="alert alert-info mt-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3" style={{ borderRadius: '16px', fontSize: '13px', backgroundColor: 'var(--border)', color: '#FFFFFF', border: 'none' }}>
          <div>
            💡 <strong>Pro Tip:</strong> Click on a subtopic to study it. You'll need to pass a quick assessment at the bottom of the page to mark it as mastered!
          </div>
          {currentProgress === 100 && onNext && (
            <button 
              onClick={onNext}
              className="btn btn-primary px-4 py-2 rounded-pill fw-bold shadow-sm"
              style={{ backgroundColor: 'var(--accent-secondary)', border: 'none', color: 'white', whiteSpace: 'nowrap' }}
            >
              Next Skill &rarr;
            </button>
          )}
        </div>

      </motion.div>
    </>
  );
};

export default NodeDetail;
