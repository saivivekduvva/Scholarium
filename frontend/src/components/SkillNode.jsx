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
        <ProgressRing radius={16} stroke={3} progress={progress} />
      </div>
      
      <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
    </motion.div>
  );
};

export default SkillNode;
