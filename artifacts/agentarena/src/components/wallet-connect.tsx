import { useGame } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatSol } from "@/lib/utils";
import { useState } from "react";

const WALLETS = [
  { id: 'phantom', name: 'Phantom', color: 'bg-[#AB9FF2]' },
  { id: 'solflare', name: 'Solflare', color: 'bg-[#FC7B22]' },
  { id: 'backpack', name: 'Backpack', color: 'bg-[#E33E3F]' },
  { id: 'jupiter', name: 'Jupiter Mobile', color: 'bg-[#16A282]' }
] as const;

export function WalletConnect() {
  const { wallet, connectWallet, disconnectWallet } = useGame();
  const [open, setOpen] = useState(false);

  if (wallet.connected) {
    return (
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-sm font-bold">{wallet.pubkey?.slice(0, 4)}...{wallet.pubkey?.slice(-4)}</span>
          <span className="text-xs font-mono text-primary">{formatSol(wallet.balance)}</span>
        </div>
        <Button variant="outline" size="sm" onClick={disconnectWallet}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="bg-primary text-black hover:bg-primary/90">
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect to Arena</DialogTitle>
          <DialogDescription>
            Select a wallet to begin. No real funds are used.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {WALLETS.map((w) => (
            <Button
              key={w.id}
              variant="outline"
              className="w-full justify-start h-14 text-lg"
              onClick={() => {
                connectWallet(w.id);
                setOpen(false);
              }}
            >
              <div className={`w-4 h-4 rounded-full mr-4 ${w.color}`} />
              {w.name}
            </Button>
          ))}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground font-mono">Or</span>
            </div>
          </div>
          <Button
            variant="secondary"
            className="w-full h-14 text-lg"
            onClick={() => {
              connectWallet('simulated');
              setOpen(false);
            }}
          >
            Simulate Connection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
