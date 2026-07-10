import { Link } from "wouter";

const SECTIONS = [
  {
    title: "What We Collect",
    icon: "📦",
    content: `Almost nothing. We store your simulated game state in your browser's localStorage. That includes your wallet session key (either your real Solana pubkey if you connected Phantom or Solflare, or a randomly generated one in simulated mode), your fake game SOL balance, owned tile state, and recent activity. This data never leaves your device. We have no backend database, no user accounts, and no cloud storage.`,
  },
  {
    title: "What We Don't Collect",
    icon: "🚫",
    content: `We do not collect your IP address in any identifiable form. We do not use tracking cookies, advertising pixels, or third-party analytics SDKs (no Google Analytics, Meta Pixel, Mixpanel, etc.). We do not read or store real wallet addresses, seed phrases, private keys, or any actual on-chain data. We do not require you to create an account or provide any personal information to use this platform.`,
  },
  {
    title: "Real Wallet Connections",
    icon: "🔐",
    content: `If you choose "Simulate Connection," a random public key is generated in your browser and no real wallet is involved. If you choose Phantom or Solflare, the app requests your Solana address from the wallet extension and fetches your devnet SOL balance as a read-only reference. We never request signing permissions, never prompt a transaction, and never submit anything on-chain on your behalf. The game balance is always separate from your real on-chain balance.`,
  },
  {
    title: "Local Storage",
    icon: "💾",
    content: `All game state is written to localStorage under keys prefixed with agentarena_. You can inspect this at any time in your browser's DevTools, under Application then Local Storage. You can delete it there, or by clearing site data in your browser settings. Clearing localStorage resets your simulated game state entirely.`,
    code: `Keys: agentarena_wallet, agentarena_tiles, agentarena_boards, agentarena_activity`,
  },
  {
    title: "CDN and Hosting",
    icon: "🌐",
    content: `This site is served via a static hosting provider. Standard web server logs may capture your IP address, browser user agent, and request path as part of normal HTTP infrastructure. These logs are not used for tracking users, are not sold, and are rotated on a standard schedule. We do not control or read these logs directly.`,
  },
  {
    title: "Third-Party Services",
    icon: "🔗",
    content: `We load avatar images from DiceBear (api.dicebear.com), which is a privacy-respecting open-source avatar service. These requests carry the seed parameter from tile/user IDs (no personal data). We load fonts and icons from standard CDNs (Google Fonts, jsDelivr). No data about you is shared with these services beyond a standard HTTP request.`,
  },
  {
    title: "Children",
    icon: "👶",
    content: `This platform is not directed at children under 13. We do not knowingly collect any data from children. If you believe a child has used this platform in a way that raises privacy concerns, contact us via the Support page.`,
  },
  {
    title: "Clearing Your Data",
    icon: "🗑️",
    content: `To wipe all data associated with AgentArena, clear your browser's localStorage for this site. Your game state, simulated wallet, and activity history are immediately and permanently deleted. There is no server-side account to delete because there is no server-side account.`,
  },
];

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="text-4xl font-bold uppercase tracking-tighter mb-2">Privacy Policy</h1>
        <p className="font-mono text-sm text-muted-foreground">
          Effective: July 2026. Short version: we barely collect anything. Longer version below.
        </p>
      </div>

      <div className="p-4 border-2 border-primary bg-primary/10 font-mono text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <span className="font-bold uppercase text-primary">TLDR: </span>
        Game state lives in your browser. No real wallet data. No tracking. No accounts. Clear localStorage to wipe everything.
      </div>

      <div className="space-y-4">
        {SECTIONS.map(section => (
          <div key={section.title} className="p-6 border-2 border-border bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="font-bold uppercase text-foreground font-mono flex items-center gap-2 mb-3">
              <span className="text-lg">{section.icon}</span>
              {section.title}
            </h2>
            <p className="font-mono text-sm text-muted-foreground leading-relaxed">
              {section.content}
            </p>
            {section.code && (
              <code className="block mt-3 p-2 bg-muted border border-border text-xs font-mono text-foreground">
                {section.code}
              </code>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-4 flex-wrap font-mono text-xs text-muted-foreground border-t-2 border-border pt-4">
        <Link href="/terms" className="hover:text-foreground hover:underline underline-offset-4 transition-colors">Terms of Service</Link>
        <Link href="/security" className="hover:text-foreground hover:underline underline-offset-4 transition-colors">Security</Link>
        <Link href="/support" className="hover:text-foreground hover:underline underline-offset-4 transition-colors">Contact</Link>
      </div>
    </div>
  );
}
