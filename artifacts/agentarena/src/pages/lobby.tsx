import { useGame } from "@/lib/store";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { formatSol } from "@/lib/utils";

export default function Lobby() {
  const { boards, tiles } = useGame();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-bold uppercase tracking-tighter">Active Arenas</h1>
          <p className="text-muted-foreground font-mono mt-2">Pick your poison. Higher multipliers mean faster burns.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boards.map(board => {
          const boardTiles = tiles.filter(t => t.boardId === board.id);
          const ownedTiles = boardTiles.filter(t => t.ownerId !== null);
          const floorPrice = boardTiles.length > 0 ? Math.min(...boardTiles.map(t => t.price)) : 0;
          
          return (
            <Card key={board.id} className="flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl">{board.name}</CardTitle>
                  <div className="px-2 py-1 bg-primary/10 text-primary border border-primary font-mono text-xs font-bold">
                    {board.size}x{board.size}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="grid grid-cols-2 gap-4 font-mono text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Floor Price</div>
                    <div className="font-bold">{boardTiles.length > 0 ? formatSol(floorPrice) : '---'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Volume</div>
                    <div className="font-bold">{formatSol(board.totalVolume)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Multiplier</div>
                    <div className="font-bold text-accent-foreground">{board.growthFactor}x</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Owner Cut</div>
                    <div className="font-bold text-primary">{board.cutPercentage * 100}%</div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex justify-between text-xs font-mono mb-2">
                    <span>Occupancy</span>
                    <span>{ownedTiles.length} / {boardTiles.length > 0 ? boardTiles.length : '---'}</span>
                  </div>
                  <div className="w-full h-2 bg-muted border border-border">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: boardTiles.length > 0 ? `${(ownedTiles.length / boardTiles.length) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/arena/${board.id}`} className="w-full">
                  <Button className="w-full">Enter Arena</Button>
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
