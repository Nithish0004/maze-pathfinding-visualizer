import { Cpu, Activity, Zap, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Header() {
  return (
    <header className="relative border-b bg-background/60 backdrop-blur-md supports-[backdrop-filter]:bg-background/40 z-20">
      <div className="container mx-auto px-4 py-8 md:py-12 relative">
        {/* Top Left Creative Tech Stickers */}
        <div className="absolute left-4 top-4 hidden lg:flex flex-col gap-3 animate-in slide-in-from-left-4 duration-700">
          <div className="p-2.5 bg-primary/10 backdrop-blur-md rounded-2xl shadow-sm border border-primary/20 rotate-[-6deg] hover:rotate-0 transition-transform cursor-default group">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-tighter text-primary/80 leading-none">Pathfinding Lab</span>
                <span className="text-[8px] font-mono text-muted-foreground">v2.4.0-stable</span>
              </div>
            </div>
          </div>
          <div className="ml-4 p-2 bg-secondary/80 backdrop-blur-md rounded-xl shadow-lg border border-border rotate-[3deg] hover:rotate-0 transition-transform cursor-default group">
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-amber-500" />
              <span className="text-[9px] font-bold uppercase tracking-widest">Optimized Engine</span>
            </div>
          </div>
        </div>

        {/* Top Right Creative Tech Stickers & Theme Toggle */}
        <div className="absolute right-4 top-4 flex items-center gap-4 animate-in slide-in-from-right-4 duration-700">
          <div className="hidden lg:flex flex-col items-end gap-2">
            <div className="p-2 bg-green-500/10 backdrop-blur-md rounded-xl shadow-inner border border-green-500/20 rotate-[4deg] hover:rotate-0 transition-transform cursor-default">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-tighter text-green-600/80">Live Simulation</span>
              </div>
            </div>
            <div className="mr-4 p-1.5 bg-primary/5 rounded-lg border border-primary/10 -rotate-[2deg] flex items-center gap-1.5">
               <ShieldCheck className="w-3 h-3 text-primary/60" />
               <span className="text-[8px] font-mono opacity-60">Verified Algorithms</span>
            </div>
          </div>
          <div className="relative z-20">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-center gap-6 relative z-10">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter text-primary whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-b from-primary to-primary/70 filter drop-shadow-sm">
              PathFinder Visualizer
            </h1>
            <div className="flex items-center justify-center gap-4">
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-primary/30" />
              <p className="text-muted-foreground max-w-xl mx-auto text-xs md:text-sm font-black uppercase tracking-[0.3em] opacity-60">
                Interactive Algorithm Laboratory
              </p>
              <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-primary/30" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}