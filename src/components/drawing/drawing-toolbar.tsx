'use client';

import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Square,
  Circle,
  Minus,
  MousePointer,
  Pencil,
  Trash2,
  Undo2,
  Redo2,
  Move,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

interface DrawingToolbarProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function DrawingToolbar({
  activeTool,
  onToolChange,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  canUndo,
  canRedo,
}: DrawingToolbarProps) {
  const tools = [
    { value: 'select', icon: MousePointer, label: 'Select' },
    { value: 'move', icon: Move, label: 'Move' },
    { value: 'line', icon: Minus, label: 'Line' },
    { value: 'rectangle', icon: Square, label: 'Rectangle' },
    { value: 'circle', icon: Circle, label: 'Circle' },
    { value: 'pencil', icon: Pencil, label: 'Free Draw' },
    { value: 'eraser', icon: Trash2, label: 'Eraser' },
  ];

  return (
    <div className="flex items-center gap-2 p-2 border-b bg-background">
      <ToggleGroup
        type="single"
        value={activeTool}
        onValueChange={onToolChange}
        className="flex gap-1"
      >
        {tools.map((tool) => (
          <ToggleGroupItem
            key={tool.value}
            value={tool.value}
            aria-label={tool.label}
            className="h-9 w-9 p-0"
          >
            <tool.icon className="h-4 w-4" />
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div className="h-6 w-px bg-border mx-2" />

      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onUndo}
          disabled={!canUndo}
          className="h-9 w-9"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRedo}
          disabled={!canRedo}
          className="h-9 w-9"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="h-6 w-px bg-border mx-2" />

      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomOut}
          className="h-9 w-9"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomIn}
          className="h-9 w-9"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}