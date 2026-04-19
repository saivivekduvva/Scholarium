import React, { useEffect } from 'react';
import { ReactFlow, Background, MiniMap, Controls, useNodesState, useEdgesState } from '@xyflow/react';
import SkillNode from './SkillNode';
import { motion } from 'framer-motion';

const nodeTypes = {
  custom: SkillNode,
};

const SkillGraph = ({ initialNodes, initialEdges, onNodeClick }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const animatedNodes = initialNodes.map((node, i) => ({
      ...node,
      id: String(node.id),
      type: 'custom',
      position: { x: (i % 3) * 350 - 350, y: Math.floor(i / 3) * 200 - 200 },
      data: {
        ...node.data,
        label: node.data?.label || node.label || `Node ${node.id}`,
        description: node.data?.description || node.description || ''
      },
      style: { opacity: 0, transform: 'translateY(12px)' },
    }));

    const safeEdges = initialEdges.map(edge => ({
      ...edge,
      id: String(edge.id || `e${edge.source}-${edge.target}`),
      source: String(edge.source),
      target: String(edge.target),
    }));
    
    setNodes(animatedNodes);
    setEdges(safeEdges);

    // Trigger stagger animation
    setTimeout(() => {
      setNodes(nds => nds.map((n, i) => ({
        ...n,
        style: { ...n.style, opacity: 1, transform: 'translateY(0)', transition: `all 0.4s ease-out ${i * 0.08}s` }
      })));
    }, 100);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div style={{ height: 'calc(100vh - 64px)', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(e, node) => onNodeClick(node)}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#ccc" gap={16} size={1} />
        <MiniMap nodeStrokeColor="#4F6EF7" nodeColor="#fff" maskColor="rgba(240, 244, 255, 0.7)" />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default SkillGraph;
