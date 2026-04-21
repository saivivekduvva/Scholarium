import React, { useEffect } from 'react';
import { ReactFlow, Background, MiniMap, Controls, useNodesState, useEdgesState } from '@xyflow/react';
import dagre from 'dagre';
import SkillNode from './SkillNode';
import { motion } from 'framer-motion';

const nodeTypes = {
  custom: SkillNode,
};

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, nodesep: 80, ranksep: 120 });

  nodes.forEach((node) => {
    // node dimensions
    dagreGraph.setNode(node.id, { width: 220, height: 100 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: 'top',
      sourcePosition: 'bottom',
      position: {
        x: nodeWithPosition.x - 220 / 2,
        y: nodeWithPosition.y - 100 / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

const SkillGraph = ({ initialNodes, initialEdges, onNodeClick }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const formattedNodes = initialNodes.map((node) => ({
      ...node,
      id: String(node.id),
      type: 'custom',
      position: { x: 0, y: 0 },
      data: {
        ...node.data,
        label: node.data?.label || node.label || `Node ${node.id}`,
        description: node.data?.description || node.description || ''
      }
    }));

    const formattedEdges = initialEdges.map(edge => {
      // Find the source node to check status
      const sourceNode = initialNodes.find(n => n.id === edge.source);
      const isActive = sourceNode && sourceNode.data.status === 'done';
      
      return {
        ...edge,
        id: String(edge.id || `e${edge.source}-${edge.target}`),
        source: String(edge.source),
        target: String(edge.target),
        className: isActive ? 'edge-active' : 'edge-locked',
        animated: isActive,
        style: { 
          stroke: isActive ? 'var(--accent-primary)' : '#cbd5e1', 
          strokeWidth: isActive ? 3 : 2,
          transition: 'all 0.5s ease'
        }
      };
    });
    
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(formattedNodes, formattedEdges);

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div style={{ height: 'calc(100vh - 64px)', width: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(e, node) => onNodeClick(node)}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        maxZoom={1.5}
      >
        <Background variant="dots" gap={24} size={1} color="#cbd5e1" />
        <MiniMap 
          nodeColor={(node) => {
            if (node.data.status === 'done') return '#06C9A0';
            if (node.data.status === 'active') return '#4F6EF7';
            return '#e2e8f0';
          }}
          maskColor="rgba(240, 244, 255, 0.6)"
          style={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
        />
        <Controls 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '4px',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }} 
        />
      </ReactFlow>
    </div>
  );
};

export default SkillGraph;
