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
      api.getProgress(1).catch(err => {
        console.error("Progress fetch failed, falling back to empty:", err);
        return { data: { checkpoints: [] } };
      })
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
        rawGraph.nodes.forEach(n => prereqs[String(n.id)] = []);
        rawGraph.edges.forEach(e => {
          const target = String(e.target);
          const source = String(e.source);
          if (!prereqs[target]) prereqs[target] = [];
          prereqs[target].push(source);
        });

        const nodesById = {};
        rawGraph.nodes.forEach(n => nodesById[String(n.id)] = n);

        const computedNodes = rawGraph.nodes.map(node => {
          const prof = cpMap[node.data.label] || 0;
          let status = 'locked';
          
          if (prof >= 80) {
            status = 'done';
          } else {
            const reqs = prereqs[String(node.id)] || [];
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
      
      <button 
        onClick={() => window.history.back()}
        className="btn btn-sm"
        style={{
          position: 'absolute', top: '24px', left: '24px', zIndex: 100,
          background: 'var(--bg-surface)', color: 'var(--text-primary)',
          border: '3px solid var(--border)', borderRadius: '12px',
          padding: '10px 20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '4px 4px 0px var(--border)'
        }}
      >
        <span>&larr;</span> Back to Dashboard
      </button>

    </motion.div>
  );
};

export default GraphView;
