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

      {/* Removed Mastery Progress Bar as requested */}
      
      <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
    </motion.div>
  );
};

export default SkillNode;
