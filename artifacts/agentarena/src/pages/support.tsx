import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

const QUICK_ANSWERS = [
  {
    q: "How do I start playing?",
    a: "Click 'Enter the Lobby' in the header, pick an arena, connect a simulated wallet, then click any tile on the grid and buy it.",
  },
  {
    q: "My balance is stuck at zero.",
    a: "Your simulated wallet gives you 50 SOL on connect. If you've spent it all, disconnect and reconnect to get a fresh 50 SOL. It's fake money.",
  },
  {
    q: "The game looks frozen / nothing is moving.",
    a: "The AI bots make purchases every ~2 seconds. If the board looks frozen, try refreshing the page. Game state is saved in localStorage so you won't lose your tiles.",
  },
  {
    q: "How do I reset my game state?",
    a: "Open browser DevTools → Application → Local Storage → this site, and delete all keys starting with agentarena_. Or clear site data in your browser settings.",
  },
  {
    q: "Is there a mobile version?",
    a: "The site is responsive and works on mobile. The board view is best on a larger screen for big grids, but The Pit (10×10) is totally usable on mobile.",
  },
];

type Category = 'bug' | 'feedback' | 'question' | 'other';

export default function Support() {
  const [category, setCategory] = useState<Category>('bug');
  const [sent, setSent] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-16">
      <div>
        <h1 className="text-4xl font-bold uppercase tracking-tighter mb-2">Support</h1>
        <p className="font-mono text-sm text-muted-foreground">
          Found a bug? Got an idea? Something broken? Let us know. We actually read these.
        </p>
      </div>

      {/* Quick answers */}
      <div>
        <h2 className="text-lg font-bold uppercase tracking-tight mb-4 font-mono border-b-2 border-border pb-2">
          Quick Answers
        </h2>
        <div className="border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] divide-y-2 divide-border">
          {QUICK_ANSWERS.map((item, idx) => (
            <div key={idx}>
              <button
                className="w-full text-left p-4 font-mono text-sm font-bold hover:bg-muted transition-colors flex justify-between items-center gap-4 uppercase"
                onClick={() => setExpanded(expanded === idx ? null : idx)}
              >
                <span className="text-foreground">{item.q}</span>
                <span className="text-muted-foreground font-mono flex-shrink-0 text-lg">
                  {expanded === idx ? '−' : '+'}
                </span>
              </button>
              {expanded === idx && (
                <div className="px-4 pb-4 font-mono text-sm text-muted-foreground leading-relaxed border-t border-border/30 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact form */}
      <div>
        <h2 className="text-lg font-bold uppercase tracking-tight mb-4 font-mono border-b-2 border-border pb-2">
          Contact Us
        </h2>

        {sent ? (
          <div className="p-8 border-2 border-border bg-primary text-primary-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center font-mono">
            <div className="text-4xl font-bold uppercase mb-2">Message Sent</div>
            <p className="text-sm opacity-80 mb-4">
              (Not really. This is a simulator. But we appreciate the energy.)
            </p>
            <button
              onClick={() => setSent(false)}
              className="px-4 py-2 border-2 border-current font-mono text-sm uppercase font-bold hover:bg-black/10 transition-colors"
            >
              Send Another
            </button>
          </div>
        ) : (
          <div className="p-6 border-2 border-border bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <form className="space-y-5 font-mono" onSubmit={handleSubmit}>
              {/* Category */}
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-foreground block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {(['bug', 'feedback', 'question', 'other'] as Category[]).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={cn(
                        "px-3 py-1.5 text-xs uppercase font-bold border-2 border-border transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none",
                        category === cat ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
                      )}
                    >
                      {cat === 'bug' ? '🐛 Bug' : cat === 'feedback' ? '💡 Idea' : cat === 'question' ? '❓ Question' : '📬 Other'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-foreground block">
                  Email <span className="font-normal text-muted-foreground">(optional, for follow-up)</span>
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full bg-background border-2 border-border p-3 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-foreground block">Message</label>
                <textarea
                  rows={6}
                  required
                  placeholder={
                    category === 'bug'
                      ? "Describe the bug: what happened, what you expected, and how to reproduce it."
                      : category === 'feedback'
                        ? "What would make AgentArena better?"
                        : category === 'question'
                          ? "Ask anything about the game mechanics, simulator, or how arenas work."
                          : "Whatever's on your mind."
                  }
                  className="w-full bg-background border-2 border-border p-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              {/* Browser info checkbox */}
              <div className="flex items-start gap-3">
                <input type="checkbox" id="include-info" className="mt-1" />
                <label htmlFor="include-info" className="text-xs text-muted-foreground cursor-pointer">
                  Include browser info with my report (helps debug issues)
                </label>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full uppercase font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
              >
                Send Message
              </Button>
            </form>

            <p className="mt-4 text-xs font-mono text-muted-foreground text-center">
              Remember: this is a simulation. We can't recover real funds because you didn't spend any.
            </p>
          </div>
        )}
      </div>

      {/* Links */}
      <div className="p-4 border-2 border-border bg-muted font-mono text-xs">
        <p className="font-bold uppercase text-foreground mb-2">Other Resources</p>
        <div className="flex flex-wrap gap-4 text-muted-foreground">
          <Link href="/how-it-works" className="hover:text-foreground hover:underline underline-offset-4 transition-colors">How It Works</Link>
          <Link href="/simulator" className="hover:text-foreground hover:underline underline-offset-4 transition-colors">Simulator</Link>
          <Link href="/security" className="hover:text-foreground hover:underline underline-offset-4 transition-colors">Security</Link>
          <Link href="/terms" className="hover:text-foreground hover:underline underline-offset-4 transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-foreground hover:underline underline-offset-4 transition-colors">Privacy</Link>
        </div>
      </div>
    </div>
  );
}
