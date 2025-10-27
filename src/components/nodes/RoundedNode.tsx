import { memo, useState } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';

export const RoundedNode = memo(({ data, selected, id }: NodeProps) => {
  const [label, setLabel] = useState<string>(data.label as string || 'Process');
  const [isEditing, setIsEditing] = useState(false);
  const [width, setWidth] = useState<number>(data.width as number || 140);
  const [height, setHeight] = useState<number>(data.height as number || 60);
  const { setNodes } = useReactFlow();

  const handleResize = (newWidth: number, newHeight: number) => {
    setWidth(newWidth);
    setHeight(newHeight);
    
    // Update node dimensions in the flow
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              width: newWidth,
              height: newHeight
            }
          };
        }
        return node;
      })
    );
  };

  return (
    <div
      className={`rounded-full border-2 bg-card shadow-md transition-all relative ${
        selected ? 'border-secondary shadow-glow' : 'border-border'
      }`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {selected && (
        <>
          {/* Resize handles */}
          <div 
            className="absolute w-3 h-3 bg-secondary rounded-full cursor-nw-resize -top-1.5 -left-1.5"
            onMouseDown={(e) => {
              e.stopPropagation();
              const startX = e.clientX;
              const startY = e.clientY;
              const startWidth = width;
              const startHeight = height;
              
              const handleMouseMove = (e: MouseEvent) => {
                const newWidth = Math.max(100, startWidth + (e.clientX - startX));
                const newHeight = Math.max(40, startHeight + (e.clientY - startY));
                handleResize(newWidth, newHeight);
              };
              
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
          <div 
            className="absolute w-3 h-3 bg-secondary rounded-full cursor-ne-resize -top-1.5 -right-1.5"
            onMouseDown={(e) => {
              e.stopPropagation();
              const startX = e.clientX;
              const startY = e.clientY;
              const startWidth = width;
              const startHeight = height;
              
              const handleMouseMove = (e: MouseEvent) => {
                const newWidth = Math.max(100, startWidth - (e.clientX - startX));
                const newHeight = Math.max(40, startHeight + (e.clientY - startY));
                handleResize(newWidth, newHeight);
              };
              
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
          <div 
            className="absolute w-3 h-3 bg-secondary rounded-full cursor-sw-resize -bottom-1.5 -left-1.5"
            onMouseDown={(e) => {
              e.stopPropagation();
              const startX = e.clientX;
              const startY = e.clientY;
              const startWidth = width;
              const startHeight = height;
              
              const handleMouseMove = (e: MouseEvent) => {
                const newWidth = Math.max(100, startWidth + (e.clientX - startX));
                const newHeight = Math.max(40, startHeight - (e.clientY - startY));
                handleResize(newWidth, newHeight);
              };
              
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
          <div 
            className="absolute w-3 h-3 bg-secondary rounded-full cursor-se-resize -bottom-1.5 -right-1.5"
            onMouseDown={(e) => {
              e.stopPropagation();
              const startX = e.clientX;
              const startY = e.clientY;
              const startWidth = width;
              const startHeight = height;
              
              const handleMouseMove = (e: MouseEvent) => {
                const newWidth = Math.max(100, startWidth + (e.clientX - startX));
                const newHeight = Math.max(40, startHeight + (e.clientY - startY));
                handleResize(newWidth, newHeight);
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
      
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-secondary" />
      
      <div className="w-full h-full flex items-center justify-center">
        {isEditing ? (
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
            className="w-full bg-transparent border-none outline-none text-center font-medium text-foreground"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div
            onDoubleClick={() => setIsEditing(true)}
            className="text-center font-medium text-foreground cursor-text px-4 w-full"
          >
            {label}
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-secondary" />
      <Handle type="source" position={Position.Left} className="w-3 h-3 bg-secondary" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-secondary" />
    </div>
  );
});

RoundedNode.displayName = 'RoundedNode';