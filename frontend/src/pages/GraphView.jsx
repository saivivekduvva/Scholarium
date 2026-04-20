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
    Promise.all([
      api.getGraph(goalId),
      api.getProgress(1) // user ID is ignored by backend JWT but required in URL
    ])
      .then(([graphRes, progressRes]) => {
        const rawGraph = graphRes.data;
        const progress = progressRes.data;
        
        // Build map of skill_name -> proficiency
        const cpMap = {};
        if (progress.checkpoints) {
          progress.checkpoints.forEach(cp => {
            cpMap[cp.skill_name] = cp.proficiency;
          });
        }

        // Build adjacency map
        const prereqs = {}; 
        rawGraph.nodes.forEach(n => prereqs[n.id] = []);
        rawGraph.edges.forEach(e => {
          if (!prereqs[e.target]) prereqs[e.target] = [];
          prereqs[e.target].push(e.source);
        });

        const nodesById = {};
        rawGraph.nodes.forEach(n => nodesById[n.id] = n);

        const computedNodes = rawGraph.nodes.map(node => {
          const prof = cpMap[node.data.label] || 0;
          let status = 'locked';
          
          if (prof >= 80) {
            status = 'done';
          } else {
            const reqs = prereqs[node.id];
            if (reqs.length === 0) {
              status = 'active'; 
            } else {
              const allDone = reqs.every(reqId => {
                const reqNode = nodesById[reqId];
                const reqProf = cpMap[reqNode.data.label] || 0;
                return reqProf >= 80;
              });
              status = allDone ? 'active' : 'locked';
            }
          }

          return {
            ...node,
            data: { ...node.data, status, progress: prof }
          };
        });

        setGraphData({ nodes: computedNodes, edges: rawGraph.edges });
      })
      .catch(err => {
        console.error(err);
        setGraphData({ error: true });
      });
  }, [goalId]);

  const handleNodeClick = (node) => {
    if (node.data.status === 'locked') {
      alert("This skill is locked. Complete its prerequisites first!");
      return;
    }
    setSelectedNode(node);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      style={{ position: 'relative' }}
    >
      {graphData ? (
        graphData.error ? (
          <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: 'calc(100vh - 64px)' }}>
            <h3 style={{ color: 'var(--accent-danger)', fontFamily: 'Outfit' }}>Failed to generate graph</h3>
            <p className="text-muted text-center" style={{ maxWidth: '400px' }}>
              The AI may have been rate-limited or encountered an error while mapping your skills. Please try deleting this goal and creating it again later.
            </p>
          </div>
        ) : (
          <SkillGraph 
            initialNodes={graphData.nodes} 
            initialEdges={graphData.edges} 
            onNodeClick={handleNodeClick} 
          />
        )
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
