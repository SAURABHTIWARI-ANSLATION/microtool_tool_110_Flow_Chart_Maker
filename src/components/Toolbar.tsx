import { Square, Circle, Diamond, RectangleHorizontal, Download, Upload, Trash2, Undo2, Redo2, Save, Delete } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { toast } from 'sonner';

interface ToolbarProps {
  onExportPNG: () => void;
  onExportJSON: () => void;
  onImportJSON: () => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

const shapes = [
  { type: 'rectangle', icon: Square, label: 'Rectangle' },
  { type: 'circle', icon: Circle, label: 'Circle' },
  { type: 'diamond', icon: Diamond, label: 'Diamond' },
  { type: 'rounded', icon: RectangleHorizontal, label: 'Rounded' },
];

export const Toolbar = ({ onExportPNG, onExportJSON, onImportJSON, onClear, onUndo, onRedo }: ToolbarProps) => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-card border border-border rounded-xl shadow-lg p-2 flex items-center gap-2">
      {/* Shapes */}
      <div className="flex items-center gap-1">
        {shapes.map((shape) => (
          <div
            key={shape.type}
            draggable
            onDragStart={(e) => onDragStart(e, shape.type)}
            className="cursor-grab active:cursor-grabbing"
          >
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-primary/10 hover:text-primary transition-smooth"
              title={shape.label}
            >
              <shape.icon className="h-5 w-5" />
            </Button>
          </div>
        ))}
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onUndo}
          className="hover:bg-muted transition-smooth"
          title="Undo"
        >
          <Undo2 className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRedo}
          className="hover:bg-muted transition-smooth"
          title="Redo"
        >
          <Redo2 className="h-5 w-5" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* File Operations */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onExportPNG}
          className="hover:bg-accent/10 hover:text-accent transition-smooth"
          title="Export as PNG"
        >
          <Download className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onExportJSON}
          className="hover:bg-secondary/10 hover:text-secondary transition-smooth"
          title="Save as JSON"
        >
          <Save className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onImportJSON}
          className="hover:bg-primary/10 hover:text-primary transition-smooth"
          title="Load from JSON"
        >
          <Upload className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClear}
          className="hover:bg-destructive/10 hover:text-destructive transition-smooth"
          title="Clear Canvas"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};