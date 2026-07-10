import { useGame } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatSol } from "@/lib/utils";
import { useState } from "react";
import { WALLET_PROVIDERS, WalletProviderId } from "@/lib/solana";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

const WALLET_LIST: Array<{
  id: WalletProviderId;
  name: string;
  color: string;
}> = [
  { id: "phantom", name: "Phantom", color: "bg-[#AB9FF2]" },
  { id: "solflare", name: "Solflare", color: "bg-[#FC7B22]" },
  { id: "backpack", name: "Backpack", color: "bg-[#E33E3F]" },
  { id: "jupiter", name: "Jupiter Mobile", color: "bg-[#16A282]" },
];

function DevnetBadge() {
  return (
    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-none uppercase">
      DEVNET
    </span>
  );
}

export function WalletConnect() {
  const { wallet, connectWallet, disconnectWallet } = useGame();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  if (wallet.connected) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden md:flex flex-col items-end gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold font-mono">
              {wallet.pubkey?.slice(0, 4)}...{wallet.pubkey?.slice(-4)}
            </span>
            <DevnetBadge />
          </div>
          <span className="text-xs font-mono text-primary">{formatSol(wallet.balance)}</span>
          {wallet.devnetBalance !== undefined && wallet.devnetBalance > 0 && (
            <span className="text-[10px] font-mono text-yellow-400">
              {wallet.devnetBalance.toFixed(4)} SOL on-chain
            </span>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={disconnectWallet} className="font-mono uppercase text-xs">
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="bg-primary text-black hover:bg-primary/90 font-bold uppercase font-mono"
        >
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <DialogTitle className="font-black uppercase tracking-tight">Connect Wallet</DialogTitle>
            <DevnetBadge />
          </div>
          <DialogDescription className="font-mono text-xs">
            Connect your Solana wallet to Devnet. This is a simulator, no real funds move. 
            Game balance is separate from your on-chain balance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4">
          <p className="text-xs font-mono uppercase font-bold text-muted-foreground mb-3">
            Solana Wallets
          </p>

          {WALLET_LIST.map((w) => {
            const provider = WALLET_PROVIDERS[w.id].getProvider();
            const installed = !!provider;
            const isLoading = loading === w.id;

            return (
              <Button
                key={w.id}
                variant="outline"
                className="w-full justify-start h-14 text-base font-mono relative"
                disabled={!!loading}
                onClick={async () => {
                  setLoading(w.id);
                  await connectWallet(w.id, true);
                  setLoading(null);
                  setOpen(false);
                }}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-none border border-border mr-4 flex-shrink-0 ${w.color}`}
                />
                <span className="flex-1 text-left">{w.name}</span>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : !installed ? (
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">Not installed</span>
                ) : (
                  <span className="text-[10px] font-mono text-green-400 uppercase">Ready</span>
                )}
              </Button>
            );
          })}

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground font-mono font-bold">Or</span>
            </div>
          </div>

          <Button
            variant="secondary"
            className="w-full h-12 font-mono uppercase font-bold text-sm"
            disabled={!!loading}
            onClick={async () => {
              setLoading("simulated");
              await connectWallet("simulated", false);
              setLoading(null);
              setOpen(false);
            }}
          >
            {loading === "simulated" ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Simulate Connection
          </Button>
          <p className="text-[10px] text-muted-foreground font-mono text-center">
            Simulated mode uses a random wallet address. No real wallet needed.
          </p>
        </div>

        <div className="border-t border-border pt-4 text-[10px] font-mono text-muted-foreground space-y-1">
          <p className="font-bold uppercase text-foreground">What happens when you connect?</p>
          <p>Your real wallet address appears in the header. Your devnet SOL balance is shown for reference. The game gives you 100 simulated SOL to play with, separate from anything on-chain.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
