import type { AdvancedGrid, Position, SolveResult, AlgorithmMetrics } from './types';
import { CellType } from './types';

export function createAdvancedGrid(rows: number, cols: number): AdvancedGrid {
  const grid: AdvancedGrid = [];
  for (let row = 0; row < rows; row++) {
    const r: any[] = [];
    for (let col = 0; col < cols; col++) {
      r.push({ type: CellType.WALL });
    }
    grid.push(r);
  }
  return grid;
}

/**
 * Generates a "Pipe Maze" for Uninformed Search.
 * Strictly 1-cell wide corridors initially using Recursive Backtracking.
 * Then removes random walls to create multiple paths (Braided Maze).
 */
function generatePipeMaze(grid: AdvancedGrid, start: Position, end: Position) {
  const rows = grid.length;
  const cols = grid[0].length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      grid[r][c].type = CellType.WALL;
    }
  }

  const visited = new Set<string>();

  function carve(r: number, c: number) {
    visited.add(`${r}-${c}`);
    grid[r][c].type = CellType.EMPTY;

    const directions = [
      { dr: -2, dc: 0, mr: -1, mc: 0 }, // Up
      { dr: 0, dc: 2, mr: 0, mc: 1 },  // Right
      { dr: 2, dc: 0, mr: 1, mc: 0 },  // Down
      { dr: 0, dc: -2, mr: 0, mc: -1 }, // Left
    ].sort(() => Math.random() - 0.5);

    for (const { dr, dc, mr, mc } of directions) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && !visited.has(`${nr}-${nc}`)) {
        grid[r + mr][c + mc].type = CellType.EMPTY;
        carve(nr, nc);
      }
    }
  }

  carve(1, 1);

  // Post-process: Create multiple paths by removing some additional walls
  for (let r = 1; r < rows - 1; r++) {
    for (let c = 1; c < cols - 1; c++) {
      if (grid[r][c].type === CellType.WALL) {
        const horizontal = grid[r][c-1]?.type === CellType.EMPTY && grid[r][c+1]?.type === CellType.EMPTY;
        const vertical = grid[r-1]?.[c]?.type === CellType.EMPTY && grid[r+1]?.[c]?.type === CellType.EMPTY;
        
        if ((horizontal || vertical) && Math.random() < 0.15) {
          grid[r][c].type = CellType.EMPTY;
        }
      }
    }
  }

  grid[start.row][start.col].type = CellType.START;
  grid[end.row][end.col].type = CellType.END;
}

/**
 * Generates a "Complex Grid" for Informed Search.
 * Randomized obstacles with a formal outer wall border.
 * Designed to have many open paths but with higher wall density.
 */
function generateComplexMaze(grid: AdvancedGrid, start: Position, end: Position) {
  const rows = grid.length;
  const cols = grid[0].length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
        grid[r][c].type = CellType.WALL;
      } else if (Math.random() < 0.38) { // Increased density to 38% to reduce "blank space"
        grid[r][c].type = CellType.WALL;
      } else {
        grid[r][c].type = CellType.EMPTY;
      }
    }
  }

  // Ensure start and end are clear
  grid[start.row][start.col].type = CellType.START;
  grid[end.row][end.col].type = CellType.END;

  // Guarantee paths
  const createPath = (viaMid: boolean) => {
    let currR = start.row;
    let currC = start.col;
    const midR = Math.floor(rows / 2);
    const midC = Math.floor(cols / 2);

    const targetR = viaMid ? midR : end.row;
    const targetC = viaMid ? midC : end.col;

    while (currR !== targetR || currC !== targetC) {
      if (Math.random() < 0.5) {
        if (currR < targetR) currR++; else if (currR > targetR) currR--;
      } else {
        if (currC < targetC) currC++; else if (currC > targetC) currC--;
      }
      if (grid[currR][currC].type === CellType.WALL && currR > 0 && currR < rows - 1 && currC > 0 && currC < cols - 1) {
        grid[currR][currC].type = CellType.EMPTY;
      }
    }
    
    if (viaMid) {
      while (currR !== end.row || currC !== end.col) {
        if (Math.random() < 0.5) {
          if (currR < end.row) currR++; else if (currR > end.row) currR--;
        } else {
          if (currC < end.col) currC++; else if (currC > end.col) currC--;
        }
        if (grid[currR][currC].type === CellType.WALL && currR > 0 && currR < rows - 1 && currC > 0 && currC < cols - 1) {
          grid[currR][currC].type = CellType.EMPTY;
        }
      }
    }
  };

  createPath(false);
  createPath(true);
  
  grid[start.row][start.col].type = CellType.START;
  grid[end.row][end.col].type = CellType.END;
}

export function generateMaze(grid: AdvancedGrid, start: Position, end: Position, type: 'uninformed' | 'informed') {
  if (type === 'uninformed') {
    generatePipeMaze(grid, start, end);
  } else {
    generateComplexMaze(grid, start, end);
  }
}

function getNeighbors(grid: AdvancedGrid, pos: Position): Position[] {
  const neighbors: Position[] = [];
  const directions = [
    { r: -1, c: 0 }, // Top
    { r: 0, c: 1 },  // Right
    { r: 1, c: 0 },  // Bottom
    { r: 0, c: -1 }, // Left
  ];
  for (const d of directions) {
    const nr = pos.row + d.r;
    const nc = pos.col + d.c;
    if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[0].length && grid[nr][nc].type !== CellType.WALL) {
      neighbors.push({ row: nr, col: nc });
    }
  }
  return neighbors;
}

function bfs(grid: AdvancedGrid, start: Position, end: Position): SolveResult {
  const startTime = performance.now();
  const visitedInOrder: Position[] = [];
  const queue: Position[] = [start];
  const visited = new Set<string>();
  const parent = new Map<string, Position>();

  visited.add(`${start.row}-${start.col}`);

  while (queue.length > 0) {
    const current = queue.shift()!;
    visitedInOrder.push(current);

    if (current.row === end.row && current.col === end.col) break;

    for (const neighbor of getNeighbors(grid, current)) {
      const key = `${neighbor.row}-${neighbor.col}`;
      if (!visited.has(key)) {
        visited.add(key);
        parent.set(key, current);
        queue.push(neighbor);
      }
    }
  }

  const path = reconstructPath(parent, start, end);
  return {
    visitedInOrder,
    path,
    metrics: calculateMetrics(path, visitedInOrder, performance.now() - startTime)
  };
}

function dfs(grid: AdvancedGrid, start: Position, end: Position): SolveResult {
  const startTime = performance.now();
  const visitedInOrder: Position[] = [];
  const visited = new Set<string>();
  const parent = new Map<string, Position>();

  const stack: Position[] = [start];

  while (stack.length > 0) {
    const current = stack.pop()!;
    const key = `${current.row}-${current.col}`;

    if (visited.has(key)) continue;
    visited.add(key);
    visitedInOrder.push(current);

    if (current.row === end.row && current.col === end.col) break;

    const neighborDirs = [
      { r: 0, c: -1 }, // Left
      { r: 1, c: 0 },  // Bottom
      { r: 0, c: 1 },  // Right
      { r: -1, c: 0 }, // Top
    ];

    for (const d of neighborDirs) {
      const nr = current.row + d.r;
      const nc = current.col + d.c;
      if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[0].length && grid[nr][nc].type !== CellType.WALL) {
        const nKey = `${nr}-${nc}`;
        if (!visited.has(nKey)) {
          parent.set(nKey, current);
          stack.push({ row: nr, col: nc });
        }
      }
    }
  }

  const path = reconstructPath(parent, start, end);
  return {
    visitedInOrder,
    path,
    metrics: calculateMetrics(path, visitedInOrder, performance.now() - startTime)
  };
}

function dijkstra(grid: AdvancedGrid, start: Position, end: Position): SolveResult {
  const startTime = performance.now();
  const visitedInOrder: Position[] = [];
  const dist = new Map<string, number>();
  const parent = new Map<string, Position>();
  const pq: Position[] = [start];
  
  dist.set(`${start.row}-${start.col}`, 0);

  while (pq.length > 0) {
    pq.sort((a, b) => (dist.get(`${a.row}-${a.col}`) || Infinity) - (dist.get(`${b.row}-${b.col}`) || Infinity));
    const current = pq.shift()!;
    const currentKey = `${current.row}-${current.col}`;
    
    if (visitedInOrder.some(p => p.row === current.row && p.col === current.col)) continue;
    visitedInOrder.push(current);

    if (current.row === end.row && current.col === end.col) break;

    for (const neighbor of getNeighbors(grid, current)) {
      const nKey = `${neighbor.row}-${neighbor.col}`;
      const newDist = (dist.get(currentKey) || 0) + 1;
      if (newDist < (dist.get(nKey) ?? Infinity)) {
        dist.set(nKey, newDist);
        parent.set(nKey, current);
        pq.push(neighbor);
      }
    }
  }

  const path = reconstructPath(parent, start, end);
  return {
    visitedInOrder,
    path,
    metrics: calculateMetrics(path, visitedInOrder, performance.now() - startTime)
  };
}

function astar(grid: AdvancedGrid, start: Position, end: Position): SolveResult {
  const startTime = performance.now();
  const visitedInOrder: Position[] = [];
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  const parent = new Map<string, Position>();
  const openSet = new Set<string>();
  
  const h = (p: Position) => Math.abs(p.row - end.row) + Math.abs(p.col - end.col);
  
  const startKey = `${start.row}-${start.col}`;
  gScore.set(startKey, 0);
  fScore.set(startKey, h(start));
  
  const queue: Position[] = [start];
  openSet.add(startKey);

  while (queue.length > 0) {
    queue.sort((a, b) => {
      const fA = fScore.get(`${a.row}-${a.col}`)!;
      const fB = fScore.get(`${b.row}-${b.col}`)!;
      if (fA !== fB) return fA - fB;
      return h(a) - h(b); 
    });

    const current = queue.shift()!;
    const currentKey = `${current.row}-${current.col}`;
    openSet.delete(currentKey);
    
    if (visitedInOrder.some(p => p.row === current.row && p.col === current.col)) continue;
    visitedInOrder.push(current);

    if (current.row === end.row && current.col === end.col) break;

    for (const neighbor of getNeighbors(grid, current)) {
      const nKey = `${neighbor.row}-${neighbor.col}`;
      const tentativeG = (gScore.get(currentKey) || 0) + 1;
      
      if (tentativeG < (gScore.get(nKey) ?? Infinity)) {
        parent.set(nKey, current);
        gScore.set(nKey, tentativeG);
        fScore.set(nKey, tentativeG + h(neighbor));
        if (!openSet.has(nKey)) {
          queue.push(neighbor);
          openSet.add(nKey);
        }
      }
    }
  }

  const path = reconstructPath(parent, start, end);
  return {
    visitedInOrder,
    path,
    metrics: calculateMetrics(path, visitedInOrder, performance.now() - startTime)
  };
}

function reconstructPath(parent: Map<string, Position>, start: Position, end: Position): Position[] {
  const path: Position[] = [];
  let curr: Position | undefined = end;
  
  while (curr) {
    path.unshift(curr);
    if (curr.row === start.row && curr.col === start.col) break;
    curr = parent.get(`${curr.row}-${curr.col}`);
  }
  
  return path.length > 1 && path[0].row === start.row && path[0].col === start.col ? path : [];
}

function calculateMetrics(path: Position[], visited: Position[], time: number): AlgorithmMetrics {
  return {
    executionTime: Math.round(time * 100) / 100,
    nodesVisited: visited.length,
    pathLength: path.length,
  };
}

export function solve(algorithm: string, grid: AdvancedGrid, start: Position, end: Position): SolveResult {
  switch (algorithm) {
    case 'bfs': return bfs(grid, start, end);
    case 'dfs': return dfs(grid, start, end);
    case 'dijkstra': return dijkstra(grid, start, end);
    case 'astar': return astar(grid, start, end);
    default: return { visitedInOrder: [], path: [], metrics: { executionTime: 0, nodesVisited: 0, pathLength: 0 } };
  }
}

export function clearAdvancedGrid(grid: AdvancedGrid): AdvancedGrid {
  return grid.map(row => row.map(cell => {
    if ([CellType.VISITED, CellType.PATH, CellType.PLAYER_PATH, CellType.FRONTIER].includes(cell.type)) {
      return { ...cell, type: CellType.EMPTY };
    }
    return { ...cell };
  }));
}