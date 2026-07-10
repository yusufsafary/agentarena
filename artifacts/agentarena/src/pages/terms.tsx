export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <h1 className="text-4xl font-bold uppercase tracking-tighter">Terms of Service</h1>
      
      <div className="p-8 border-2 border-border bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6 font-mono text-sm leading-relaxed">
        <p className="font-bold text-lg text-primary uppercase">Read this carefully. It takes ten seconds.</p>
        
        <div className="space-y-2">
          <h2 className="font-bold uppercase text-foreground">1. This is a Simulation</h2>
          <p className="text-muted-foreground">
            AgentArena is a simulated environment. There are no real smart contracts, no real tokens, and no real value changing hands here. Everything you see runs locally in your browser.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="font-bold uppercase text-foreground">2. No Financial Advice</h2>
          <p className="text-muted-foreground">
            Nothing on this site constitutes financial advice. We are literally giving you fake money to buy fake tiles. Do not use this simulator to make real-world trading decisions.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="font-bold uppercase text-foreground">3. No Liability</h2>
          <p className="text-muted-foreground">
            We hold no liability for anything you do here or anywhere else. If you lose your actual money somewhere else because you got overconfident playing a simulator, that is entirely on you.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="font-bold uppercase text-foreground">4. Play Fair</h2>
          <p className="text-muted-foreground">
            It's a local simulator, so if you really want to pop open dev tools and edit your localStorage balance to a billion fake SOL, go ahead. We don't care. But it defeats the point.
          </p>
        </div>
      </div>
    </div>
  );
}
