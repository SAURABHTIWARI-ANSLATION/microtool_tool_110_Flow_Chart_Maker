import { memo, useState } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';

export const DiamondNode = memo(({ data, selected, id }: NodeProps) => {
  const [label, setLabel] = useState<string>(data.label as string || 'Decision');
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
    <div className="relative" style={{ width: `${size}px`, height: `${size}px` }}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-destructive z-10" />
      
      <div
        className={`w-full h-full rotate-45 border-2 bg-card shadow-md transition-all relative ${
          selected ? 'border-destructive shadow-glow' : 'border-border'
        }`}
      >
        {selected && (
          <>
            {/* Resize handle */}
            <div 
              className="absolute w-3 h-3 bg-destructive rounded-full cursor-se-resize bottom-0 right-0 transform translate-x-1/2 translate-y-1/2"
              onMouseDown={(e) => {
                e.stopPropagation();
                const startX = e.clientX;
                const startY = e.clientY;
                const startSize = size;
                
                const handleMouseMove = (e: MouseEvent) => {
                  const newSize = Math.max(80, startSize + (e.clientX - startX + e.clientY - startY) / 2);
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
        
        <div className="-rotate-45 w-full h-full flex items-center justify-center">
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
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-destructive z-10" />
      <Handle type="source" position={Position.Left} className="w-3 h-3 bg-destructive z-10" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-destructive z-10" />
    </div>
  );
});

DiamondNode.displayName = 'DiamondNode';