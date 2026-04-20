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

    const formattedEdges = initialEdges.map(edge => ({
      ...edge,
      id: String(edge.id || `e${edge.source}-${edge.target}`),
      source: String(edge.source),
      target: String(edge.target),
      animated: true,
      style: { stroke: 'var(--accent-primary)', strokeWidth: 2 }
    }));
    
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(formattedNodes, formattedEdges);

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
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
