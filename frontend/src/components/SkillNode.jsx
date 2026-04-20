import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import ProgressRing from './ProgressRing';

const SkillNode = ({ data, selected }) => {
  const status = data.status || 'locked';
  const progress = data.progress || 0;
  
  return (
    <motion.div
      whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(79,110,247,0.22)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`custom-node node-${status}`}
      style={selected ? { border: '2px solid var(--accent-primary)', backgroundColor: 'rgba(79,110,247,0.06)' } : {}}
    >
      <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />
      
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <div className="title">{data.label}</div>
          <div className="desc text-truncate" style={{ maxWidth: '140px' }}>{data.description}</div>
        </div>
        {status === 'done' ? (
          <div style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'var(--accent-secondary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
        ) : status === 'locked' ? (
          <div style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#E5E7EB', color: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
        ) : (
          <ProgressRing radius={16} stroke={3} progress={progress} />
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
    </motion.div>
  );
};

export default SkillNode;
