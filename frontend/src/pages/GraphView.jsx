import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SkillGraph from '../components/SkillGraph';
import NodeDetail from '../components/NodeDetail';
import api from '../services/api';
import { IoRocketOutline } from 'react-icons/io5';

const GraphView = () => {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const [graphData, setGraphData] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const selectedNode = graphData?.nodes?.find(n => n.id === selectedNodeId);

  const computeNodeStatuses = (rawNodes, rawEdges, checkpoints) => {
    const cpMap = {};
    if (checkpoints) {
      checkpoints.forEach(cp => {
        cpMap[cp.skill_name] = cp.proficiency;
      });
    }

    const prereqs = {}; 
    rawNodes.forEach(n => prereqs[String(n.id)] = []);
    rawEdges.forEach(e => {
      const target = String(e.target);
      const source = String(e.source);
      if (!prereqs[target]) prereqs[target] = [];
      prereqs[target].push(source);
    });

    const nodesById = {};
    rawNodes.forEach(n => nodesById[String(n.id)] = n);

    // Initial pass to set basic status/progress
    const initialComputed = rawNodes.map(node => {
      const prof = cpMap[node.data.label] || 0;
      return {
        ...node,
        data: { ...node.data, progress: prof, status: prof >= 100 ? 'done' : 'locked' }
      };
    });

    const finalNodesById = {};
    initialComputed.forEach(n => finalNodesById[String(n.id)] = n);

    // Final pass to handle 'active' vs 'locked'
    return initialComputed.map(node => {
      if (node.data.status === 'done') return node;

      const reqs = prereqs[String(node.id)] || [];
      if (reqs.length === 0) {
        return { ...node, data: { ...node.data, status: 'active' } };
      }

      const allDone = reqs.every(reqId => {
        const reqNode = finalNodesById[reqId];
        return reqNode?.data?.status === 'done';
      });

      return { ...node, data: { ...node.data, status: allDone ? 'active' : 'locked' } };
    });
  };

  useEffect(() => {
    Promise.all([
      api.getGraph(goalId),
      api.getProfile().then(userRes => api.getProgress(userRes.data.id)).catch(err => {
        console.error("Progress fetch failed, falling back to empty:", err);
        return { data: { checkpoints: [] } };
      })
    ])
      .then(([graphRes, progressRes]) => {
        const rawGraph = graphRes.data;
        const progress = progressRes.data;
        
        const computedNodes = computeNodeStatuses(rawGraph.nodes, rawGraph.edges, progress.checkpoints);
        setGraphData({ nodes: computedNodes, edges: rawGraph.edges });
      })
      .catch(err => {
        console.error(err);
        setGraphData({ error: true });
      });
  }, [goalId]);

  useEffect(() => {
    if (!graphData || !graphData.nodes || graphData.error) return;

    const allDone = graphData.nodes.every(n => n.data.status === 'done');
    if (allDone && graphData.nodes.length > 0) {
      setTimeout(() => {
        navigate(`/goal-completed/${goalId}`);
      }, 1500);
    }
  }, [graphData, goalId, navigate]);

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
 
  const handleNextSkill = () => {
    if (!graphData || !graphData.nodes) return;
    const nextNode = graphData.nodes.find(n => n.data.status === 'active' && n.id !== selectedNodeId);
    if (nextNode) {
      setSelectedNodeId(nextNode.id);
    } else {
      setSelectedNodeId(null);
    }
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
      
      // Update the checkpoints locally to simulate a fresh fetch
      const currentNodes = prev.nodes.map(node => {
        if (node.data.label === skillName) {
          return { ...node, data: { ...node.data, progress: newProgress } };
        }
        return node;
      });

      const checkpoints = currentNodes.map(n => ({
        skill_name: n.data.label,
        proficiency: n.data.progress
      }));

      const newNodes = computeNodeStatuses(currentNodes, prev.edges, checkpoints);
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
            goalId={goalId}
            onClose={() => setSelectedNodeId(null)} 
            onUpdate={updateNodeProgress}
            onNext={handleNextSkill}
          />
        )}
      </AnimatePresence>
      
      <motion.button 
        whileHover={{ scale: 1.05, x: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.history.back()}
        className="btn btn-sm"
        style={{
          position: 'absolute', top: '24px', left: '24px', zIndex: 100,
          background: 'var(--bg-surface)', color: 'var(--text-primary)',
          border: '3px solid var(--border)', borderRadius: '12px',
          padding: '10px 20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '4px 4px 0px var(--border)', cursor: 'pointer'
        }}
      >
        <span>&larr;</span> Back to Dashboard
      </motion.button>

    </motion.div>
  );
};

export default GraphView;
