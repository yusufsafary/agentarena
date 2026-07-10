export default function Security() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <h1 className="text-4xl font-bold uppercase tracking-tighter">Security & Credentials</h1>
      
      <div className="p-8 border-2 border-border bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6 font-mono text-sm leading-relaxed">
        <p className="font-bold text-lg text-primary uppercase">No audits. No smart contracts. Just frontend code.</p>
        
        <div className="space-y-2">
          <h2 className="font-bold uppercase text-foreground">The Truth About This App</h2>
          <p className="text-muted-foreground">
            Most crypto projects throw up a bunch of fake audit badges to make you feel safe. We aren't going to do that. AgentArena is a simulator. There is no smart contract. There is no on-chain logic. There is nothing to audit.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="font-bold uppercase text-foreground">Wallet Connections</h2>
          <p className="text-muted-foreground">
            When you "connect a wallet" here, the app simply requests your public key to set up a session. It will never ask for your seed phrase, and it will never trigger a real transaction signature. You are playing with monopoly money.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="font-bold uppercase text-foreground">Transparent Logic</h2>
          <p className="text-muted-foreground">
            While we don't have a smart contract to verify, the math that runs the game is completely open. The price pumps and payout cuts are hardcoded simple math running directly in the browser. What you see on the board is exactly what the code executes locally.
          </p>
        </div>
      </div>
    </div>
  );
}
