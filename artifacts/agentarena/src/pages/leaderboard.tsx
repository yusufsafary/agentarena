import { useGame } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatSol, formatAddress } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function Leaderboard() {
  const { users, boards, tiles } = useGame();

  const sortedUsers = [...users].sort((a, b) => b.balance - a.balance).slice(0, 10);
  
  const sortedBoards = [...boards].sort((a, b) => b.totalVolume - a.totalVolume);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold uppercase tracking-tighter mb-2">Global Leaderboard</h1>
        <p className="text-muted-foreground font-mono">The biggest bags and the hottest grids.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="bg-muted">
            <CardTitle>Top Holders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y-2 divide-border">
              {sortedUsers.map((user, idx) => {
                const userTiles = tiles.filter(t => t.ownerId === user.id).length;
                return (
                  <div key={user.id} className={cn("p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors", idx === 0 && "bg-accent/10")}>
                    <div className="font-mono font-bold text-xl w-8 text-muted-foreground">
                      #{idx + 1}
                    </div>
                    <img src={user.avatar} alt="avatar" className="w-10 h-10 border border-border bg-background" />
                    <div className="flex-1">
                      <div className="font-bold">{user.name}</div>
                      <div className="text-xs font-mono text-muted-foreground">{formatAddress(user.id)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">{formatSol(user.balance)}</div>
                      <div className="text-xs font-mono text-muted-foreground">{userTiles} tiles</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] h-fit">
          <CardHeader className="bg-muted">
            <CardTitle>Top Arenas by Volume</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y-2 divide-border">
              {sortedBoards.map((board, idx) => {
                return (
                  <div key={board.id} className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                    <div className="font-mono font-bold text-xl w-8 text-muted-foreground">
                      #{idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg uppercase tracking-tight">{board.name}</div>
                      <div className="text-xs font-mono text-muted-foreground">{board.size}x{board.size} Grid</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-accent-foreground">{formatSol(board.totalVolume)}</div>
                      <div className="text-xs font-mono text-muted-foreground">Vol</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
