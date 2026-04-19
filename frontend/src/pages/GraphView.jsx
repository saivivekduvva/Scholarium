import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SkillGraph from '../components/SkillGraph';
import NodeDetail from '../components/NodeDetail';
import api from '../services/api';

const GraphView = () => {
  const { goalId } = useParams();
  const [graphData, setGraphData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    // Mock fetch if real backend is not running, but we try api first
    api.getGraph(goalId)
      .then(res => setGraphData(res.data))
      .catch(err => {
        console.error(err);
        // Fallback mock data for UI demonstration
        setGraphData({
          nodes: [
            { id: '1', position: { x: 250, y: 0 }, data: { label: 'Python Basics', description: 'Syntax, loops, functions', status: 'done', progress: 100 } },
            { id: '2', position: { x: 100, y: 150 }, data: { label: 'Django Models', description: 'ORM, migrations', status: 'active', progress: 40 } },
            { id: '3', position: { x: 400, y: 150 }, data: { label: 'REST APIs', description: 'DRF, endpoints', status: 'locked', progress: 0 } },
          ],
          edges: [
            { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: 'var(--accent-primary)', strokeWidth: 2 } },
            { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#ccc', strokeWidth: 2 } },
          ]
        });
      });
  }, [goalId]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      style={{ position: 'relative' }}
    >
      {graphData ? (
        <SkillGraph 
          initialNodes={graphData.nodes} 
          initialEdges={graphData.edges} 
          onNodeClick={(node) => setSelectedNode(node)} 
        />
      ) : (
        <div className="d-flex justify-content-center align-items-center" style={{ height: 'calc(100vh - 64px)' }}>
          <div className="spinner-border" style={{ color: 'var(--accent-primary)' }} />
        </div>
      )}

      <AnimatePresence>
        {selectedNode && (
          <NodeDetail 
            node={selectedNode} 
            onClose={() => setSelectedNode(null)} 
          />
        )}
      </AnimatePresence>
      
      {/* Path Builder Floating Toolbar */}
      <div 
        style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: 'var(--bg-surface)', padding: '12px 24px', borderRadius: '30px',
          boxShadow: 'var(--shadow-card)', display: 'flex', alignItems: 'center', gap: '16px',
          border: '1px solid var(--border)', zIndex: 10
        }}
      >
        <span style={{ fontWeight: 600 }}>Build Your Path</span>
        <button className="btn btn-sm btn-outline-secondary" style={{ borderRadius: '16px' }}>Auto-Sequence</button>
        <button className="btn btn-sm" style={{ backgroundColor: 'var(--accent-primary)', color: 'white', borderRadius: '16px' }}>Start Learning &rarr;</button>
      </div>
    </motion.div>
  );
};

export default GraphView;
