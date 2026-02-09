'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Play,
  RotateCw,
  Grid as GridIcon,
  Lightbulb,
  ArrowRightLeft,
  User,
  Info,
  Layers
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ALGORITHM_DATA } from '@/lib/types';
import { cn } from '@/lib/utils';

type ControlsProps = {
  level: number;
  algorithm: string;
  setAlgorithm: (algo: string) => void;
  category: string;
  setCategory: (cat: string) => void;
  speed: number;
  setSpeed: (speed: number) => void;
  isManualMode: boolean;
  setIsManualMode: (m: boolean) => void;
  comparisonMode: boolean;
  setComparisonMode: (c: boolean) => void;
  isVisualizing: boolean;
  isVisualizationComplete: boolean;
  onVisualize: () => void;
  onGenerateMaze: () => void;
  onReset: () => void;
  onShowSolution: () => void;
};

export default function Controls({
  level,
  algorithm,
  setAlgorithm,
  category,
  setCategory,
  speed,
  setSpeed,
  isManualMode,
  setIsManualMode,
  comparisonMode,
  setComparisonMode,
  isVisualizing,
  isVisualizationComplete,
  onVisualize,
  onGenerateMaze,
  onReset,
  onShowSolution,
}: ControlsProps) {

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    if (val === 'uninformed') {
      setAlgorithm('bfs');
    } else {
      setAlgorithm('dijkstra');
    }
  };

  const currentAlgo = ALGORITHM_DATA[algorithm];

  return (
    <Card className="w-full lg:w-96 lg:max-w-sm flex-shrink-0 shadow-xl border-t-4 border-t-primary bg-card/60 backdrop-blur-md relative overflow-hidden">
      {/* Decorative Control Sticker */}
      <div className="absolute -right-6 top-10 rotate-12 opacity-5 pointer-events-none">
        <Layers className="w-24 h-24 text-primary" />
      </div>

      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold tracking-tight">PathFinder</CardTitle>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black uppercase">Level {level}</div>
        </div>
        <CardDescription>
          Master algorithms through visualization.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/10 transition-all hover:bg-primary/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div>
              <Label htmlFor="manual-mode" className="text-sm font-bold block">Manual Play</Label>
              <span className="text-[10px] text-muted-foreground uppercase font-medium">Use arrow keys</span>
            </div>
          </div>
          <Switch 
            id="manual-mode" 
            checked={isManualMode} 
            onCheckedChange={setIsManualMode} 
            disabled={isVisualizing}
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
              <Info className="w-3 h-3" />
              Configuration
            </Label>
            <div className="flex items-center space-x-2 p-1">
              <Switch id="compare" checked={comparisonMode} onCheckedChange={setComparisonMode} disabled={isVisualizing} />
              <Label htmlFor="compare" className="text-sm font-medium">Dual Algorithm Mode</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Search Category</Label>
            <Select value={category} onValueChange={handleCategoryChange} disabled={isVisualizing}>
              <SelectTrigger className="h-11 font-medium bg-background/50 backdrop-blur-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uninformed">Uninformed Search (BFS/DFS)</SelectItem>
                <SelectItem value="informed">Informed Search (A*/Dijkstra)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!comparisonMode && (
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Algorithm</Label>
              <RadioGroup value={algorithm} onValueChange={setAlgorithm} className="grid grid-cols-2 gap-2" disabled={isVisualizing}>
                {category === 'uninformed' ? (
                  <>
                    <div className={cn("flex items-center space-x-2 p-2 border rounded-lg transition-all", algorithm === 'bfs' ? "bg-primary/10 border-primary" : "hover:bg-muted/50")}>
                      <RadioGroupItem value="bfs" id="bfs" />
                      <Label htmlFor="bfs" className="text-xs font-bold cursor-pointer w-full">BFS</Label>
                    </div>
                    <div className={cn("flex items-center space-x-2 p-2 border rounded-lg transition-all", algorithm === 'dfs' ? "bg-primary/10 border-primary" : "hover:bg-muted/50")}>
                      <RadioGroupItem value="dfs" id="dfs" />
                      <Label htmlFor="dfs" className="text-xs font-bold cursor-pointer w-full">DFS</Label>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={cn("flex items-center space-x-2 p-2 border rounded-lg transition-all", algorithm === 'dijkstra' ? "bg-primary/10 border-primary" : "hover:bg-muted/50")}>
                      <RadioGroupItem value="dijkstra" id="dijkstra" />
                      <Label htmlFor="dijkstra" className="text-xs font-bold cursor-pointer w-full">Dijkstra</Label>
                    </div>
                    <div className={cn("flex items-center space-x-2 p-2 border rounded-lg transition-all", algorithm === 'astar' ? "bg-primary/10 border-primary" : "hover:bg-muted/50")}>
                      <RadioGroupItem value="astar" id="astar" />
                      <Label htmlFor="astar" className="text-xs font-bold cursor-pointer w-full">A* Search</Label>
                    </div>
                  </>
                )}
              </RadioGroup>
              
              {currentAlgo && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-border/50 animate-in fade-in slide-in-from-top-1 backdrop-blur-sm">
                   <p className="text-[11px] font-bold text-primary mb-1 uppercase tracking-tight">{currentAlgo.name}</p>
                   <p className="text-[10px] text-muted-foreground leading-relaxed">{currentAlgo.description}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <Label htmlFor="speed-slider" className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Speed</Label>
            <span className="text-[10px] font-mono text-primary font-bold">{speed}%</span>
          </div>
          <Slider
            id="speed-slider"
            min={1}
            max={100}
            step={1}
            value={[speed]}
            onValueChange={(value) => setSpeed(value[0])}
            disabled={isVisualizing}
            className="cursor-pointer"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            onClick={onShowSolution}
            disabled={isVisualizing || isVisualizationComplete || isManualMode}
            variant="outline"
            className="w-full h-11 font-bold bg-background/50 backdrop-blur-sm"
            >
            <Lightbulb className="w-4 h-4 mr-2 text-amber-500" />
            Solution
          </Button>
          <Button
            onClick={onVisualize}
            disabled={isVisualizing || isVisualizationComplete || isManualMode}
            className="w-full h-11 font-bold shadow-lg shadow-primary/20"
          >
            {comparisonMode ? <ArrowRightLeft className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {comparisonMode ? "Compare" : "Start"}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={onReset} disabled={isVisualizing} className="w-full font-bold bg-background/50 backdrop-blur-sm">
            <RotateCw className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button
            variant="destructive"
            onClick={onGenerateMaze}
            disabled={isVisualizing}
            className="w-full font-bold shadow-lg shadow-destructive/10"
            >
            <GridIcon className="w-4 h-4 mr-2" />
            New Maze
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}