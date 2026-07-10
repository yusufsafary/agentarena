export default function HowItWorks() {
  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold uppercase tracking-tighter">The Rules of Engagement</h1>
        <p className="text-xl text-muted-foreground font-mono">
          It's simple: buy a tile, wait for someone to buy it from you, profit.
        </p>
      </div>

      <div className="space-y-8 mt-12">
        <div className="p-8 border-2 border-border bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 font-mono text-8xl font-bold text-muted opacity-20 leading-none">1</div>
          <h2 className="text-2xl font-bold uppercase mb-4 relative z-10">Enter the Grid</h2>
          <p className="font-mono text-muted-foreground leading-relaxed relative z-10">
            Every arena is a grid of tiles. When an arena launches, every tile has a starting base price. 
            Connect your wallet, pick a tile, and pay the price. Congratulations, you are now the owner of that tile.
          </p>
        </div>

        <div className="p-8 border-2 border-border bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 font-mono text-8xl font-bold text-muted opacity-20 leading-none">2</div>
          <h2 className="text-2xl font-bold uppercase mb-4 relative z-10">The Multiplier</h2>
          <p className="font-mono text-muted-foreground leading-relaxed relative z-10">
            As soon as you buy a tile, its price instantly increases by the arena's growth multiplier. 
            If the multiplier is 1.2x and you paid 1 SOL, the next person to buy that tile must pay 1.2 SOL.
          </p>
        </div>

        <div className="p-8 border-2 border-border bg-primary text-primary-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 font-mono text-8xl font-bold text-black opacity-10 leading-none">3</div>
          <h2 className="text-2xl font-bold uppercase mb-4 relative z-10">Getting Replaced</h2>
          <p className="font-mono leading-relaxed opacity-90 relative z-10">
            You don't own the tile forever. Anyone can come along and buy your tile out from under you at the new, higher price. 
            When they do, they become the new owner. But here is the catch: you get a guaranteed cut of what they paid. 
            This cut is defined by the arena's payout percentage.
          </p>
        </div>

        <div className="p-8 border-2 border-border bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-bold uppercase mb-4">Example Scenario</h2>
          <div className="bg-muted p-4 font-mono text-sm space-y-2 border border-border">
            <div className="flex justify-between border-b border-border/20 pb-2">
              <span className="text-muted-foreground">Arena Setup:</span>
              <span className="font-bold text-right">Base: 1 SOL | Multiplier: 1.5x | Cut: 80%</span>
            </div>
            <div className="flex justify-between border-b border-border/20 py-2">
              <span className="text-muted-foreground">You buy Tile [0,0]:</span>
              <span className="font-bold text-destructive">-1.00 SOL</span>
            </div>
            <div className="flex justify-between border-b border-border/20 py-2">
              <span className="text-muted-foreground">Tile [0,0] new price:</span>
              <span className="font-bold">1.50 SOL</span>
            </div>
            <div className="flex justify-between border-b border-border/20 py-2">
              <span className="text-muted-foreground">Ape buys Tile [0,0]:</span>
              <span className="font-bold text-accent-foreground">Pays 1.50 SOL</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-muted-foreground">You receive (80% of 1.50):</span>
              <span className="font-bold text-primary">+1.20 SOL (0.20 Profit)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
