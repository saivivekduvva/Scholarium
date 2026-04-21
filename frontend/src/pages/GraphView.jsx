import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SkillGraph from '../components/SkillGraph';
import NodeDetail from '../components/NodeDetail';
import api from '../services/api';
import { IoRocketOutline } from 'react-icons/io5';

const GraphView = () => {
  const { goalId } = useParams();
  const [graphData, setGraphData] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const selectedNode = graphData?.nodes?.find(n => n.id === selectedNodeId);

  useEffect(() => {
    Promise.all([
      api.getGraph(goalId),
      api.getProgress(1)
    ])
      .then(([graphRes, progressRes]) => {
        const rawGraph = graphRes.data;
        const progress = progressRes.data;
        
        const cpMap = {};
        if (progress.checkpoints) {
          progress.checkpoints.forEach(cp => {
            cpMap[cp.skill_name] = cp.proficiency;
          });
        }

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

  const handleAutoSequence = () => {
    if (!graphData || !graphData.nodes) return;
    const orderedIds = graphData.nodes.map(n => n.id);
    api.savePath(goalId, orderedIds)
      .then(() => alert("Path auto-sequenced and saved!"))
      .catch(err => console.error(err));
  };

  const handleNodeClick = (node) => {
    if (node.data.status === 'locked') {
      alert("This skill is locked. Complete its prerequisites first!");
      return;
    }
    setSelectedNodeId(node.id);
  };

  const handleStartLearning = () => {
    if (!graphData || !graphData.nodes) return;
    const activeNode = graphData.nodes.find(n => n.data.status === 'active');
    if (activeNode) {
      setSelectedNodeId(activeNode.id);
    } else {
      alert("No active skills available. You might have completed them all!");
    }
  };

  const updateNodeProgress = (skillName, newProgress) => {
    setGraphData(prev => {
      if (!prev) return prev;
      const newNodes = prev.nodes.map(node => {
        if (node.data.label === skillName) {
          const status = newProgress >= 80 ? 'done' : node.data.status;
          return { ...node, data: { ...node.data, progress: newProgress, status } };
        }
        return node;
      });
      return { ...prev, nodes: newNodes };
    });
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

      <AnimatePresence mode="wait">
        {selectedNodeId && selectedNode && (
          <NodeDetail 
            node={selectedNode} 
            onClose={() => setSelectedNodeId(null)} 
            onUpdate={updateNodeProgress}
          />
        )}
      </AnimatePresence>
      
      {/* Path Builder Floating Toolbar */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', damping: 20 }}
        className="floating-toolbar d-flex align-items-center gap-4 px-4 py-3"
        style={{
          position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
          borderRadius: '40px', zIndex: 100
        }}
      >
        <div className="d-flex align-items-center gap-2">
          <div className="p-2 rounded-circle" style={{ background: 'rgba(79, 110, 247, 0.1)', color: 'var(--accent-primary)' }}>
            <IoRocketOutline size={20} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>Mastery Path</span>
        </div>
        
        <div style={{ width: '1px', height: '24px', background: '#E2E8F0' }} />
        
        <div className="d-flex gap-2">
          <button 
            className="btn btn-sm btn-light px-3 py-2" 
            style={{ borderRadius: '20px', fontWeight: 700, fontSize: '13px', border: '1px solid #E2E8F0' }} 
            onClick={handleAutoSequence}
          >
            Auto-Sequence
          </button>
          <button 
            className="btn btn-sm px-4 py-2" 
            style={{ background: 'var(--accent-primary)', color: 'white', borderRadius: '20px', fontWeight: 700, fontSize: '13px', boxShadow: '0 4px 12px rgba(79, 110, 247, 0.2)' }} 
            onClick={handleStartLearning}
          >
            Start Learning &rarr;
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GraphView;
