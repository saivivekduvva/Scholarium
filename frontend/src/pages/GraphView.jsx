import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SkillGraph from '../components/SkillGraph';
import NodeDetail from '../components/NodeDetail';
import api from '../services/api';
const GraphView = () => {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const [graphData, setGraphData] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [quizStatus, setQuizStatus] = useState({ can_take_quiz: false, completed_subtopics_count: 0 });

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
        
        // Fetch quiz status
        api.getQuizStatus(goalId).then(res => setQuizStatus(res.data)).catch(err => console.error(err));
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
          <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: 'calc(100vh - var(--header-height, 0px))' }}>
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
        <div className="d-flex justify-content-center align-items-center" style={{ height: 'calc(100vh - var(--header-height, 0px))' }}>
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
        onClick={() => navigate('/roadmaps')}
        className="btn"
        style={{
          position: 'absolute', top: '24px', left: '24px', zIndex: 100,
          background: 'var(--bg-surface)', color: 'var(--text-primary)',
          border: '1px solid var(--border)', borderRadius: '12px',
          padding: '12px 24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: 'var(--shadow-md)', cursor: 'pointer'
        }}
      >
        <IoArrowBack /> Back
      </motion.button>

      <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 100, display: 'flex', gap: '12px' }}>
        {quizStatus?.can_take_quiz && (
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/quiz/${goalId}`)}
            className="btn"
            style={{
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', 
              color: 'white',
              border: 'none', borderRadius: '12px',
              padding: '12px 28px', fontWeight: 700,
              boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)', cursor: 'pointer'
            }}
          >
            Take Quiz ({quizStatus?.completed_subtopics_count || 0})
          </motion.button>
        )}
        
        <motion.button 
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(`/analytics/${goalId}`)}
          className="btn"
          style={{
            background: 'var(--bg-surface)', color: 'var(--text-primary)',
            border: '1px solid var(--border)', borderRadius: '12px',
            padding: '12px 28px', fontWeight: 700,
            boxShadow: 'var(--shadow-md)', cursor: 'pointer'
          }}
        >
          Analytics
        </motion.button>
      </div>

    </motion.div>
  );
};

export default GraphView;
