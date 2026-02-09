'use client';
import React, { useState } from 'react';
import type { AdvancedGrid, Position } from '@/lib/types';
import { CellType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Rocket } from 'lucide-react';

const TargetIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const Cell = React.memo(({ 
  cell, 
  isPlayer, 
  isManualMode,
  onMouseDown, 
  onMouseEnter, 
  onMouseUp,
  row, 
  col 
}: { 
  cell: { type: CellType }, 
  isPlayer: boolean, 
  isManualMode: boolean,
  onMouseDown: (row: number, col: number) => void,
  onMouseEnter: (row: number, col: number) => void,
  onMouseUp: () => void,
  row: number, 
  col: number 
}) => {
  const { type } = cell;
  
  const cellClasses = cn(
    'flex items-center justify-center transition-colors duration-200 relative w-full h-full box-border select-none border-[0.5px] border-border/10',
    {
      'cursor-crosshair': !isManualMode && type !== CellType.WALL,
      'cursor-pointer hover:bg-muted/30': isManualMode && type !== CellType.WALL && !isPlayer,
      'cursor-default': type === CellType.WALL,
      'bg-background': type === CellType.EMPTY,
      'bg-foreground/80': type === CellType.WALL,
      'bg-primary': type === CellType.START,
      'bg-destructive': type === CellType.END,
      'bg-cyan-500/40 animate-pop': type === CellType.VISITED,
      'bg-accent animate-pop z-10': type === CellType.PATH,
      'bg-amber-400': type === CellType.PLAYER_PATH,
    }
  );

  return (
    <div 
      className={cellClasses} 
      onMouseDown={() => onMouseDown(row, col)}
      onMouseEnter={() => onMouseEnter(row, col)}
      onMouseUp={onMouseUp}
    >
      {type === CellType.START && !isPlayer && <Rocket className="w-3 h-3 text-primary-foreground" />}
      {type === CellType.END && <TargetIcon className="w-3 h-3 text-destructive-foreground" />}
      {isPlayer && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="w-2/3 h-2/3 bg-green-500 rounded-full animate-pop shadow-sm"/>
        </div>
      )}
    </div>
  );
});

Cell.displayName = 'Cell';

const MazeGrid = React.memo(({ grid, playerPosition, onCellInteraction, label, isVisualizing, isManualMode, className }: { 
  grid: AdvancedGrid, 
  playerPosition: Position, 
  onCellInteraction: (row: number, col: number, isDrawing: boolean) => void, 
  label?: string,
  isVisualizing: boolean,
  isManualMode: boolean,
  className?: string
}) => {
  const [isMouseDown, setIsMouseDown] = useState(false);

  if (!grid || grid.length === 0) return null;

  const rowCount = grid.length;
  const colCount = grid[0].length;

  const handleMouseDown = (row: number, col: number) => {
    if (isVisualizing) return;
    setIsMouseDown(true);
    onCellInteraction(row, col, true);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isVisualizing || !isMouseDown) return;
    onCellInteraction(row, col, true);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${colCount}, 1fr)`,
    gridTemplateRows: `repeat(${rowCount}, 1fr)`,
    width: '100%',
    maxWidth: '100%',
    aspectRatio: '1 / 1',
    gap: '0px',
  };

  return (
    <div className={cn("flex flex-col gap-4 w-full", className)}>
      {label && <h3 className="text-sm font-bold text-center text-muted-foreground uppercase tracking-wider h-5 flex items-center justify-center">{label}</h3>}
      
      <div 
        className="border-2 border-border/50 rounded-md overflow-hidden shadow-xl box-border bg-foreground/5" 
        style={gridStyles}
        onMouseLeave={handleMouseUp}
      >
        {grid.map((row, rIdx) =>
          row.map((cell, cIdx) => (
            <Cell 
              key={`${rIdx}-${cIdx}`} 
              cell={cell} 
              isPlayer={rIdx === playerPosition.row && cIdx === playerPosition.col}
              isManualMode={isManualMode}
              onMouseDown={handleMouseDown}
              onMouseEnter={handleMouseEnter}
              onMouseUp={handleMouseUp}
              row={rIdx}
              col={cIdx}
            />
          ))
        )}
      </div>
    </div>
  );
});

MazeGrid.displayName = 'MazeGrid';
export default MazeGrid;
