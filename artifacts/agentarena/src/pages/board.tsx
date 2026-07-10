import { useGame } from "@/lib/store";
import { useParams } from "wouter";
import { formatSol, formatAddress, calculatePayout } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";

export default function BoardView() {
  const { boardId } = useParams();
  const { boards, tiles, activity, buyTile, wallet, users } = useGame();
  
  const board = boards.find(b => b.id === boardId);
  const boardTiles = useMemo(() => tiles.filter(t => t.boardId === boardId), [tiles, boardId]);
  const boardActivity = useMemo(() => activity.filter(a => a.boardId === boardId), [activity, boardId]);
  
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'activity' | 'holders' | 'chat'>('activity');

  if (!board) {
    return <div className="p-8 text-center font-mono uppercase font-bold text-muted-foreground">Arena not found. You took a wrong turn.</div>;
  }

  const selectedTile = boardTiles.find(t => t.id === selectedTileId);
  
  // Calculate top holders for this board
  const holderMap = new Map<string, number>();
  boardTiles.forEach(t => {
    if (t.ownerId) {
      holderMap.set(t.ownerId, (holderMap.get(t.ownerId) || 0) + 1);
    }
  });
  const holders = Array.from(holderMap.entries())
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
      {/* Main Grid Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-card border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="p-4 border-b-2 border-border flex justify-between items-center bg-muted">
          <div>
            <h2 className="text-2xl font-bold uppercase">{board.name}</h2>
            <div className="text-sm font-mono text-muted-foreground flex gap-4">
              <span>Vol: {formatSol(board.totalVolume)}</span>
              <span>Cut: {board.cutPercentage * 100}%</span>
              <span>Pump: {board.growthFactor}x</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]" style={{ backgroundSize: '16px 16px' }}>
          <div 
            className="grid gap-1 p-2 bg-border w-fit h-fit"
            style={{ 
              gridTemplateColumns: `repeat(${board.size}, minmax(0, 1fr))`,
            }}
          >
            {boardTiles.map(tile => {
              const isSelected = selectedTileId === tile.id;
              const isOwnedByMe = tile.ownerId === wallet.pubkey;
              const isOwned = tile.ownerId !== null;
              
              return (
                <button
                  key={tile.id}
                  onClick={() => setSelectedTileId(tile.id)}
                  className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 border-2 transition-all relative overflow-hidden",
                    isSelected ? "border-accent ring-2 ring-accent ring-offset-2 ring-offset-background z-10 scale-110" : "border-border/50",
                    !isOwned && "bg-background hover:bg-muted",
                    isOwned && !isOwnedByMe && "bg-secondary",
                    isOwnedByMe && "bg-primary",
                  )}
                  title={`Price: ${formatSol(tile.price)}`}
                >
                  {isOwnedByMe && <div className="absolute inset-0 bg-[url('https://api.dicebear.com/7.x/pixel-art/svg?seed=you')] bg-cover opacity-50" />}
                  {!isOwnedByMe && isOwned && <div className="absolute inset-0 bg-[url('https://api.dicebear.com/7.x/pixel-art/svg?seed=enemy')] bg-cover opacity-50" />}
                  
                  {tile.purchaseCount > 0 && (
                    <span className="absolute bottom-0 right-1 text-[10px] font-mono font-bold text-white drop-shadow-md">
                      x{tile.purchaseCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Tile Action Bar */}
        {selectedTile && (
          <div className="p-4 border-t-2 border-border bg-background flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-4">
            <div className="font-mono text-sm flex gap-6">
              <div>
                <span className="text-muted-foreground block text-xs">Position</span>
                <span className="font-bold">[{selectedTile.x}, {selectedTile.y}]</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Owner</span>
                <span className="font-bold">
                  {selectedTile.ownerId === null ? 'None' : 
                   selectedTile.ownerId === wallet.pubkey ? 'You' : 
                   users.find(u => u.id === selectedTile.ownerId)?.name || formatAddress(selectedTile.ownerId)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Price</span>
                <span className="font-bold text-primary">{formatSol(selectedTile.price)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Next Payout</span>
                <span className="font-bold text-accent">
                  {formatSol(calculatePayout(selectedTile.price, board.cutPercentage))}
                </span>
              </div>
            </div>
            <Button 
              size="lg" 
              className="w-full sm:w-auto uppercase font-bold"
              disabled={!wallet.connected || selectedTile.ownerId === wallet.pubkey || wallet.balance < selectedTile.price}
              onClick={() => buyTile(selectedTile.id)}
            >
              {!wallet.connected ? 'Connect to Buy' : 
               selectedTile.ownerId === wallet.pubkey ? 'Already Yours' : 
               wallet.balance < selectedTile.price ? 'Too Broke' : 
               'Buy Tile'}
            </Button>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-80 flex flex-col bg-card border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex border-b-2 border-border bg-muted font-mono text-xs font-bold uppercase">
          <button 
            className={cn("flex-1 p-3 text-center border-r-2 border-border transition-colors", activeTab === 'activity' ? 'bg-background text-primary' : 'hover:bg-background/50')}
            onClick={() => setActiveTab('activity')}
          >
            Activity
          </button>
          <button 
            className={cn("flex-1 p-3 text-center border-r-2 border-border transition-colors", activeTab === 'holders' ? 'bg-background text-primary' : 'hover:bg-background/50')}
            onClick={() => setActiveTab('holders')}
          >
            Holders
          </button>
          <button 
            className={cn("flex-1 p-3 text-center transition-colors", activeTab === 'chat' ? 'bg-background text-primary' : 'hover:bg-background/50')}
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 font-mono text-sm relative">
          {activeTab === 'activity' && (
            <div className="space-y-3">
              {boardActivity.map(act => {
                const buyer = users.find(u => u.id === act.buyerId)?.name || formatAddress(act.buyerId);
                const isMe = act.buyerId === wallet.pubkey;
                return (
                  <div key={act.id} className="pb-3 border-b border-border/20 last:border-0 flex justify-between items-start animate-in fade-in slide-in-from-left-2">
                    <div>
                      <span className={cn("font-bold", isMe ? "text-primary" : "")}>{buyer}</span>
                      <span className="text-muted-foreground mx-1">bought tile</span>
                      <span className="font-bold">
                        [{boardTiles.find(t => t.id === act.tileId)?.x}, {boardTiles.find(t => t.id === act.tileId)?.y}]
                      </span>
                    </div>
                    <div className="text-right text-xs">
                      <div className="text-primary font-bold">{formatSol(act.price)}</div>
                      <div className="text-muted-foreground opacity-50 text-[10px]">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour12: false })}
                      </div>
                    </div>
                  </div>
                );
              })}
              {boardActivity.length === 0 && <div className="text-muted-foreground text-center mt-4">Ghost town. No trades yet.</div>}
            </div>
          )}

          {activeTab === 'holders' && (
            <div className="space-y-2">
              {holders.length === 0 && <div className="text-muted-foreground text-center mt-4">No one holds anything here.</div>}
              {holders.map(({ id, count }, idx) => {
                const user = users.find(u => u.id === id);
                const isMe = id === wallet.pubkey;
                return (
                  <div key={id} className="flex justify-between items-center p-2 border border-border bg-background">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-bold w-4">{idx + 1}.</span>
                      <span className={cn(isMe && "text-primary font-bold")}>
                        {user?.name || formatAddress(id)}
                      </span>
                    </div>
                    <div className="font-bold">{count} <span className="text-muted-foreground font-normal text-xs">tiles</span></div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="flex flex-col h-full opacity-50 grayscale pointer-events-none">
              <div className="flex-1 space-y-4">
                <div><span className="font-bold text-blue-500">Anon123:</span> wen pump</div>
                <div><span className="font-bold text-red-500">DegenKing:</span> buying the whole bottom row</div>
                <div><span className="font-bold text-green-500">Whale:</span> taking profits soon</div>
              </div>
              <div className="mt-4 p-2 border-2 border-border text-muted-foreground text-xs text-center">
                Chat offline in simulator mode.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
