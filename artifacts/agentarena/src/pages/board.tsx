import { useGame } from "@/lib/store";
import { useParams } from "wouter";
import { formatSol, formatAddress, calculatePayout } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "wouter";

const MOCK_CHAT = [
  { user: "Anon7341", color: "text-blue-500", msg: "wen pump 👀" },
  { user: "DegenKing", color: "text-red-500", msg: "buying the whole bottom row lmao" },
  { user: "Whale99", color: "text-green-500", msg: "taking profits soon, good luck" },
  { user: "Anon1337", color: "text-yellow-500", msg: "this multiplier is insane" },
  { user: "Rekt4Life", color: "text-purple-500", msg: "never selling" },
  { user: "PaperHands", color: "text-orange-500", msg: "just got dumped on, free money 🤑" },
];

function getTileColor(tile: any, wallet: any): string {
  if (tile.ownerId === wallet.pubkey) return "bg-primary border-primary";
  if (tile.ownerId) {
    const heat = Math.min(tile.purchaseCount, 5);
    if (heat >= 4) return "bg-destructive/80 border-destructive";
    if (heat >= 2) return "bg-secondary/70 border-secondary";
    return "bg-secondary/40 border-secondary/60";
  }
  return "bg-background border-border/40 hover:bg-muted/80";
}

export default function BoardView() {
  const { boardId } = useParams();
  const { boards, tiles, activity, buyTile, wallet, users } = useGame();

  const board = boards.find(b => b.id === boardId);
  const boardTiles = useMemo(() => tiles.filter(t => t.boardId === boardId), [tiles, boardId]);
  const boardActivity = useMemo(() => activity.filter(a => a.boardId === boardId), [activity, boardId]);

  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'activity' | 'holders' | 'chat'>('activity');
  const [chatMsg, setChatMsg] = useState("");
  const [chatMessages, setChatMessages] = useState(MOCK_CHAT);
  const activityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activityRef.current) {
      activityRef.current.scrollTop = 0;
    }
  }, [boardActivity.length]);

  if (!board) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <div className="text-2xl font-bold uppercase font-mono text-muted-foreground">Arena not found.</div>
        <Link href="/arena">
          <Button variant="outline" className="uppercase font-mono font-bold">← Back to Lobby</Button>
        </Link>
      </div>
    );
  }

  const selectedTile = boardTiles.find(t => t.id === selectedTileId);

  const holderMap = new Map<string, number>();
  boardTiles.forEach(t => {
    if (t.ownerId) holderMap.set(t.ownerId, (holderMap.get(t.ownerId) || 0) + 1);
  });
  const holders = Array.from(holderMap.entries())
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count);

  const ownedCount = boardTiles.filter(t => t.ownerId !== null).length;
  const occupancyPct = boardTiles.length > 0 ? (ownedCount / boardTiles.length) * 100 : 0;
  const myTiles = boardTiles.filter(t => t.ownerId === wallet.pubkey).length;

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim() || !wallet.connected) return;
    setChatMessages(prev => [{ user: "You", color: "text-primary", msg: chatMsg.trim() }, ...prev]);
    setChatMsg("");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-120px)]">
      {/* Main Grid Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-card border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        {/* Board Header */}
        <div className="p-3 border-b-2 border-border flex flex-wrap justify-between items-center gap-3 bg-muted">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold uppercase tracking-tight">{board.name}</h2>
              <span className="font-mono text-xs text-muted-foreground border border-border px-2 py-0.5">
                {board.size}×{board.size}
              </span>
            </div>
            <div className="flex flex-wrap gap-3 text-xs font-mono text-muted-foreground mt-0.5">
              <span>Vol: <span className="text-foreground font-bold">{formatSol(board.totalVolume)}</span></span>
              <span>Cut: <span className="text-primary font-bold">{(board.cutPercentage * 100).toFixed(0)}%</span></span>
              <span>Pump: <span className="text-secondary font-bold">{board.growthFactor}x</span></span>
              <span>Trades: <span className="text-foreground font-bold">{boardActivity.length}</span></span>
            </div>
          </div>
          {/* Occupancy bar */}
          <div className="min-w-[140px]">
            <div className="flex justify-between text-[10px] font-mono mb-1 text-muted-foreground">
              <span>Occupancy</span>
              <span>{ownedCount}/{boardTiles.length}</span>
            </div>
            <div className="w-full h-2 bg-muted border border-border overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${occupancyPct}%` }} />
            </div>
            {myTiles > 0 && (
              <div className="text-[10px] font-mono text-primary mt-0.5">You hold {myTiles} tile{myTiles !== 1 ? 's' : ''}</div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-3 px-3 py-1.5 border-b border-border/50 bg-background text-[10px] font-mono flex-wrap">
          <span className="flex items-center gap-1"><span className="w-3 h-3 border bg-primary inline-block" />You</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 border bg-secondary/50 inline-block" />Others (2+ buys)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 border bg-destructive/70 inline-block" />Hot tile (4+ buys)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 border border-border/40 bg-background inline-block" />Empty</span>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-auto p-3 flex items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)]" style={{ backgroundSize: '16px 16px' }}>
          <div
            className="grid gap-0.5 p-1 bg-border"
            style={{ gridTemplateColumns: `repeat(${board.size}, minmax(0, 1fr))` }}
          >
            {boardTiles.map(tile => {
              const isSelected = selectedTileId === tile.id;
              const isOwnedByMe = tile.ownerId === wallet.pubkey;

              return (
                <button
                  key={tile.id}
                  onClick={() => setSelectedTileId(tile.id === selectedTileId ? null : tile.id)}
                  className={cn(
                    "border-2 transition-all relative overflow-hidden group",
                    board.size <= 10 ? "w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14" :
                      board.size <= 15 ? "w-7 h-7 sm:w-9 sm:h-9" : "w-5 h-5 sm:w-7 sm:h-7",
                    getTileColor(tile, wallet),
                    isSelected && "ring-2 ring-accent ring-offset-1 ring-offset-background z-10 scale-110 shadow-lg",
                    isOwnedByMe && "ring-1 ring-primary/50",
                  )}
                  title={`[${tile.x},${tile.y}] — ${formatSol(tile.price)} — ${tile.purchaseCount} purchases`}
                >
                  {tile.purchaseCount > 0 && board.size <= 15 && (
                    <span className="absolute bottom-0 right-0.5 text-[8px] font-mono font-bold text-white/90 drop-shadow-md leading-none">
                      {tile.purchaseCount}
                    </span>
                  )}
                  {isOwnedByMe && (
                    <span className="absolute top-0 left-0.5 text-[8px] font-mono font-bold text-primary-foreground leading-none">
                      ★
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Tile Action Bar */}
        {selectedTile ? (
          <div className="p-3 border-t-2 border-border bg-background animate-in slide-in-from-bottom-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="font-mono text-sm flex flex-wrap gap-4">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Position</span>
                  <span className="font-bold">[{selectedTile.x}, {selectedTile.y}]</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Owner</span>
                  <span className="font-bold">
                    {selectedTile.ownerId === null ? 'Empty'
                      : selectedTile.ownerId === wallet.pubkey ? '★ You'
                        : users.find(u => u.id === selectedTile.ownerId)?.name || formatAddress(selectedTile.ownerId)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Buy Price</span>
                  <span className="font-bold text-destructive">{formatSol(selectedTile.price)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">You'd Earn</span>
                  <span className="font-bold text-primary">
                    {formatSol(calculatePayout(Math.floor(selectedTile.price * board.growthFactor), board.cutPercentage))}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Purchases</span>
                  <span className="font-bold">{selectedTile.purchaseCount}×</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="font-mono uppercase text-xs"
                  onClick={() => setSelectedTileId(null)}
                >
                  ✕
                </Button>
                <Button
                  size="sm"
                  className="uppercase font-bold font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all"
                  disabled={!wallet.connected || selectedTile.ownerId === wallet.pubkey || wallet.balance < selectedTile.price}
                  onClick={() => { buyTile(selectedTile.id); setSelectedTileId(null); }}
                >
                  {!wallet.connected ? 'Connect Wallet'
                    : selectedTile.ownerId === wallet.pubkey ? '★ Yours'
                      : wallet.balance < selectedTile.price ? 'Insufficient Funds'
                        : `Buy for ${formatSol(selectedTile.price)}`}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-2 border-t border-border/30 bg-muted/50 text-center font-mono text-xs text-muted-foreground">
            Click any tile to inspect and buy · {boardTiles.filter(t => !t.ownerId).length} tiles available
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-72 xl:w-80 flex flex-col bg-card border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-h-0">
        {/* Tabs */}
        <div className="flex border-b-2 border-border bg-muted font-mono text-xs font-bold uppercase flex-shrink-0">
          {(['activity', 'holders', 'chat'] as const).map((tab, i) => (
            <button
              key={tab}
              className={cn(
                "flex-1 py-2.5 text-center transition-colors",
                i > 0 && "border-l-2 border-border",
                activeTab === tab ? 'bg-background text-primary' : 'hover:bg-background/50 text-muted-foreground'
              )}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'activity' ? `Trades (${boardActivity.length})` : tab === 'holders' ? `Holders` : 'Chat'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto" ref={activityRef}>
          {/* Activity Feed */}
          {activeTab === 'activity' && (
            <div className="p-3 space-y-2 font-mono text-xs">
              {boardActivity.length === 0 ? (
                <div className="text-muted-foreground text-center mt-6 space-y-1">
                  <div className="text-2xl">👻</div>
                  <div>Ghost town. No trades yet.</div>
                  <div className="text-[10px]">Grab a tile to start the action.</div>
                </div>
              ) : (
                boardActivity.map((act, i) => {
                  const buyer = users.find(u => u.id === act.buyerId)?.name || formatAddress(act.buyerId);
                  const isMe = act.buyerId === wallet.pubkey;
                  const gotCut = act.sellerId === wallet.pubkey;
                  const tileCoords = boardTiles.find(t => t.id === act.tileId);

                  return (
                    <div
                      key={act.id}
                      className={cn(
                        "pb-2 border-b border-border/20 last:border-0 animate-in fade-in slide-in-from-left-2",
                        i === 0 && "bg-primary/5 -mx-3 px-3 pb-2 pt-1 rounded"
                      )}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <div>
                          <span className={cn("font-bold", isMe ? "text-primary" : "")}>{buyer}</span>
                          <span className="text-muted-foreground"> bought </span>
                          <span className="font-bold">[{tileCoords?.x ?? '?'},{tileCoords?.y ?? '?'}]</span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-primary font-bold">{formatSol(act.price)}</div>
                          <div className="text-muted-foreground/50 text-[10px]">
                            {new Date(act.timestamp).toLocaleTimeString([], { hour12: false })}
                          </div>
                        </div>
                      </div>
                      {gotCut && (
                        <div className="text-primary text-[10px] font-bold mt-0.5">
                          ✓ You earned {formatSol(calculatePayout(act.price, board.cutPercentage))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Holders */}
          {activeTab === 'holders' && (
            <div className="p-3 space-y-1.5 font-mono text-xs">
              {holders.length === 0 ? (
                <div className="text-muted-foreground text-center mt-6">No one holds anything here yet.</div>
              ) : (
                holders.map(({ id, count }, idx) => {
                  const user = users.find(u => u.id === id);
                  const isMe = id === wallet.pubkey;
                  const pct = count / boardTiles.length;

                  return (
                    <div key={id} className={cn("p-2 border border-border bg-background", isMe && "ring-1 ring-primary")}>
                      <div className="flex justify-between items-center gap-2 mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-muted-foreground font-bold w-4 flex-shrink-0">{idx + 1}.</span>
                          {user?.avatar && (
                            <img src={user.avatar} alt="" className="w-5 h-5 border border-border/50 flex-shrink-0" />
                          )}
                          <span className={cn("truncate", isMe && "text-primary font-bold")}>
                            {user?.name || formatAddress(id)}
                            {isMe && " ★"}
                          </span>
                        </div>
                        <span className="font-bold flex-shrink-0">{count} tiles</span>
                      </div>
                      <div className="w-full h-1 bg-muted border border-border/30">
                        <div
                          className={cn("h-full", isMe ? "bg-primary" : "bg-secondary/60")}
                          style={{ width: `${pct * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Chat */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-full">
              <div className="flex-1 p-3 space-y-2 font-mono text-xs overflow-auto">
                {chatMessages.map((m, i) => (
                  <div key={i} className="animate-in fade-in">
                    <span className={cn("font-bold", m.color)}>{m.user}:</span>
                    <span className="text-foreground ml-1">{m.msg}</span>
                  </div>
                ))}
              </div>
              <form
                onSubmit={handleSendChat}
                className="border-t-2 border-border p-2 flex gap-2 flex-shrink-0"
              >
                <input
                  value={chatMsg}
                  onChange={e => setChatMsg(e.target.value)}
                  placeholder={wallet.connected ? "Say something..." : "Connect wallet to chat"}
                  disabled={!wallet.connected}
                  maxLength={120}
                  className="flex-1 bg-background border-2 border-border px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={!wallet.connected || !chatMsg.trim()}
                  className="px-3 py-1.5 bg-primary text-primary-foreground font-mono text-xs font-bold uppercase disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                  →
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
