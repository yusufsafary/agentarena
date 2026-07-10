import { Link, useLocation } from "wouter";
import { WalletConnect } from "./wallet-connect";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

const NAV_LINKS = [
  { href: "/arena", label: "Lobby" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/simulator", label: "Simulator" },
  { href: "/how-it-works", label: "How It Works" },
];

const FOOTER_LINKS = [
  { href: "/security", label: "Security" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/support", label: "Support" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b-2 border-border bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Logo className="w-8 h-8" />
            <span className="text-xl font-bold uppercase tracking-tighter">AgentArena.id</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 font-mono text-sm uppercase">
            {NAV_LINKS.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "hover:text-primary transition-colors",
                  location === link.href ? "text-primary font-bold" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <WalletConnect />
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      
      <footer className="border-t-2 border-border py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left font-mono">
              <p className="text-sm font-bold uppercase">AGENTARENA.ID // SIMULATED ENVIRONMENT</p>
              <p className="text-xs text-muted-foreground mt-1">No real value. High fake stakes. Play stupid games, win stupid prizes.</p>
            </div>
            
            <nav className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono uppercase text-muted-foreground">
              {FOOTER_LINKS.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className="hover:text-foreground transition-colors hover:underline underline-offset-4"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
