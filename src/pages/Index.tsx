import { useCallback, useState, useRef } from 'react';
import { FlowchartCanvas } from '@/components/FlowchartCanvas';
import { Toolbar } from '@/components/Toolbar';
import { Node, Edge } from '@xyflow/react';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/theme-toggle';
import { motion } from 'framer-motion';

const Index = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canvasRef = useRef<HTMLDivElement>(null);

  const saveToHistory = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), { nodes: newNodes, edges: newEdges }]);
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const handleSave = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    setNodes(newNodes);
    setEdges(newEdges);
    localStorage.setItem('flowchart-data', JSON.stringify({ nodes: newNodes, edges: newEdges }));
    saveToHistory(newNodes, newEdges);
  }, [saveToHistory]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(historyIndex - 1);
      toast.info('Undo');
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(historyIndex + 1);
      toast.info('Redo');
    }
  }, [history, historyIndex]);

  const handleExportPNG = useCallback(async () => {
    const flowElement = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!flowElement) {
      toast.error('Canvas not found');
      return;
    }

    try {
      const dataUrl = await toPng(flowElement, {
        backgroundColor: 'hsl(var(--canvas-bg))',
        quality: 1,
      });
      
      const link = document.createElement('a');
      link.download = `flowchart-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Flowchart exported as PNG!');
    } catch (error) {
      toast.error('Failed to export PNG');
    }
  }, []);

  const handleExportJSON = useCallback(() => {
    const data = { nodes, edges };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `flowchart-${Date.now()}.json`;
    link.href = url;
    link.click();
    toast.success('Flowchart saved as JSON!');
  }, [nodes, edges]);

  const handleImportJSON = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          setNodes(data.nodes || []);
          setEdges(data.edges || []);
          localStorage.setItem('flowchart-data', JSON.stringify(data));
          toast.success('Flowchart loaded!');
        } catch (error) {
          toast.error('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  const handleClear = useCallback(() => {
    if (nodes.length === 0 && edges.length === 0) {
      toast.info('Canvas is already empty');
      return;
    }
    
    setNodes([]);
    setEdges([]);
    localStorage.removeItem('flowchart-data');
    toast.success('Canvas cleared!');
  }, [nodes.length, edges.length]);

  const handleDeleteSelected = useCallback(() => {
    // This function is called when items are deleted from the canvas
    // We'll update the history here
    const currentNodes = nodes;
    const currentEdges = edges;
    saveToHistory(currentNodes, currentEdges);
  }, [nodes, edges, saveToHistory]);

  // Load from localStorage on mount
  useState(() => {
    const saved = localStorage.getItem('flowchart-data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
      } catch (error) {
        console.error('Failed to load saved data');
      }
    }
  });

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-background relative">
      {/* Animated gradient background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              'linear-gradient(45deg, hsl(var(--primary)), hsl(var(--secondary)))',
              'linear-gradient(45deg, hsl(var(--secondary)), hsl(var(--accent)))',
              'linear-gradient(45deg, hsl(var(--accent)), hsl(var(--primary)))',
              'linear-gradient(45deg, hsl(var(--primary)), hsl(var(--secondary)))',
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            background: [
              'linear-gradient(135deg, hsl(var(--primary)/0.5), transparent)',
              'linear-gradient(135deg, transparent, hsl(var(--accent)/0.5))',
              'linear-gradient(135deg, hsl(var(--secondary)/0.5), transparent)',
              'linear-gradient(135deg, transparent, hsl(var(--primary)/0.5))',
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </div>

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm z-20 relative">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Flowchart Maker</h1>
              <p className="text-sm text-muted-foreground">Create beautiful diagrams</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Canvas Container */}
      <div className="flex-1 relative z-10" ref={canvasRef}>
        <Toolbar
          onExportPNG={handleExportPNG}
          onExportJSON={handleExportJSON}
          onImportJSON={handleImportJSON}
          onClear={handleClear}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />
        <FlowchartCanvas
          onSave={handleSave}
          initialNodes={nodes}
          initialEdges={edges}
          onDeleteSelected={handleDeleteSelected}
        />
      </div>

      {/* Instructions Overlay */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="text-center space-y-2 opacity-50">
            <p className="text-lg font-medium text-muted-foreground">Drag shapes from the toolbar above</p>
            <p className="text-sm text-muted-foreground">Double-click to edit • Connect nodes by dragging handles</p>
          </div>
        </div>
      )}
      
      {/* Delete instructions */}
      {nodes.length > 0 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-card border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground shadow-sm z-10">
          <p>Select items and press Delete/Backspace or use the Delete Selected button</p>
        </div>
      )}
    </div>
  );
};

export default Index;