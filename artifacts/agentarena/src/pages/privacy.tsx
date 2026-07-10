export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <h1 className="text-4xl font-bold uppercase tracking-tighter">Privacy Policy</h1>
      
      <div className="p-8 border-2 border-border bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6 font-mono text-sm leading-relaxed">
        <p className="font-bold text-lg uppercase">We don't collect your data.</p>
        
        <div className="space-y-2">
          <h2 className="font-bold uppercase text-foreground">1. What we store</h2>
          <p className="text-muted-foreground">
            We store your mocked wallet connection state, fake balances, and game activity in your browser's <code>localStorage</code>. This means the data lives entirely on your device. We do not send this data to any backend server because there is no backend server.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="font-bold uppercase text-foreground">2. What we don't do</h2>
          <p className="text-muted-foreground">
            We don't track your IP. We don't use tracking cookies. We don't collect analytics. We do not read or store real wallet seed phrases, private keys, or real on-chain addresses.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="font-bold uppercase text-foreground">3. Clearing your data</h2>
          <p className="text-muted-foreground">
            If you want to wipe your data, just clear your browser's local storage for this site. Poof. Gone forever.
          </p>
        </div>
      </div>
    </div>
  );
}
