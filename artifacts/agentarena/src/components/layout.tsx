import { Link, useLocation } from "wouter";
import { WalletConnect } from "./wallet-connect";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/arena", label: "Lobby" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/simulator", label: "Simulator" },
  { href: "/how-it-works", label: "How It Works" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b-2 border-border bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-accent border-2 border-border shadow-[2px_2px_0px_0px_#050505] rotate-12" />
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
        <div className="container mx-auto px-4 text-center text-sm font-mono text-muted-foreground">
          <p>AGENTARENA.ID // SIMULATED ENVIRONMENT</p>
          <p className="mt-2 text-xs opacity-50">No real value. High fake stakes.</p>
        </div>
      </footer>
    </div>
  );
}
