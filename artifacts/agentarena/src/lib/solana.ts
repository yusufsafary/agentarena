import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

// Solana devnet connection
export const SOLANA_NETWORK = "devnet";
export const SOLANA_RPC = "https://api.devnet.solana.com";

export const connection = new Connection(SOLANA_RPC, "confirmed");

export interface SolanaWalletProvider {
  publicKey: { toBase58: () => string } | null;
  isConnected: boolean;
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toBase58: () => string } }>;
  disconnect: () => Promise<void>;
  signTransaction?: (tx: unknown) => Promise<unknown>;
  signAllTransactions?: (txs: unknown[]) => Promise<unknown[]>;
}

// Provider detection uses identity flags to avoid mis-identifying wallets.
// window.solana is NOT used as a Phantom fallback because many wallets inject it.
// Each wallet provider has its own flag (isPhantom, isSolflare, etc.) that we check.
export const WALLET_PROVIDERS = {
  phantom: {
    id: "phantom" as const,
    name: "Phantom",
    color: "#AB9FF2",
    getProvider: (): SolanaWalletProvider | undefined => {
      const p = (window as Record<string, unknown>)?.phantom as Record<string, unknown> | undefined;
      const provider = p?.solana as (SolanaWalletProvider & { isPhantom?: boolean }) | undefined;
      // Only return if explicitly marked isPhantom — avoids false positives from window.solana
      return provider?.isPhantom ? provider : undefined;
    },
  },
  solflare: {
    id: "solflare" as const,
    name: "Solflare",
    color: "#FC7B22",
    getProvider: (): SolanaWalletProvider | undefined => {
      const sf = (window as Record<string, unknown>)?.solflare as (SolanaWalletProvider & { isSolflare?: boolean }) | undefined;
      return sf?.isSolflare ? sf : undefined;
    },
  },
  backpack: {
    id: "backpack" as const,
    name: "Backpack",
    color: "#E33E3F",
    getProvider: (): SolanaWalletProvider | undefined => {
      const bp = (window as Record<string, unknown>)?.backpack as Record<string, unknown> | undefined;
      const xnft = (window as Record<string, unknown>)?.xnft as Record<string, unknown> | undefined;
      return (bp?.solana ?? xnft?.solana) as SolanaWalletProvider | undefined;
    },
  },
  jupiter: {
    id: "jupiter" as const,
    name: "Jupiter Mobile",
    color: "#16A282",
    getProvider: (): SolanaWalletProvider | undefined => {
      const jup = (window as Record<string, unknown>)?.jupiter as Record<string, unknown> | undefined;
      return jup?.solana as SolanaWalletProvider | undefined;
    },
  },
} as const;

export type WalletProviderId = keyof typeof WALLET_PROVIDERS;

export async function fetchDevnetBalance(pubkey: string): Promise<number> {
  try {
    const pk = new PublicKey(pubkey);
    const lamports = await connection.getBalance(pk);
    return lamports / LAMPORTS_PER_SOL;
  } catch {
    return 0;
  }
}

export type ConnectResult =
  | { ok: true; pubkey: string; devnetBalance: number }
  | { ok: false; reason: "not_installed" | "rejected" | "unknown" };

export async function connectSolanaWallet(
  providerId: WalletProviderId
): Promise<ConnectResult> {
  const walletDef = WALLET_PROVIDERS[providerId];
  const provider = walletDef.getProvider();

  if (!provider) {
    return { ok: false, reason: "not_installed" };
  }

  try {
    const resp = await provider.connect();
    const pubkey = resp.publicKey.toBase58();
    const devnetBalance = await fetchDevnetBalance(pubkey);
    return { ok: true, pubkey, devnetBalance };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // User rejected the connection request in the wallet popup
    const rejected = msg.toLowerCase().includes("reject") || msg.toLowerCase().includes("user denied");
    return { ok: false, reason: rejected ? "rejected" : "unknown" };
  }
}

export async function disconnectSolanaWallet(providerId: WalletProviderId): Promise<void> {
  const provider = WALLET_PROVIDERS[providerId].getProvider();
  if (provider?.disconnect) {
    try {
      await provider.disconnect();
    } catch {
      // ignore — cleanup only
    }
  }
}

// Generate a simulated base58-style pubkey for wallets that are not installed
export function generateSimulatedPubkey(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < 44; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
