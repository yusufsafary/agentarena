import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    num: "01",
    title: "Claim Your Spot",
    color: "bg-card",
    textColor: "text-foreground",
    content: `Every arena is a flat grid of tiles. They all start at a floor price set by the arena rules. Connect your simulated wallet, find an empty tile (or steal an owned one), click it, and pay up. It's yours now. No confirmation screens, no waiting — instant.`,
    example: null,
    tip: "Start with The Pit (10×10, 1.2x pump). Small tiles, fast action, cheap floor.",
  },
  {
    num: "02",
    title: "The Price Pumps",
    color: "bg-card",
    textColor: "text-foreground",
    content: `Every single purchase bumps that tile's price by the arena's hardcoded multiplier. If the pump is 1.2x and you bought in at 1 SOL, the next buyer pays 1.2 SOL. The buyer after that pays 1.44 SOL. Then 1.73 SOL. It compounds every time someone touches the tile. There is no ceiling.`,
    example: {
      rows: [
        { label: "Turn 1 price:", value: "1.000 SOL", color: "" },
        { label: "Turn 2 price (+20%):", value: "1.200 SOL", color: "text-accent-foreground" },
        { label: "Turn 3 price (+20%):", value: "1.440 SOL", color: "text-accent-foreground" },
        { label: "Turn 5 price (+20%):", value: "2.074 SOL", color: "text-destructive" },
        { label: "Turn 10 price (+20%):", value: "6.192 SOL", color: "text-destructive font-bold" },
      ]
    },
    tip: "Higher multiplier = faster price growth, bigger payouts, bigger risk for the last holder.",
  },
  {
    num: "03",
    title: "Getting Dumped (The Good Part)",
    color: "bg-primary",
    textColor: "text-primary-foreground",
    content: `You don't hold this forever. Anyone can come along and buy your tile right out from under you at the pumped price. When they do, you lose the tile — but you get a guaranteed percentage cut of whatever they paid. You profit by being replaced. The longer you hold without getting dumped, the more expensive it becomes for the next buyer, and the bigger your eventual payout.`,
    example: null,
    tip: "The cut percentage is fixed per arena. High Roller gives you 80% of the sale price when you're dumped.",
  },
  {
    num: "04",
    title: "The Full Loop — By Example",
    color: "bg-card",
    textColor: "text-foreground",
    content: `Arena: High Roller (1 SOL floor, 1.5x pump, 80% cut)`,
    example: {
      rows: [
        { label: "You buy Tile [0,0]:", value: "−1.00 SOL", color: "text-destructive" },
        { label: "Tile [0,0] new price:", value: "1.50 SOL", color: "" },
        { label: "Random buyer purchases it:", value: "Pays 1.50 SOL", color: "text-accent-foreground" },
        { label: "You receive (80% of 1.50):", value: "+1.20 SOL", color: "text-primary font-bold" },
        { label: "Your net profit:", value: "+0.20 SOL (+20% ROI)", color: "text-primary font-bold" },
      ]
    },
    tip: null,
  },
];

const FAQ = [
  {
    q: "Is this real money?",
    a: "No. AgentArena is a simulation. Your wallet is mocked, your SOL balance is fake, and no real transactions occur anywhere. Everything runs in your browser's local storage.",
  },
  {
    q: "Can I lose money?",
    a: "Not real money — no. In the simulation, you can run out of your fake starting balance if you keep buying tiles that never get dumped (i.e., you're always the last holder). That's the risk the game simulates.",
  },
  {
    q: "What happens if no one ever buys my tile?",
    a: "In the simulation, AI bots make random purchases every few seconds, so tiles do get traded. In a real on-chain version, the risk is that you're the last bag holder — which is exactly what the Simulator page helps you think through.",
  },
  {
    q: "Why would anyone ever buy an expensive tile?",
    a: "Because they're betting someone else will pay even more. That's the whole game. The cut system means even the 'loser' (the current owner) gets a guaranteed payout when they're ousted. Everyone except the very last holder makes money.",
  },
  {
    q: "What's the difference between the arenas?",
    a: "Each arena has its own grid size, floor price, growth multiplier, and owner cut. High Roller has bigger bags and higher cuts. Degens Only has tiny pumps but giant grids. The Pit is the default beginner zone.",
  },
  {
    q: "How do I maximize profit?",
    a: "Use the Simulator page. Tinker with multiplier and cut settings to understand the math before playing. Early entry and high cut arenas favor quick profits. The key insight: ROI per dump is always fixed by the multiplier × cut — it's the absolute payout that grows over time.",
  },
];

export default function HowItWorks() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="max-w-3xl mx-auto space-y-16 pb-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-block px-4 py-1.5 bg-accent text-accent-foreground font-mono text-sm font-bold uppercase border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          The Rules
        </div>
        <h1 className="text-5xl font-bold uppercase tracking-tighter">How to Play</h1>
        <p className="text-xl text-muted-foreground font-mono">
          Buy a tile. Get replaced. Take a cut. It's that stupidly simple.
        </p>
      </div>

      {/* Step Navigator */}
      <div className="flex gap-2 flex-wrap justify-center">
        {STEPS.map((step, idx) => (
          <button
            key={idx}
            onClick={() => setActiveStep(idx)}
            className={cn(
              "px-4 py-2 font-mono text-xs uppercase font-bold border-2 border-border transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]",
              activeStep === idx ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
            )}
          >
            {step.num}
          </button>
        ))}
      </div>

      {/* Steps */}
      <div className="space-y-8">
        {STEPS.map((step, idx) => (
          <div
            key={idx}
            id={`step-${idx}`}
            className={cn(
              "p-8 border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-all",
              step.color,
              step.textColor,
              activeStep === idx && "ring-2 ring-accent ring-offset-2"
            )}
            onClick={() => setActiveStep(idx)}
          >
            <div className="absolute top-0 right-0 p-4 font-mono text-8xl font-bold leading-none select-none"
              style={{ opacity: 0.08 }}>
              {step.num}
            </div>

            <h2 className="text-2xl font-bold uppercase mb-4 relative z-10">
              {step.num}. {step.title}
            </h2>
            <p className={cn("font-mono leading-relaxed relative z-10 mb-4", step.color === "bg-primary" ? "opacity-90" : "text-muted-foreground")}>
              {step.content}
            </p>

            {step.example && (
              <div className={cn("relative z-10 p-4 border border-current/20 font-mono text-sm space-y-2 mt-4", step.color === "bg-primary" ? "bg-black/10" : "bg-muted")}>
                {step.example.rows.map((row, ri) => (
                  <div key={ri} className={cn("flex justify-between", ri < step.example!.rows.length - 1 && "border-b border-current/10 pb-2")}>
                    <span className="opacity-70">{row.label}</span>
                    <span className={cn("font-bold", row.color)}>{row.value}</span>
                  </div>
                ))}
              </div>
            )}

            {step.tip && (
              <div className={cn(
                "mt-4 px-3 py-2 border-l-4 border-primary font-mono text-xs relative z-10",
                step.color === "bg-primary" ? "bg-black/10 border-black/30" : "bg-muted border-primary"
              )}>
                <span className="font-bold uppercase">Tip: </span>
                {step.tip}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/simulator">
          <div className="p-6 border-2 border-border bg-accent text-accent-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
            <div className="text-2xl font-bold uppercase mb-1">Run the Simulator →</div>
            <p className="font-mono text-sm opacity-80">
              Tweak multipliers and cuts, see your exact ROI, before touching a live arena.
            </p>
          </div>
        </Link>
        <Link href="/arena">
          <div className="p-6 border-2 border-border bg-primary text-primary-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
            <div className="text-2xl font-bold uppercase mb-1">Enter the Lobby →</div>
            <p className="font-mono text-sm opacity-80">
              You know the rules. Pick an arena and start grabbing territory.
            </p>
          </div>
        </Link>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-2xl font-bold uppercase tracking-tighter mb-6 border-b-2 border-border pb-4">FAQ</h2>
        <div className="space-y-0 border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {FAQ.map((item, idx) => (
            <div key={idx} className={cn("border-b-2 border-border last:border-b-0")}>
              <button
                className="w-full text-left p-5 font-bold hover:bg-muted transition-colors flex justify-between items-center gap-4 font-mono uppercase text-sm"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                <span>{item.q}</span>
                <span className="text-xl font-mono text-muted-foreground flex-shrink-0">
                  {openFaq === idx ? '−' : '+'}
                </span>
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 font-mono text-sm text-muted-foreground leading-relaxed border-t border-border/30">
                  <p className="pt-4">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Risk notice */}
      <div className="p-4 border-2 border-border bg-muted font-mono text-xs text-muted-foreground">
        <span className="font-bold uppercase text-foreground">Simulation disclaimer: </span>
        AgentArena uses simulated SOL balances and mocked wallet connections. No real blockchain transactions occur. This platform is for entertainment and game-theory exploration only. See <Link href="/terms" className="text-primary hover:underline">Terms</Link> for full details.
      </div>
    </div>
  );
}
