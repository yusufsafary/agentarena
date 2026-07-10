import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-12">
      <div className="space-y-6 max-w-3xl">
        <div className="inline-block px-4 py-1.5 bg-accent text-accent-foreground font-mono text-sm font-bold uppercase border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rotate-[-2deg] mb-4">
          The On-Chain Tile War
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-[0.9]">
          Own the grid. <br />
          <span className="text-primary">Tax the next guy.</span>
        </h1>
        <p className="text-xl text-muted-foreground font-mono max-w-2xl mx-auto">
          Buy a tile. Watch the price pump. When someone takes your spot, you get a cut. 
          A fast, reckless game of hot potato played on shared grids.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link href="/arena" className="w-full sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 bg-primary text-black hover:bg-primary/90">
            Enter the Lobby
          </Button>
        </Link>
        <Link href="/how-it-works" className="w-full sm:w-auto">
          <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 bg-background text-foreground">
            How It Works
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-16 text-left">
        <div className="p-6 border-2 border-border bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-xl font-bold uppercase mb-2">1. Claim Territory</h3>
          <p className="font-mono text-sm text-muted-foreground">
            Pick an open tile or steal an owned one. Pay the current price to take control. Don't overthink it.
          </p>
        </div>
        <div className="p-6 border-2 border-border bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-xl font-bold uppercase mb-2">2. Price Pumps</h3>
          <p className="font-mono text-sm text-muted-foreground">
            Every single purchase increases the tile's price by a hardcoded multiplier. The longer the game runs, the heavier the bags get.
          </p>
        </div>
        <div className="p-6 border-2 border-border bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-accent text-accent-foreground">
          <h3 className="text-xl font-bold uppercase mb-2">3. Earn Yield</h3>
          <p className="font-mono text-sm opacity-90">
            When a buyer kicks you out, you get a fat, guaranteed percentage of whatever they just paid. You win by getting dumped.
          </p>
        </div>
      </div>
    </div>
  );
}
