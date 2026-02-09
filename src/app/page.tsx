'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Header from '@/components/header';
import Controls from '@/components/maze/controls';
import MazeGrid from '@/components/maze/maze-grid';
import MetricsPanel from '@/components/maze/metrics-panel';
import {
  createAdvancedGrid,
  generateMaze,
  solve,
  clearAdvancedGrid,
} from '@/lib/maze';
import type { AdvancedGrid, Position, AlgorithmMetrics, SolveResult } from '@/lib/types';
import { CellType } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Scan, Activity, Binary, Fingerprint, Microscope, Dna, Orbit, Atom } from 'lucide-react';

const INITIAL_GRID_SIZE = 25;

export default function Home() {
  const [grid, setGrid] = useState<AdvancedGrid | null>(null);
  const [comparisonGrid, setComparisonGrid] = useState<AdvancedGrid | null>(null);
  const [algorithm, setAlgorithm] = useState('bfs');
  const [category, setCategory] = useState<'uninformed' | 'informed'>('uninformed');
  const [speed, setSpeed] = useState(80);
  const [isManualMode, setIsManualMode] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [isVisualizing1, setIsVisualizing1] = useState(false);
  const [isVisualizing2, setIsVisualizing2] = useState(false);
  const [isComplete1, setIsComplete1] = useState(false);
  const [isComplete2, setIsComplete2] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [level, setLevel] = useState(1);
  const [gridSize, setGridSize] = useState({ width: INITIAL_GRID_SIZE, height: INITIAL_GRID_SIZE });
  const [startPos, setStartPos] = useState<Position>({ row: 1, col: 1 });
  const [endPos, setEndPos] = useState<Position>({ row: 23, col: 23 });
  const [playerPosition, setPlayerPosition] = useState<Position>(startPos);
  const [manualPath, setManualPath] = useState<Position[]>([]);
  const [isSolved, setIsSolved] = useState(false);
  const [metrics1, setMetrics1] = useState<AlgorithmMetrics | null>(null);
  const [metrics2, setMetrics2] = useState<AlgorithmMetrics | null>(null);

  const { toast } = useToast();
  const animationTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const gridRef = useRef<AdvancedGrid | null>(null);
  const playerPosRef = useRef<Position>(startPos);
  const manualPathRef = useRef<Position[]>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    playerPosRef.current = playerPosition;
  }, [playerPosition]);

  useEffect(() => {
    manualPathRef.current = manualPath;
  }, [manualPath]);

  const handleGenerateMaze = useCallback(() => {
    const size = INITIAL_GRID_SIZE + (level - 1) * 2;
    const start = { row: 1, col: 1 };
    const end = { row: size - 2, col: size - 2 };
    
    setGridSize({ width: size, height: size });
    setStartPos(start);
    setEndPos(end);
    setPlayerPosition(start);
    setManualPath([start]);
    setIsSolved(false);
    setIsComplete1(false);
    setIsComplete2(false);
    setMetrics1(null);
    setMetrics2(null);

    const newGrid = createAdvancedGrid(size, size);
    generateMaze(newGrid, start, end, category);
    setGrid(newGrid);
    if (comparisonMode) setComparisonGrid(JSON.parse(JSON.stringify(newGrid)));
  }, [level, category, comparisonMode]);

  useEffect(() => {
    if(isClient) handleGenerateMaze();
  }, [isClient, level, category]);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  const handleLevelCompletion = useCallback(() => {
    toast({
      title: `Victory!`,
      description: `You've completed Level ${level}. Moving to the next challenge...`,
    });
    setTimeout(() => setLevel(prev => prev + 1), 1500);
  }, [level, toast]);

  useEffect(() => {
    if (isManualMode && playerPosition.row === endPos.row && playerPosition.col === endPos.col && !isSolved) {
      setIsSolved(true);
      handleLevelCompletion();
    }
  }, [playerPosition, endPos, isSolved, handleLevelCompletion, isManualMode]);

  const updatePlayerPosition = (newPos: Position) => {
    const currentPath = manualPathRef.current;
    
    const isBacktracking = currentPath.length > 1 && 
      newPos.row === currentPath[currentPath.length - 2].row && 
      newPos.col === currentPath[currentPath.length - 2].col;

    if (isBacktracking) {
      const oldPos = currentPath[currentPath.length - 1];
      setGrid(prev => {
        if (!prev) return null;
        const next = prev.map(row => row.map(cell => ({ ...cell })));
        if (next[oldPos.row][oldPos.col].type === CellType.PLAYER_PATH) {
          next[oldPos.row][oldPos.col].type = CellType.EMPTY;
        }
        return next;
      });
      setManualPath(prev => prev.slice(0, -1));
      setPlayerPosition(newPos);
    } else {
      setGrid(prev => {
        if (!prev) return null;
        const next = prev.map(row => row.map(cell => ({ ...cell })));
        if (next[newPos.row][newPos.col].type === CellType.EMPTY || next[newPos.row][newPos.col].type === CellType.VISITED) {
          next[newPos.row][newPos.col].type = CellType.PLAYER_PATH;
        }
        return next;
      });
      setManualPath(prev => [...prev, newPos]);
      setPlayerPosition(newPos);
    }
  };

  const handleCellInteraction = (row: number, col: number, isDrawing: boolean) => {
    if (isVisualizing1 || isVisualizing2 || isSolved || !grid) return;
    
    if (isManualMode) {
      const currentPos = playerPosRef.current;
      const currentPath = manualPathRef.current;
      
      const targetIndex = currentPath.findIndex(p => p.row === row && p.col === col);
      
      if (targetIndex !== -1 && targetIndex < currentPath.length - 1) {
        const cellsToErase = currentPath.slice(targetIndex + 1);
        setGrid(prev => {
          if (!prev) return null;
          const next = prev.map(r => r.map(cell => ({ ...cell })));
          cellsToErase.forEach(p => {
            if (next[p.row][p.col].type === CellType.PLAYER_PATH) {
              next[p.row][p.col].type = CellType.EMPTY;
            }
          });
          return next;
        });
        setManualPath(prev => prev.slice(0, targetIndex + 1));
        setPlayerPosition({ row, col });
        return;
      }

      if (row === currentPos.row || col === currentPos.col) {
        const dr = row > currentPos.row ? 1 : row < currentPos.row ? -1 : 0;
        const dc = col > currentPos.col ? 1 : col < currentPos.col ? -1 : 0;
        
        const pathSteps: Position[] = [];
        let r = currentPos.row;
        let c = currentPos.col;
        
        while (r !== row || c !== col) {
          r += dr;
          c += dc;
          if (grid[r][c].type === CellType.WALL) break;
          pathSteps.push({ row: r, col: c });
        }
        
        if (pathSteps.length > 0) {
          const lastPos = pathSteps[pathSteps.length - 1];
          setPlayerPosition(lastPos);
          setGrid(prev => {
            if (!prev) return null;
            const next = prev.map(r => r.map(cell => ({ ...cell })));
            pathSteps.forEach(p => {
              if (next[p.row][p.col].type === CellType.EMPTY || next[p.row][p.col].type === CellType.VISITED) {
                next[p.row][p.col].type = CellType.PLAYER_PATH;
              }
            });
            return next;
          });
          setManualPath(prev => [...prev, ...pathSteps]);
        }
      }
    } else if (isDrawing) {
      const cell = grid[row][col];
      if (cell.type === CellType.START || cell.type === CellType.END) return;
      
      setGrid(prev => {
        if (!prev) return null;
        const next = prev.map(r => r.map(c => ({...c})));
        next[row][col].type = next[row][col].type === CellType.WALL ? CellType.EMPTY : CellType.WALL;
        return next;
      });
      
      if (comparisonMode) {
        setComparisonGrid(prev => {
          if (!prev) return null;
          const next = prev.map(r => r.map(c => ({...c})));
          next[row][col].type = next[row][col].type === CellType.WALL ? CellType.EMPTY : CellType.WALL;
          return next;
        });
      }
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isManualMode || isVisualizing1 || isVisualizing2 || isSolved) return;
    let next = { ...playerPosRef.current };
    if (e.key === 'ArrowUp') next.row--;
    else if (e.key === 'ArrowDown') next.row++;
    else if (e.key === 'ArrowLeft') next.col--;
    else if (e.key === 'ArrowRight') next.col++;
    else return;
    
    e.preventDefault();
    const currentGrid = gridRef.current;
    if (currentGrid && next.row >= 0 && next.row < currentGrid.length && next.col >= 0 && next.col < currentGrid[0].length && currentGrid[next.row][next.col].type !== CellType.WALL) {
      updatePlayerPosition(next);
    }
  }, [isManualMode, isVisualizing1, isVisualizing2, isSolved]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleReset = (newMaze = false) => {
    animationTimeoutsRef.current.forEach(t => clearTimeout(t));
    animationTimeoutsRef.current = [];
    setIsVisualizing1(false);
    setIsVisualizing2(false);
    setIsComplete1(false);
    setIsComplete2(false);
    setMetrics1(null);
    setMetrics2(null);
    setIsSolved(false);

    if (newMaze) {
      handleGenerateMaze();
    } else if (grid) {
      const cleared = clearAdvancedGrid(grid);
      setGrid(cleared);
      setPlayerPosition(startPos);
      setManualPath([startPos]);
      if (comparisonMode) setComparisonGrid(JSON.parse(JSON.stringify(cleared)));
    }
  };

  const animateSingleAlgorithm = (
    result: SolveResult,
    gridSetter: React.Dispatch<React.SetStateAction<AdvancedGrid | null>>,
    setIsVisualizing: (val: boolean) => void,
    setIsComplete: (val: boolean) => void,
    setMetrics: (m: AlgorithmMetrics) => void,
    speed: number
  ) => {
    setIsVisualizing(true);
    const animStartTime = performance.now();
    const visited = result.visitedInOrder;
    const path = result.path;
    const delay = Math.max(1, 100 - speed);

    visited.forEach((p, i) => {
      const t = setTimeout(() => {
        gridSetter(prev => {
          if (!prev) return null;
          const next = prev.map(row => row.map(cell => ({ ...cell })));
          if (next[p.row][p.col].type === CellType.EMPTY) next[p.row][p.col].type = CellType.VISITED;
          return next;
        });

        if (i === visited.length - 1) {
          path.forEach((pp, j) => {
            const pt = setTimeout(() => {
              gridSetter(prev => {
                if (!prev) return null;
                const next = prev.map(row => row.map(cell => ({ ...cell })));
                if (next[pp.row][pp.col].type !== CellType.START && next[pp.row][pp.col].type !== CellType.END) {
                  next[pp.row][pp.col].type = CellType.PATH;
                }
                return next;
              });
              if (j === path.length - 1) {
                const animEndTime = performance.now();
                setIsVisualizing(false);
                setIsComplete(true);
                setMetrics({
                  ...result.metrics,
                  executionTime: Math.round(animEndTime - animStartTime)
                });
              }
            }, j * 20);
            animationTimeoutsRef.current.push(pt);
          });
        }
      }, i * delay);
      animationTimeoutsRef.current.push(t);
    });
  };

  const handleVisualize = () => {
    if (isVisualizing1 || isVisualizing2 || !grid) return;
    handleReset(false);

    if (comparisonMode) {
      const algo1 = category === 'uninformed' ? 'bfs' : 'dijkstra';
      const algo2 = category === 'uninformed' ? 'dfs' : 'astar';
      const res1 = solve(algo1, JSON.parse(JSON.stringify(grid)), playerPosition, endPos);
      const res2 = solve(algo2, JSON.parse(JSON.stringify(grid)), playerPosition, endPos);
      
      animateSingleAlgorithm(res1, setGrid, setIsVisualizing1, setIsComplete1, setMetrics1, speed);
      animateSingleAlgorithm(res2, setComparisonGrid, setIsVisualizing2, setIsComplete2, setMetrics2, speed);
    } else {
      const res = solve(algorithm, grid, playerPosition, endPos);
      animateSingleAlgorithm(res, setGrid, setIsVisualizing1, setIsComplete1, setMetrics1, speed);
    }
  };

  const handleShowSolution = () => {
    if (isVisualizing1 || isVisualizing2 || !grid) return;
    const res = solve(algorithm, grid, playerPosition, endPos);
    setGrid(prev => {
      if (!prev) return null;
      const next = clearAdvancedGrid(prev);
      res.path.forEach(p => {
        if (next[p.row][p.col].type !== CellType.START && next[p.row][p.col].type !== CellType.END) {
          next[p.row][p.col].type = CellType.PATH;
        }
      });
      return next;
    });
    setMetrics1(res.metrics);
    setIsComplete1(true);
  };

  return (
    <div className="flex flex-col relative overflow-hidden">
      {/* Global Professional Background Layer */}
      <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden bg-background">
        <div className="absolute inset-0 bg-cyber-grid opacity-[0.05] dark:opacity-[0.1]" />
        <div className="absolute inset-0 bg-focal-glow" />
      </div>

      <Header />
      <main className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 relative z-10">
        {/* Floating Background Decorative Text */}
        <div className="absolute -left-12 top-1/4 opacity-10 pointer-events-none rotate-90 hidden xl:block z-0 h-0 overflow-visible">
           <span className="text-8xl font-black uppercase tracking-widest text-primary whitespace-nowrap">Laboratory</span>
        </div>

        {isClient && (
          <Controls
            level={level}
            algorithm={algorithm}
            setAlgorithm={setAlgorithm}
            category={category}
            setCategory={(cat) => setCategory(cat as 'uninformed' | 'informed')}
            speed={speed}
            setSpeed={setSpeed}
            isManualMode={isManualMode}
            setIsManualMode={setIsManualMode}
            comparisonMode={comparisonMode}
            setComparisonMode={setComparisonMode}
            isVisualizing={isVisualizing1 || isVisualizing2}
            isVisualizationComplete={isComplete1 && isComplete2}
            onVisualize={handleVisualize}
            onGenerateMaze={() => handleReset(true)}
            onReset={() => handleReset(false)}
            onShowSolution={handleShowSolution}
          />
        )}
        
        <div className="flex-1 flex flex-col items-center gap-6 overflow-hidden relative pb-12">
          {/* Workspace Decorative Stickers - Surrounded the maze */}
          <div className="absolute -left-10 top-20 p-4 bg-primary/5 rounded-3xl border border-primary/10 -rotate-12 animate-float opacity-30 pointer-events-none hidden xl:block">
            <Binary className="w-16 h-16 text-primary" />
            <div className="mt-2 text-[8px] font-mono text-center">DATA_STREAM_v2</div>
          </div>
          
          <div className="absolute -right-10 bottom-40 p-5 bg-accent/5 rounded-full border border-accent/10 rotate-12 animate-pulse opacity-30 pointer-events-none hidden xl:block">
            <Fingerprint className="w-20 h-20 text-accent" />
            <div className="mt-2 text-[8px] font-mono text-center">NODE_VERIFIED</div>
          </div>

          <div className="absolute left-20 bottom-10 p-3 bg-secondary/50 rounded-xl border border-border rotate-6 animate-bounce-subtle opacity-20 pointer-events-none hidden lg:block">
            <Microscope className="w-10 h-10 text-primary" />
          </div>

          <div className="absolute right-20 top-0 p-3 bg-primary/10 rounded-full border border-primary/20 -rotate-6 animate-spin-slow opacity-20 pointer-events-none hidden lg:block">
            <Orbit className="w-12 h-12 text-primary" />
          </div>

          <div className="absolute right-0 top-1/2 p-2 bg-green-500/10 rounded-lg border border-green-500/20 rotate-45 animate-pulse opacity-15 pointer-events-none hidden xl:block">
            <Atom className="w-14 h-14 text-green-500" />
          </div>

          <div className={cn(
            "flex items-start justify-center gap-6 w-full relative z-20", 
            comparisonMode ? "flex-row flex-wrap xl:flex-nowrap" : "flex-col items-center"
          )}>
            {isClient && grid && (
              <MazeGrid 
                grid={grid} 
                playerPosition={playerPosition} 
                onCellInteraction={handleCellInteraction}
                isVisualizing={isVisualizing1}
                isManualMode={isManualMode}
                label={comparisonMode ? (category === 'uninformed' ? 'BFS (Breadth First)' : 'Dijkstra (Uniform Search)') : undefined}
                className={cn("shadow-2xl", comparisonMode ? "max-w-[480px]" : "max-w-[550px]")}
              />
            )}
            {isClient && comparisonGrid && comparisonMode && (
              <MazeGrid 
                grid={comparisonGrid} 
                playerPosition={playerPosition} 
                onCellInteraction={handleCellInteraction}
                isVisualizing={isVisualizing2}
                isManualMode={isManualMode}
                label={category === 'uninformed' ? 'DFS (Depth First)' : 'A* (Smart Search)'}
                className="max-w-[480px] shadow-2xl"
              />
            )}
          </div>

          {(isComplete1 || isComplete2 || metrics1 || metrics2) && (
            <div className="w-full max-w-4xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-30">
              <div className={cn(
                "grid gap-4",
                comparisonMode ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 max-w-lg mx-auto"
              )}>
                {metrics1 && <MetricsPanel metrics={metrics1} title={comparisonMode ? (category === 'uninformed' ? 'BFS Results' : 'Dijkstra Results') : "Primary Solver"} />}
                {metrics2 && <MetricsPanel metrics={metrics2} title={category === 'uninformed' ? 'DFS Results' : 'A* Results'} />}
              </div>
              
              {comparisonMode && (isComplete1 || isComplete2) && (
                <Card className="border-primary/20 bg-card/40 backdrop-blur-md overflow-hidden relative">
                  <div className="absolute right-2 top-2">
                    <Activity className="w-3 h-3 text-primary opacity-20" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                      <div className="w-1.5 h-4 bg-primary rounded-full" />
                      Comparison Analysis: {category === 'uninformed' ? 'Uninformed' : 'Informed'} Search
                    </h3>
                    <div className="text-xs text-muted-foreground space-y-2 leading-relaxed">
                      {category === 'uninformed' ? (
                        <>
                          <p><strong>BFS:</strong> Guaranteed shortest path. It explores equally in all directions, making it reliable but slower in large open areas.</p>
                          <p><strong>DFS:</strong> Prioritizes depth over optimality. It often finds a path faster by sheer exploration, but the path is typically winding and inefficient.</p>
                        </>
                      ) : (
                        <>
                          <p><strong>Dijkstra:</strong> Effectively BFS for weighted graphs. It expands uniformly until the goal is reached, ensuring optimal path length.</p>
                          <p><strong>A* Search:</strong> Uses a heuristic to 'pull' the search towards the target, drastically reducing the number of nodes visited compared to Dijkstra.</p>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="flex justify-center gap-3">
                <Button 
                  onClick={() => {
                    handleReset(false);
                    setIsManualMode(true);
                  }} 
                  variant="outline" 
                  className="font-bold bg-background/50 backdrop-blur-sm border-primary/20"
                >
                  Try Manually
                </Button>
                <Button onClick={() => handleReset(true)} className="font-bold shadow-lg shadow-primary/20">Next Challenge</Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
