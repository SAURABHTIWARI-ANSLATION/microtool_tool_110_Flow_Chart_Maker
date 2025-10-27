import { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  MarkerType,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { RectangleNode } from './nodes/RectangleNode';
import { CircleNode } from './nodes/CircleNode';
import { DiamondNode } from './nodes/DiamondNode';
import { RoundedNode } from './nodes/RoundedNode';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';

const nodeTypes = {
  rectangle: RectangleNode,
  circle: CircleNode,
  diamond: DiamondNode,
  rounded: RoundedNode,
};

interface FlowchartCanvasProps {
  onSave: (nodes: Node[], edges: Edge[]) => void;
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onDeleteSelected?: (selectedNodeIds: string[], selectedEdgeIds: string[]) => void;
}

export const FlowchartCanvas = ({ onSave, initialNodes = [], initialEdges = [], onDeleteSelected }: FlowchartCanvasProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<Set<string>>(new Set());

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        type: 'smoothstep',
        animated: true,
        style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'hsl(var(--primary))',
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowWrapper.current || !reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: 'New Node' },
      };

      setNodes((nds) => nds.concat(newNode));
      toast.success('Node added!');
    },
    [reactFlowInstance, setNodes]
  );

  // Handle node selection
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(node.id)) {
        newSet.delete(node.id);
      } else {
        newSet.add(node.id);
      }
      return newSet;
    });
  }, []);

  // Handle edge selection
  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(edge.id)) {
        newSet.delete(edge.id);
      } else {
        newSet.add(edge.id);
      }
      return newSet;
    });
  }, []);

  // Clear selection when clicking on canvas
  const onPaneClick = useCallback(() => {
    setSelectedNodeIds(new Set());
    setSelectedEdgeIds(new Set());
  }, []);

  // Handle delete key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && (selectedNodeIds.size > 0 || selectedEdgeIds.size > 0)) {
        handleDeleteSelected();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNodeIds, selectedEdgeIds]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedNodeIds.size === 0 && selectedEdgeIds.size === 0) {
      return;
    }

    // Remove selected nodes and their connected edges
    const updatedNodes = nodes.filter(node => !selectedNodeIds.has(node.id));
    const updatedEdges = edges.filter(edge => 
      !selectedEdgeIds.has(edge.id) && 
      !selectedNodeIds.has(edge.source) && 
      !selectedNodeIds.has(edge.target)
    );

    setNodes(updatedNodes);
    setEdges(updatedEdges);
    
    const totalDeleted = selectedNodeIds.size + selectedEdgeIds.size;
    toast.success(`${totalDeleted} item${totalDeleted > 1 ? 's' : ''} deleted!`);
    
    // Clear selection after deletion
    setSelectedNodeIds(new Set());
    setSelectedEdgeIds(new Set());
    
    if (onDeleteSelected) {
      onDeleteSelected(Array.from(selectedNodeIds), Array.from(selectedEdgeIds));
    }
  }, [nodes, edges, selectedNodeIds, selectedEdgeIds, setNodes, setEdges, onDeleteSelected]);

  // Auto-save on changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (nodes.length > 0 || edges.length > 0) {
        onSave(nodes, edges);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, onSave]);

  // Update visual selection indicators
  const nodesWithSelection = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      selected: selectedNodeIds.has(node.id)
    }));
  }, [nodes, selectedNodeIds]);

  const edgesWithSelection = useMemo(() => {
    return edges.map(edge => ({
      ...edge,
      selected: selectedEdgeIds.has(edge.id)
    }));
  }, [edges, selectedEdgeIds]);

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={nodesWithSelection}
        edges={edgesWithSelection}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        className="bg-canvas-bg"
        selectionOnDrag
        selectionKeyCode="Shift"
        multiSelectionKeyCode="Meta"
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        // Enable built-in controls for zoom and fit view
        nodesDraggable
        nodesConnectable
        elementsSelectable
      >
        <Controls 
          className="bg-card border-border shadow-md rounded-lg dark:bg-card dark:border-border" 
          style={{ color: 'hsl(var(--foreground))' }}
        />
        <MiniMap
          className="bg-card border-border shadow-md rounded-lg dark:bg-card dark:border-border"
          nodeColor={(node) => {
            switch (node.type) {
              case 'circle':
                return 'hsl(var(--accent))';
              case 'diamond':
                return 'hsl(var(--destructive))';
              case 'rounded':
                return 'hsl(var(--secondary))';
              default:
                return 'hsl(var(--primary))';
            }
          }}
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="hsl(var(--canvas-grid))"
        />
        {/* Delete button for selected elements */}
        {(selectedNodeIds.size > 0 || selectedEdgeIds.size > 0) && (
          <Panel position="top-right" className="mt-20 mr-4">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected ({selectedNodeIds.size + selectedEdgeIds.size})
            </Button>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};