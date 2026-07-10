import { useGame } from "@/lib/store";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { formatSol } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useState } from "react";

type SortKey = 'volume' | 'multiplier' | 'cut' | 'occupancy';

function MiniGrid({ boardId, size, tiles }: { boardId: string; size: number; tiles: any[] }) {
  const boardTiles = tiles.filter(t => t.boardId === boardId);
  const displaySize = Math.min(size, 8);
  const displayTiles = boardTiles.slice(0, displaySize * displaySize);

  return (
    <div
      className="grid gap-px bg-border p-px border border-border"
      style={{ gridTemplateColumns: `repeat(${displaySize}, 1fr)`, width: `${displaySize * 12}px` }}
    >
      {displayTiles.map(tile => (
        <div
          key={tile.id}
          className={cn(
            "w-3 h-3",
            tile.ownerId ? (tile.purchaseCount > 2 ? "bg-accent" : "bg-primary/70") : "bg-background"
          )}
        />
      ))}
    </div>
  );
}

export default function Lobby() {
  const { boards, tiles, activity } = useGame();
  const [sortBy, setSortBy] = useState<SortKey>('volume');

  const totalVolume = boards.reduce((s, b) => s + b.totalVolume, 0);
  const totalTrades = activity.length;
  const ownedTiles = tiles.filter(t => t.ownerId !== null).length;

  const sortedBoards = [...boards].sort((a, b) => {
    if (sortBy === 'volume') return b.totalVolume - a.totalVolume;
    if (sortBy === 'multiplier') return b.growthFactor - a.growthFactor;
    if (sortBy === 'cut') return b.cutPercentage - a.cutPercentage;
    if (sortBy === 'occupancy') {
      const aTiles = tiles.filter(t => t.boardId === a.id);
      const bTiles = tiles.filter(t => t.boardId === b.id);
      const aOcc = aTiles.filter(t => t.ownerId).length / (aTiles.length || 1);
      const bOcc = bTiles.filter(t => t.ownerId).length / (bTiles.length || 1);
      return bOcc - aOcc;
    }
    return 0;
  });

  const hotBoardId = [...boards].sort((a, b) => b.totalVolume - a.totalVolume)[0]?.id;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-bold uppercase tracking-tighter">Active Arenas</h1>
          <p className="text-muted-foreground font-mono mt-2">Pick your poison. Higher multipliers mean faster burns.</p>
        </div>
        <Link href="/simulator">
          <Button variant="outline" size="sm" className="font-mono uppercase font-bold border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            ⚡ Run Simulator
          </Button>
        </Link>
      </div>

      {/* Global Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Volume', value: formatSol(totalVolume), color: 'text-primary' },
          { label: 'Live Trades', value: `${totalTrades}`, color: 'text-secondary' },
          { label: 'Tiles Claimed', value: `${ownedTiles} / ${tiles.length}`, color: 'text-accent-foreground' },
          { label: 'Arenas Open', value: `${boards.length}`, color: 'text-foreground' },
        ].map(stat => (
          <div key={stat.label} className="p-3 border-2 border-border bg-card shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-mono">
            <div className={cn("text-xl font-bold", stat.color)}>{stat.value}</div>
            <div className="text-xs text-muted-foreground uppercase">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-mono text-xs uppercase text-muted-foreground">Sort by:</span>
        {(['volume', 'multiplier', 'cut', 'occupancy'] as SortKey[]).map(key => (
          <button
            key={key}
            onClick={() => setSortBy(key)}
            className={cn(
              "px-3 py-1 font-mono text-xs uppercase font-bold border-2 border-border transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]",
              sortBy === key ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
            )}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Board Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedBoards.map(board => {
          const boardTiles = tiles.filter(t => t.boardId === board.id);
          const ownedTiles = boardTiles.filter(t => t.ownerId !== null);
          const floorPrice = boardTiles.length > 0 ? Math.min(...boardTiles.map(t => t.price)) : 0;
          const ceilPrice = boardTiles.length > 0 ? Math.max(...boardTiles.map(t => t.price)) : 0;
          const pct = boardTiles.length > 0 ? (ownedTiles.length / boardTiles.length) : 0;
          const isHot = board.id === hotBoardId && board.totalVolume > 0;

          const riskLevel = board.growthFactor >= 1.4 ? 'HIGH' : board.growthFactor >= 1.15 ? 'MED' : 'LOW';
          const riskColor = riskLevel === 'HIGH'
            ? 'bg-destructive/10 text-destructive border-destructive'
            : riskLevel === 'MED'
              ? 'bg-accent/10 text-accent-foreground border-accent'
              : 'bg-primary/10 text-primary border-primary';

          const recentActivity = activity.filter(a => a.boardId === board.id).slice(0, 3);

          return (
            <Card key={board.id} className="flex flex-col border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
              <CardHeader className="pb-2 bg-muted border-b-2 border-border">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl uppercase tracking-tight flex items-center gap-2">
                      {board.name}
                      {isHot && (
                        <span className="text-xs font-mono bg-destructive text-destructive-foreground px-2 py-0.5 font-bold animate-pulse">
                          HOT
                        </span>
                      )}
                    </CardTitle>
                    <p className="font-mono text-xs text-muted-foreground mt-1">{board.size}×{board.size} Grid, {boardTiles.length} tiles</p>
                  </div>
                  <MiniGrid boardId={board.id} size={board.size} tiles={tiles} />
                </div>
              </CardHeader>

              <CardContent className="flex-1 pt-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 font-mono text-sm mb-4">
                  <div>
                    <div className="text-muted-foreground text-xs mb-0.5">Floor Price</div>
                    <div className="font-bold">{boardTiles.length > 0 ? formatSol(floorPrice) : '---'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-0.5">Ceiling Price</div>
                    <div className="font-bold text-destructive">{boardTiles.length > 0 && ceilPrice > floorPrice ? formatSol(ceilPrice) : '---'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-0.5">Pump</div>
                    <div className="font-bold text-secondary">{board.growthFactor}x per buy</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-0.5">Your Cut</div>
                    <div className="font-bold text-primary">{(board.cutPercentage * 100).toFixed(0)}% of sale</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-0.5">Volume</div>
                    <div className="font-bold">{formatSol(board.totalVolume)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-0.5">Risk</div>
                    <span className={cn("text-xs font-bold px-2 py-0.5 border font-mono", riskColor)}>
                      {riskLevel}
                    </span>
                  </div>
                </div>

                {/* Occupancy bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs font-mono mb-1 text-muted-foreground">
                    <span>Occupancy</span>
                    <span className="font-bold">{ownedTiles.length} / {boardTiles.length}</span>
                  </div>
                  <div className="w-full h-2 bg-muted border border-border overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${pct * 100}%` }}
                    />
                  </div>
                </div>

                {/* Recent activity */}
                {recentActivity.length > 0 && (
                  <div className="space-y-1">
                    <p className="font-mono text-xs uppercase text-muted-foreground">Recent</p>
                    {recentActivity.map(act => (
                      <div key={act.id} className="flex justify-between font-mono text-xs">
                        <span className="text-muted-foreground truncate">Buy @ [{act.tileId?.split('-').slice(1).join(',') ?? '?'}]</span>
                        <span className="text-primary font-bold">{formatSol(act.price)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>

              <CardFooter className="border-t-2 border-border pt-4">
                <Link href={`/arena/${board.id}`} className="w-full">
                  <Button className="w-full font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all">
                    Enter Arena →
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Footer nudge */}
      <div className="text-center font-mono text-sm text-muted-foreground border-t-2 border-border pt-6">
        New here?{" "}
        <Link href="/how-it-works" className="text-primary font-bold hover:underline underline-offset-4">
          Learn how it works →
        </Link>
        {" "}or{" "}
        <Link href="/simulator" className="text-secondary font-bold hover:underline underline-offset-4">
          run the simulator first →
        </Link>
      </div>
    </div>
  );
}
