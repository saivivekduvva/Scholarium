import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import { IoLockClosedOutline, IoCheckmarkCircle, IoPlayCircleOutline } from 'react-icons/io5';

const SkillNode = ({ data, selected }) => {
  const status = data.status || 'locked';
  const progress = data.progress || 0;
  
  // Icon based on status
  const getIcon = () => {
    if (status === 'done') return <IoCheckmarkCircle className="text-success" size={20} />;
    if (status === 'active') return <IoPlayCircleOutline className="text-primary" size={20} />;
    return <IoLockClosedOutline size={20} style={{ color: '#94a3b8' }} />;
  };

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
      className={`custom-node node-${status}`}
      style={selected ? { borderColor: 'var(--accent-primary)', ring: '4px var(--accent-primary)' } : {}}
    >
      <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />
      
      <div className="d-flex align-items-center gap-2 mb-2">
        {getIcon()}
        <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: status === 'active' ? 'var(--accent-primary)' : '#64748B' }}>
          {status === 'active' ? 'Current Skill' : status}
        </span>
      </div>

      <div className="node-title mb-1">{data.label}</div>
      <div className="node-desc text-truncate-2 mb-3" style={{ height: '34px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {data.description || 'Master this fundamental concept to progress.'}
      </div>

      {/* Mastery Progress Bar */}
      <div className="w-100 mt-2">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8' }}>MASTERY</span>
          <span style={{ fontSize: '10px', fontWeight: 800, color: status === 'done' ? 'var(--accent-secondary)' : 'var(--accent-primary)' }}>{progress}%</span>
        </div>
        <div className="progress" style={{ height: '6px', borderRadius: '3px', backgroundColor: '#f1f5f9' }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={`progress-bar ${status === 'done' ? 'bg-success' : 'bg-primary'}`}
            style={{ borderRadius: '3px' }}
          />
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
    </motion.div>
  );
};

export default SkillNode;
