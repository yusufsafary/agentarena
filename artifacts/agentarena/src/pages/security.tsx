import { Link } from "wouter";
import { cn } from "@/lib/utils";

const POINTS = [
  {
    title: "No Smart Contract",
    badge: "VERIFIED",
    badgeColor: "bg-primary text-primary-foreground",
    content: `There is no smart contract to audit. AgentArena is a purely client-side simulation. All game logic — price calculations, payout math, tile ownership — runs in your browser as JavaScript. You can read every line in DevTools → Sources if you want.`,
  },
  {
    title: "No Real Wallet Permissions",
    badge: "SAFE",
    badgeColor: "bg-primary text-primary-foreground",
    content: `We never request signing permissions from any wallet extension. The "connect wallet" flow creates a simulated session key. We do not pop up Phantom, Solflare, or any other wallet adapter for real signatures. If you ever see a wallet popup asking to sign a transaction from agentarena.id — that is not us and you should leave immediately.`,
  },
  {
    title: "No Seed Phrases, Ever",
    badge: "CRITICAL",
    badgeColor: "bg-destructive text-destructive-foreground",
    content: `We will never ask for your seed phrase, private key, or recovery phrase. Not in any form, on any page, or in any support communication. If anyone claiming to be AgentArena support asks for this information, they are scammers. This platform has zero reason to access your keys because we're a simulation.`,
  },
  {
    title: "Open Math",
    badge: "TRANSPARENT",
    badgeColor: "bg-accent text-accent-foreground",
    content: `The price pump and payout cut formulas are simple arithmetic: new_price = floor(price × multiplier), payout = floor(new_price × cut_pct). These are executed deterministically in your browser. There is no randomness in payouts, no house edge, no hidden fees. What you see in the Simulator is exactly what runs on the board.`,
    code: `new_price = floor(price × growthFactor)\npayout    = floor(new_price × cutPercentage)`,
  },
  {
    title: "Data Storage",
    badge: "LOCAL",
    badgeColor: "bg-secondary text-secondary-foreground",
    content: `All state is stored in your browser's localStorage. There is no backend server receiving your game data. Network requests from this app are limited to: loading assets from the CDN and fetching DiceBear avatars (open-source, seed-only, no PII). You can verify this in DevTools → Network.`,
  },
  {
    title: "Hosting and Infrastructure",
    badge: "STATIC",
    badgeColor: "bg-muted text-muted-foreground border border-border",
    content: `This site is served as a static build (HTML, CSS, JS) from a CDN-backed host. There is no server executing code on your behalf. No database. No user-facing API endpoints. The attack surface is minimal by design.`,
  },
];

export default function Security() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="text-4xl font-bold uppercase tracking-tighter mb-2">Security</h1>
        <p className="font-mono text-sm text-muted-foreground">
          No audits. No contracts. Just transparent math and honest disclosure.
        </p>
      </div>

      <div className="p-4 border-2 border-primary bg-primary/10 font-mono text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <span className="font-bold uppercase text-primary">One Rule: </span>
        Never share your real wallet seed phrase with anyone. Not us, not support, not a "giveaway". AgentArena will never need it.
      </div>

      <div className="space-y-4">
        {POINTS.map(point => (
          <div key={point.title} className="p-6 border-2 border-border bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h2 className="font-bold uppercase text-foreground font-mono text-lg">{point.title}</h2>
              <span className={cn("px-2 py-1 font-mono text-xs font-bold uppercase flex-shrink-0", point.badgeColor)}>
                {point.badge}
              </span>
            </div>
            <p className="font-mono text-sm text-muted-foreground leading-relaxed">
              {point.content}
            </p>
            {point.code && (
              <code className="block mt-3 p-3 bg-muted border border-border text-xs font-mono text-foreground whitespace-pre">
                {point.code}
              </code>
            )}
          </div>
        ))}
      </div>

      <div className="p-6 border-2 border-border bg-muted shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono">
        <h2 className="font-bold uppercase text-foreground mb-2">Report a Security Issue</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Found something that looks wrong? A logic bug in the simulation, a CSP issue, or anything else?
          Use the Support page to report it. We'll take it seriously even if the stakes are fake.
        </p>
        <Link href="/support">
          <button className="px-4 py-2 border-2 border-border font-mono text-sm uppercase font-bold hover:bg-primary hover:text-primary-foreground transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none">
            Report an Issue →
          </button>
        </Link>
      </div>

      <div className="flex gap-4 flex-wrap font-mono text-xs text-muted-foreground border-t-2 border-border pt-4">
        <Link href="/terms" className="hover:text-foreground hover:underline underline-offset-4 transition-colors">Terms</Link>
        <Link href="/privacy" className="hover:text-foreground hover:underline underline-offset-4 transition-colors">Privacy</Link>
        <Link href="/support" className="hover:text-foreground hover:underline underline-offset-4 transition-colors">Support</Link>
      </div>
    </div>
  );
}
