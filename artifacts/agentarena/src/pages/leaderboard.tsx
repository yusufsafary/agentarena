import { useGame } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatSol, formatAddress } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid
} from "recharts";
import { Link } from "wouter";

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-xl" title="1st">🥇</span>;
  if (rank === 2) return <span className="text-xl" title="2nd">🥈</span>;
  if (rank === 3) return <span className="text-xl" title="3rd">🥉</span>;
  return <span className="font-mono font-bold text-muted-foreground text-sm w-6 text-center">#{rank}</span>;
}

export default function Leaderboard() {
  const { users, boards, tiles, activity, wallet } = useGame();
  const [tab, setTab] = useState<'players' | 'arenas' | 'activity'>('players');

  const sortedUsers = useMemo(() =>
    [...users].sort((a, b) => b.balance - a.balance).slice(0, 15),
    [users]
  );

  const sortedBoards = useMemo(() =>
    [...boards].sort((a, b) => b.totalVolume - a.totalVolume),
    [boards]
  );

  const totalVolume = boards.reduce((s, b) => s + b.totalVolume, 0);
  const totalTrades = activity.length;

  const chartData = sortedUsers.slice(0, 8).map(u => ({
    name: u.name.slice(0, 10),
    balance: parseFloat((u.balance / 1e9).toFixed(2)),
    tiles: tiles.filter(t => t.ownerId === u.id).length,
  }));

  const boardChartData = sortedBoards.map(b => ({
    name: b.name,
    volume: parseFloat((b.totalVolume / 1e9).toFixed(3)),
    trades: activity.filter(a => a.boardId === b.id).length,
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold uppercase tracking-tighter mb-2">Global Leaderboard</h1>
        <p className="text-muted-foreground font-mono">The biggest bags and the hottest grids.</p>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Traders', value: `${users.length}`, color: 'text-foreground' },
          { label: 'Global Volume', value: formatSol(totalVolume), color: 'text-primary' },
          { label: 'Total Trades', value: `${totalTrades}`, color: 'text-secondary' },
          { label: 'Active Arenas', value: `${boards.length}`, color: 'text-accent-foreground' },
        ].map(stat => (
          <div key={stat.label} className="p-3 border-2 border-border bg-card shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-mono">
            <div className={cn("text-xl font-bold", stat.color)}>{stat.value}</div>
            <div className="text-xs text-muted-foreground uppercase">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-2 border-border font-mono text-xs uppercase font-bold">
        {(['players', 'arenas', 'activity'] as const).map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2.5 transition-colors",
              i > 0 && "border-l-2 border-border",
              tab === t ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            )}
          >
            {t === 'players' ? 'Whale Watch' : t === 'arenas' ? 'Arena Rankings' : 'Live Feed'}
          </button>
        ))}
      </div>

      {tab === 'players' && (
        <div className="space-y-6">
          {/* Chart */}
          <Card className="border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="bg-muted border-b-2 border-border pb-2">
              <CardTitle className="text-sm font-mono uppercase">Balance Distribution (Top 8)</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontFamily: 'monospace', fontSize: 10 }} />
                  <YAxis tickFormatter={v => `${v}◎`} tick={{ fontFamily: 'monospace', fontSize: 10 }} width={55} />
                  <Tooltip
                    formatter={(v: any) => [`${v} SOL`, 'Balance']}
                    contentStyle={{ fontFamily: 'monospace', fontSize: 11, border: '2px solid', borderColor: 'hsl(var(--border))' }}
                  />
                  <Bar dataKey="balance" name="Balance" fill="hsl(var(--primary))" radius={0} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Leaderboard list */}
          <Card className="border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="bg-muted border-b-2 border-border pb-3">
              <CardTitle className="text-sm font-mono uppercase">Rankings</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y-2 divide-border">
                {sortedUsers.map((user, idx) => {
                  const userTiles = tiles.filter(t => t.ownerId === user.id).length;
                  const isMe = user.id === wallet.pubkey;
                  const maxBalance = sortedUsers[0]?.balance || 1;
                  const pct = (user.balance / maxBalance) * 100;

                  return (
                    <div
                      key={user.id}
                      className={cn(
                        "px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors",
                        idx === 0 && "bg-primary/5",
                        isMe && "ring-2 ring-inset ring-primary"
                      )}
                    >
                      <div className="w-7 flex justify-center flex-shrink-0">
                        <RankBadge rank={idx + 1} />
                      </div>
                      <img
                        src={user.avatar}
                        alt=""
                        className="w-9 h-9 border border-border bg-background flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className={cn("font-bold text-sm truncate", isMe && "text-primary")}>
                          {user.name} {isMe && <span className="text-xs font-mono">(You)</span>}
                        </div>
                        <div className="w-full h-1.5 bg-muted border border-border mt-1">
                          <div className="h-full bg-primary/60" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <div className="text-right font-mono flex-shrink-0">
                        <div className="font-bold text-primary text-sm">{formatSol(user.balance)}</div>
                        <div className="text-xs text-muted-foreground">{userTiles} tiles</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'arenas' && (
        <div className="space-y-6">
          <Card className="border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="bg-muted border-b-2 border-border pb-2">
              <CardTitle className="text-sm font-mono uppercase">Arena Volume Comparison</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={boardChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontFamily: 'monospace', fontSize: 11 }} />
                  <YAxis tickFormatter={v => `${v}◎`} tick={{ fontFamily: 'monospace', fontSize: 10 }} width={55} />
                  <Tooltip
                    contentStyle={{ fontFamily: 'monospace', fontSize: 11, border: '2px solid', borderColor: 'hsl(var(--border))' }}
                  />
                  <Bar dataKey="volume" name="Volume (SOL)" fill="hsl(var(--accent))" radius={0} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="bg-muted border-b-2 border-border pb-3">
              <CardTitle className="text-sm font-mono uppercase">Arena Rankings</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y-2 divide-border">
                {sortedBoards.map((board, idx) => {
                  const boardTrades = activity.filter(a => a.boardId === board.id).length;
                  const boardTiles = tiles.filter(t => t.boardId === board.id);
                  const occupancy = boardTiles.length > 0
                    ? (boardTiles.filter(t => t.ownerId).length / boardTiles.length * 100).toFixed(0)
                    : '0';

                  return (
                    <div key={board.id} className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                      <div className="w-7 flex justify-center">
                        <RankBadge rank={idx + 1} />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-lg uppercase tracking-tight">{board.name}</div>
                        <div className="text-xs font-mono text-muted-foreground">
                          {board.size}×{board.size} · {board.growthFactor}x pump · {(board.cutPercentage * 100).toFixed(0)}% cut
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="font-bold text-accent-foreground">{formatSol(board.totalVolume)}</div>
                        <div className="text-xs text-muted-foreground">{boardTrades} trades · {occupancy}% full</div>
                      </div>
                      <Link href={`/arena/${board.id}`}>
                        <button className="px-3 py-1.5 border-2 border-border font-mono text-xs uppercase font-bold hover:bg-primary hover:text-primary-foreground transition-colors">
                          Enter →
                        </button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'activity' && (
        <Card className="border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="bg-muted border-b-2 border-border pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-mono uppercase">Live Transaction Feed</CardTitle>
            <span className="font-mono text-xs text-muted-foreground">{activity.length} total trades</span>
          </CardHeader>
          <CardContent className="p-0">
            {activity.length === 0 ? (
              <div className="p-8 text-center font-mono text-muted-foreground">
                No trades yet. <Link href="/arena" className="text-primary hover:underline">Enter the lobby</Link> and buy something.
              </div>
            ) : (
              <div className="divide-y divide-border/30 max-h-[480px] overflow-auto">
                {activity.slice(0, 60).map((act, i) => {
                  const buyer = users.find(u => u.id === act.buyerId)?.name || formatAddress(act.buyerId);
                  const seller = act.sellerId ? (users.find(u => u.id === act.sellerId)?.name || formatAddress(act.sellerId)) : null;
                  const board = boards.find(b => b.id === act.boardId);
                  const isMe = act.buyerId === wallet.pubkey || act.sellerId === wallet.pubkey;

                  return (
                    <div
                      key={act.id}
                      className={cn(
                        "px-4 py-2.5 flex items-center gap-4 hover:bg-muted/30 transition-colors font-mono text-xs",
                        isMe && "bg-primary/5",
                        i === 0 && "animate-in fade-in slide-in-from-top-2"
                      )}
                    >
                      <div className="text-muted-foreground w-5 text-right">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <span className={cn("font-bold", act.buyerId === wallet.pubkey && "text-primary")}>{buyer}</span>
                        <span className="text-muted-foreground mx-1">bought</span>
                        <span className="text-foreground">[{act.tileId?.split('-').slice(1).join(',')}]</span>
                        {seller && <span className="text-muted-foreground"> from <span className={cn(act.sellerId === wallet.pubkey && "text-primary")}>{seller}</span></span>}
                        <span className="text-muted-foreground ml-1">on {board?.name ?? act.boardId}</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-primary">{formatSol(act.price)}</div>
                        <div className="text-muted-foreground text-[10px]">
                          {new Date(act.timestamp).toLocaleTimeString([], { hour12: false })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
