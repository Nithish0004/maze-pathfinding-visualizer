'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AlgorithmMetrics } from '@/lib/types';
import { BarChart3 } from 'lucide-react';

export default function MetricsPanel({ metrics, title = "Results" }: { metrics: AlgorithmMetrics, title?: string }) {
  return (
    <Card className="w-full bg-card/40 backdrop-blur-md border-primary/10 relative overflow-hidden">
      {/* Decorative Metrics Sticker */}
      <div className="absolute right-2 top-2 opacity-5 pointer-events-none">
        <BarChart3 className="w-8 h-8 text-primary" />
      </div>

      <CardHeader className="py-3 px-4 text-center">
        <CardTitle className="text-sm font-bold flex items-center justify-center gap-2">
          <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-4 py-3 px-4 text-xs text-center">
        <div className="space-y-1">
          <p className="text-muted-foreground font-medium uppercase tracking-tighter text-[9px]">Sim. Duration</p>
          <p className="font-mono font-bold text-primary text-sm">{(metrics.executionTime / 1000).toFixed(2)}s</p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground font-medium uppercase tracking-tighter text-[9px]">Nodes Explored</p>
          <p className="font-mono font-bold text-primary text-sm">{metrics.nodesVisited}</p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground font-medium uppercase tracking-tighter text-[9px]">Path Length</p>
          <p className="font-mono font-bold text-primary text-sm">{metrics.pathLength}</p>
        </div>
      </CardContent>
    </Card>
  );
}