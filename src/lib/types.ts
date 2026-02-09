export enum CellType {
  EMPTY,
  WALL,
  START,
  END,
  VISITED,
  PATH,
  PLAYER_PATH,
  FRONTIER,
}

export type Grid = CellType[][];

export type Position = {
  row: number;
  col: number;
};

export type AlgorithmMetrics = {
  executionTime: number; // Now represents real-world simulation duration in ms
  nodesVisited: number;
  pathLength: number;
};

export type SolveResult = {
  visitedInOrder: Position[];
  path: Position[];
  metrics: AlgorithmMetrics;
};

export type GridCell = {
  type: CellType;
};

export type AdvancedGrid = GridCell[][];

export type AlgorithmInfo = {
  name: string;
  description: string;
  bestFor: string;
};

export const ALGORITHM_DATA: Record<string, AlgorithmInfo> = {
  bfs: {
    name: "Breadth-First Search",
    description: "Explores neighbors layer-by-layer. It is 'uninformed' but guaranteed to find the shortest path.",
    bestFor: "Shortest path on unweighted grids."
  },
  dfs: {
    name: "Depth-First Search",
    description: "Goes as deep as possible along a branch before backtracking. High directional priority.",
    bestFor: "Exploring large areas, but doesn't guarantee the shortest path."
  },
  dijkstra: {
    name: "Dijkstra's Algorithm",
    description: "A classic informed search that explores nodes based on the lowest cost from the start.",
    bestFor: "Weighted grids and uniform shortest-path discovery."
  },
  astar: {
    name: "A* Search",
    description: "Uses a heuristic (Manhattan distance) to estimate the cost to the goal, making it highly efficient.",
    bestFor: "Smart, fast navigation towards a specific target."
  }
};
