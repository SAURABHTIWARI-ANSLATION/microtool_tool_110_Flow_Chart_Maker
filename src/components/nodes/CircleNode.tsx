import { memo, useState } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';

export const CircleNode = memo(({ data, selected, id }: NodeProps) => {
  const [label, setLabel] = useState<string>(data.label as string || 'Circle');
  const [isEditing, setIsEditing] = useState(false);
  const [size, setSize] = useState<number>(data.size as number || 128);
  const { setNodes } = useReactFlow();

  const handleResize = (newSize: number) => {
    setSize(newSize);
    
    // Update node dimensions in the flow
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              size: newSize
            }
          };
        }
        return node;
      })
    );
  };

  return (
    <div
      className={`rounded-full border-2 bg-card shadow-md transition-all relative flex items-center justify-center ${
        selected ? 'border-accent shadow-glow' : 'border-border'
      }`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {selected && (
        <>
          {/* Resize handle */}
          <div 
            className="absolute w-3 h-3 bg-accent rounded-full cursor-se-resize -bottom-1.5 -right-1.5"
            onMouseDown={(e) => {
              e.stopPropagation();
              const startX = e.clientX;
              const startY = e.clientY;
              const startSize = size;
              
              const handleMouseMove = (e: MouseEvent) => {
                const newSize = Math.max(60, startSize + (e.clientX - startX + e.clientY - startY) / 2);
                handleResize(newSize);
              };
              
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
        </>
      )}
      
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-accent" />
      
      {isEditing ? (
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
          className="w-20 bg-transparent border-none outline-none text-center font-medium text-foreground"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div
          onDoubleClick={() => setIsEditing(true)}
          className="text-center font-medium text-foreground cursor-text px-2"
        >
          {label}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-accent" />
      <Handle type="source" position={Position.Left} className="w-3 h-3 bg-accent" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-accent" />
    </div>
  );
});

CircleNode.displayName = 'CircleNode';