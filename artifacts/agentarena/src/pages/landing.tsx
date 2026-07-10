import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useGame } from "@/lib/store";
import { formatSol, formatAddress } from "@/lib/utils";
import { cn } from "@/lib/utils";

const TAGLINES = [
  "Tax the next guy.",
  "Profit from being replaced.",
  "The bag grows. Someone holds it.",
  "Hot potato. Guaranteed yield.",
];

function LiveTicker() {
  const { activity, users } = useGame();
  const latest = activity.slice(0, 6);

  if (latest.length === 0) {
    return (
      <div className="border-t-2 border-b-2 border-border bg-muted overflow-hidden py-2">
        <div className="flex items-center gap-6 font-mono text-xs text-muted-foreground animate-pulse px-4">
          <span className="text-primary font-bold uppercase">● LIVE</span>
          <span>Waiting for first move... Connect a wallet and grab a tile.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t-2 border-b-2 border-border bg-background overflow-hidden py-2 relative">
      <div className="flex items-center gap-0">
        <div className="flex-shrink-0 bg-primary text-primary-foreground px-3 py-1 font-mono text-xs font-bold uppercase border-r-2 border-border mr-4 z-10">
          ● LIVE
        </div>
        <div className="overflow-hidden">
          <div
            className="flex gap-8 whitespace-nowrap"
            style={{
              animation: `ticker ${Math.max(latest.length * 4, 16)}s linear infinite`,
            }}
          >
            {[...latest, ...latest].map((act, i) => {
              const buyer = users.find(u => u.id === act.buyerId)?.name || formatAddress(act.buyerId);
              return (
                <span key={`${act.id}-${i}`} className="font-mono text-xs">
                  <span className="text-muted-foreground">#{i % latest.length + 1}</span>
                  {" "}
                  <span className="font-bold">{buyer}</span>
                  {" "}
                  <span className="text-muted-foreground">bought a tile for</span>
                  {" "}
                  <span className="text-primary font-bold">{formatSol(act.price)}</span>
                  {" "}
                  <span className="text-muted-foreground/40">·</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

function AnimatedGrid() {
  const { tiles } = useGame();
  const displayTiles = tiles.filter(t => t.boardId === 'b1').slice(0, 64);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none select-none" aria-hidden>
      <div
        className="grid gap-1 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-12 scale-150"
        style={{ gridTemplateColumns: 'repeat(8, 1fr)', width: '560px' }}
      >
        {Array.from({ length: 64 }).map((_, i) => {
          const tile = displayTiles[i];
          const isOwned = tile?.ownerId != null;
          return (
            <div
              key={i}
              className={cn(
                "w-16 h-16 border border-border transition-colors duration-700",
                isOwned ? "bg-primary" : "bg-muted",
                tick % 7 === i % 7 && isOwned && "bg-accent",
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

function StatBadge({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex flex-col items-center px-6 py-3 border-2 border-border bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className={cn("text-2xl font-bold font-mono", color || "text-primary")}>{value}</div>
      <div className="text-xs font-mono uppercase text-muted-foreground">{label}</div>
    </div>
  );
}

export default function Landing() {
  const { boards, tiles, activity } = useGame();
  const [tagline, setTagline] = useState(0);

  const totalOwned = tiles.filter(t => t.ownerId !== null).length;
  const totalTiles = tiles.length;
  const totalVolume = boards.reduce((s, b) => s + b.totalVolume, 0);

  useEffect(() => {
    const id = setInterval(() => setTagline(t => (t + 1) % TAGLINES.length), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center text-center space-y-0 -mt-8">
      {/* Hero */}
      <div className="relative w-full min-h-[70vh] flex flex-col items-center justify-center overflow-hidden py-20">
        <AnimatedGrid />
        <div className="relative z-10 space-y-6 max-w-3xl px-4">
          <div className="inline-block px-4 py-1.5 bg-accent text-accent-foreground font-mono text-sm font-bold uppercase border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rotate-[-2deg]">
            The On-Chain Tile War
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-[0.9]">
            Own the grid. <br />
            <span
              className="text-primary transition-all duration-500 block"
              key={tagline}
              style={{ animation: 'fadeSlideIn 0.4s ease both' }}
            >
              {TAGLINES[tagline]}
            </span>
          </h1>

          <p className="text-xl text-muted-foreground font-mono max-w-2xl mx-auto">
            Buy a tile. Watch the price pump. When someone takes your spot, you get a cut.
            A fast, reckless game of hot potato played on shared grids.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/arena" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 bg-primary text-black hover:bg-primary/90 font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all">
                Enter the Lobby →
              </Button>
            </Link>
            <Link href="/simulator" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all">
                Run the Simulator
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Live Ticker */}
      <div className="w-full">
        <LiveTicker />
      </div>

      {/* Live Stats */}
      <div className="w-full max-w-4xl px-4 py-10">
        <div className="flex flex-wrap justify-center gap-4">
          <StatBadge label="Active Arenas" value={`${boards.length}`} />
          <StatBadge label="Tiles Claimed" value={`${totalOwned} / ${totalTiles}`} color="text-secondary" />
          <StatBadge label="Total Volume" value={formatSol(totalVolume)} color="text-accent-foreground" />
          <StatBadge label="Live Trades" value={`${activity.length}`} color="text-primary" />
        </div>
      </div>

      {/* How It Works Cards */}
      <div className="w-full max-w-5xl px-4 pb-12">
        <h2 className="text-2xl font-bold uppercase tracking-tighter mb-6 text-left">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 border-2 border-border bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
            <div className="text-4xl font-bold font-mono text-muted-foreground/30 mb-3">01</div>
            <h3 className="text-xl font-bold uppercase mb-2">Claim Territory</h3>
            <p className="font-mono text-sm text-muted-foreground">
              Pick an open tile or steal an owned one. Pay the current price to take control. The tile is yours until someone outbids you.
            </p>
          </div>
          <div className="p-6 border-2 border-border bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
            <div className="text-4xl font-bold font-mono text-secondary/40 mb-3">02</div>
            <h3 className="text-xl font-bold uppercase mb-2">Price Pumps</h3>
            <p className="font-mono text-sm text-muted-foreground">
              Every purchase increases the tile's price by a hardcoded multiplier. The longer the game runs, the heavier the bags get. There's no ceiling.
            </p>
          </div>
          <div className="p-6 border-2 border-border bg-accent text-accent-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
            <div className="text-4xl font-bold font-mono text-black/20 mb-3">03</div>
            <h3 className="text-xl font-bold uppercase mb-2">Earn Yield</h3>
            <p className="font-mono text-sm opacity-90">
              When a buyer kicks you out, you get a fat, guaranteed percentage of whatever they just paid. You win by getting dumped on.
            </p>
          </div>
        </div>
      </div>

      {/* Arena previews */}
      <div className="w-full max-w-5xl px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold uppercase tracking-tighter">Active Arenas</h2>
          <Link href="/arena" className="font-mono text-sm text-primary hover:underline underline-offset-4 uppercase">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {boards.map((board, idx) => {
            const boardTiles = tiles.filter(t => t.boardId === board.id);
            const ownedCount = boardTiles.filter(t => t.ownerId !== null).length;
            const pct = boardTiles.length > 0 ? (ownedCount / boardTiles.length) : 0;
            const riskLevel = board.growthFactor >= 1.4 ? 'HIGH' : board.growthFactor >= 1.15 ? 'MED' : 'LOW';
            const riskColor = riskLevel === 'HIGH' ? 'text-destructive' : riskLevel === 'MED' ? 'text-accent-foreground' : 'text-primary';

            return (
              <div key={board.id} className="border-2 border-border bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col">
                <div className="p-4 border-b-2 border-border bg-muted flex items-center justify-between">
                  <span className="font-bold uppercase text-lg tracking-tight">{board.name}</span>
                  <span className={cn("font-mono text-xs font-bold px-2 py-1 border border-current", riskColor)}>
                    {riskLevel} RISK
                  </span>
                </div>
                <div className="p-4 flex-1 font-mono text-sm grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-muted-foreground text-xs mb-1">Grid</div>
                    <div className="font-bold">{board.size}×{board.size}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-1">Pump</div>
                    <div className="font-bold text-secondary">{board.growthFactor}x</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-1">Your Cut</div>
                    <div className="font-bold text-primary">{(board.cutPercentage * 100).toFixed(0)}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-1">Volume</div>
                    <div className="font-bold">{formatSol(board.totalVolume)}</div>
                  </div>
                </div>
                <div className="px-4 pb-2">
                  <div className="flex justify-between text-[10px] font-mono mb-1 text-muted-foreground">
                    <span>Occupancy</span>
                    <span>{ownedCount}/{boardTiles.length}</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted border border-border">
                    <div className="h-full bg-primary transition-all" style={{ width: `${pct * 100}%` }} />
                  </div>
                </div>
                <div className="p-4 border-t-2 border-border">
                  <Link href={`/arena/${board.id}`}>
                    <Button className="w-full font-bold uppercase text-sm">Enter Arena</Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Risk Disclaimer */}
      <div className="w-full max-w-5xl px-4 pb-8">
        <div className="p-4 border-2 border-border bg-muted font-mono text-xs text-muted-foreground text-center">
          <span className="font-bold uppercase text-foreground">SIMULATION ONLY.</span> No real assets. No real wallets. No real transactions. This is a game. Play stupid games, win stupid prizes.
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
