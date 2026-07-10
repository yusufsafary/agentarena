import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

// Solana devnet connection
export const SOLANA_NETWORK = "devnet";
export const SOLANA_RPC = "https://api.devnet.solana.com";

export const connection = new Connection(SOLANA_RPC, "confirmed");

// Known wallet provider window keys
export const WALLET_PROVIDERS = {
  phantom: {
    id: "phantom" as const,
    name: "Phantom",
    color: "#AB9FF2",
    getProvider: () => (window as any)?.phantom?.solana ?? (window as any)?.solana,
    icon: "phantom",
  },
  solflare: {
    id: "solflare" as const,
    name: "Solflare",
    color: "#FC7B22",
    getProvider: () => (window as any)?.solflare,
    icon: "solflare",
  },
  backpack: {
    id: "backpack" as const,
    name: "Backpack",
    color: "#E33E3F",
    getProvider: () => (window as any)?.backpack?.solana ?? (window as any)?.xnft?.solana,
    icon: "backpack",
  },
  jupiter: {
    id: "jupiter" as const,
    name: "Jupiter Mobile",
    color: "#16A282",
    getProvider: () => (window as any)?.jupiter?.solana,
    icon: "jupiter",
  },
} as const;

export type WalletProviderId = keyof typeof WALLET_PROVIDERS;

export interface SolanaWalletProvider {
  publicKey: { toBase58: () => string } | null;
  isConnected: boolean;
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toBase58: () => string } }>;
  disconnect: () => Promise<void>;
  signTransaction?: (tx: any) => Promise<any>;
  signAllTransactions?: (txs: any[]) => Promise<any[]>;
}

export async function fetchDevnetBalance(pubkey: string): Promise<number> {
  try {
    const pk = new PublicKey(pubkey);
    const lamports = await connection.getBalance(pk);
    return lamports / LAMPORTS_PER_SOL;
  } catch {
    return 0;
  }
}

export async function connectSolanaWallet(
  providerId: WalletProviderId
): Promise<{ pubkey: string; devnetBalance: number } | null> {
  const walletDef = WALLET_PROVIDERS[providerId];
  const provider = walletDef.getProvider() as SolanaWalletProvider | undefined;

  if (!provider) {
    return null;
  }

  try {
    const resp = await provider.connect();
    const pubkey = resp.publicKey.toBase58();
    const devnetBalance = await fetchDevnetBalance(pubkey);
    return { pubkey, devnetBalance };
  } catch (err) {
    console.warn("Wallet connect error:", err);
    return null;
  }
}

export async function disconnectSolanaWallet(providerId: WalletProviderId): Promise<void> {
  const walletDef = WALLET_PROVIDERS[providerId];
  const provider = walletDef.getProvider() as SolanaWalletProvider | undefined;
  if (provider?.disconnect) {
    try {
      await provider.disconnect();
    } catch {
      // ignore
    }
  }
}

// Generate a simulated devnet-style pubkey for wallets that are not installed
export function generateSimulatedPubkey(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < 44; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
