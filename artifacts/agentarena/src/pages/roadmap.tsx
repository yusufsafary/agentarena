import { motion } from "framer-motion";

type Milestone = {
  month: string;
  label: string;
  status: "done" | "active" | "upcoming";
  items: string[];
  note?: string;
};

const MILESTONES: Milestone[] = [
  {
    month: "July 2026",
    label: "Foundation",
    status: "active",
    items: [
      "Simulator live on devnet with Solana wallet connect (Phantom, Solflare, Backpack, Jupiter)",
      "Tile mechanic working end to end with real wallet addresses",
      "Three boards deployed: The Pit, High Roller, Degens Only",
      "Leaderboard tracking live session volume",
    ],
    note: "This is where we are right now. The arena is open. Connect your wallet and try to hold a tile for more than 30 seconds.",
  },
  {
    month: "August 2026",
    label: "Real Stakes",
    status: "upcoming",
    items: [
      "Move from pure simulation to optional micro-entry devnet boards (0.001 SOL cap per tile)",
      "NFT-style tile receipts minted on Solana devnet for each buy event",
      "Basic referral tracking tied to wallet pubkeys",
      "Mobile layout polish across all boards",
    ],
    note: "Still devnet. Still fake money. But every action leaves a real on-chain trace.",
  },
  {
    month: "September 2026",
    label: "Multichain Expansion",
    status: "upcoming",
    items: [
      "Add EVM wallet support via wagmi (MetaMask, Rainbow, Coinbase Wallet)",
      "Cross-chain leaderboard showing both Solana and EVM participants",
      "Separate boards per chain so it stays clean and not chaotic",
      "Chain selector in wallet connect flow",
    ],
    note: "The multichain part of the roadmap. Solana stays primary but EVM players get their own boards.",
  },
  {
    month: "October 2026",
    label: "Mainnet Preparation",
    status: "upcoming",
    items: [
      "Full security audit of the tile purchase logic",
      "Rate limiting per wallet to prevent bot domination",
      "Emergency pause mechanism for board admins",
      "Move simulator charts to show real historical data from devnet plays",
    ],
  },
  {
    month: "November 2026",
    label: "Mainnet Alpha",
    status: "upcoming",
    items: [
      "First mainnet board opens with SOL cap at 0.05 SOL total per wallet per session",
      "Revenue split: 10% to treasury, 90% flows through the tile chain as designed",
      "Waitlist opens for early arena access",
      "Community leaderboard with actual bragging rights",
    ],
    note: "This is the moment the simulation becomes real. Caps stay low for alpha.",
  },
  {
    month: "December 2026",
    label: "Open Arena",
    status: "upcoming",
    items: [
      "Remove cap restrictions for high-roller boards",
      "Tournament mode: fixed-time rounds, winner takes the board pot",
      "Public API for third-party leaderboard integrations",
      "End of year recap: how much SOL moved through the arena in 2026",
    ],
    note: "If we get here and the thing is still running, we won. That is the actual goal.",
  },
];

const statusConfig = {
  done: {
    dot: "bg-green-400 border-green-400",
    line: "border-green-400",
    badge: "bg-green-400/10 text-green-400 border-green-400",
    label: "SHIPPED",
  },
  active: {
    dot: "bg-primary border-primary animate-pulse",
    line: "border-primary",
    badge: "bg-primary/10 text-primary border-primary",
    label: "IN PROGRESS",
  },
  upcoming: {
    dot: "bg-muted border-muted-foreground",
    line: "border-border",
    badge: "bg-muted text-muted-foreground border-border",
    label: "PLANNED",
  },
};

export default function Roadmap() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-12"
      >
        <div className="inline-block bg-primary/10 border border-primary px-3 py-1 text-xs font-mono uppercase font-bold text-primary mb-4">
          Maker Note
        </div>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6">
          Roadmap<br />Jul to Dec 2026
        </h1>
        <div className="border-2 border-border p-6 bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono text-sm leading-relaxed space-y-4 text-muted-foreground">
          <p>
            This is not a corporate roadmap. There is no guarantee these things will ship on time or in this order.
            What you are reading is closer to a list of intentions written by the person building this thing.
          </p>
          <p>
            AgentArena started as a question: what happens when you take the hot-potato mechanic from old Ethereum
            games and build it properly on Solana, where fees are low enough that small stakes actually make sense?
            The simulator exists to answer that question without putting real money at risk first.
          </p>
          <p>
            The devnet wallet connect was the first real milestone. Everything below is what comes next.
          </p>
          <div className="pt-2 border-t border-border text-xs">
            Last updated July 2026 // agentarena.id
          </div>
        </div>
      </motion.div>

      <div className="relative">
        {MILESTONES.map((milestone, i) => {
          const cfg = statusConfig[milestone.status];
          return (
            <motion.div
              key={milestone.month}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="flex gap-6 mb-10"
            >
              <div className="flex flex-col items-center">
                <div className={`w-4 h-4 rounded-none border-2 mt-1 flex-shrink-0 ${cfg.dot}`} />
                {i < MILESTONES.length - 1 && (
                  <div className={`flex-1 w-0 border-l-2 border-dashed mt-2 ${cfg.line}`} />
                )}
              </div>

              <div className="flex-1 pb-2">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="text-xs font-mono font-bold uppercase text-muted-foreground">
                    {milestone.month}
                  </span>
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 border ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                </div>

                <h2 className="text-xl font-black uppercase tracking-tight mb-4">
                  {milestone.label}
                </h2>

                <ul className="space-y-2 mb-4">
                  {milestone.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <span className="text-primary font-bold mt-0.5 flex-shrink-0">/</span>
                      <span className={milestone.status === "upcoming" ? "text-muted-foreground" : ""}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>

                {milestone.note && (
                  <div className="border-l-2 border-primary pl-4 text-xs font-mono text-muted-foreground italic">
                    {milestone.note}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="border-t-2 border-border pt-8 mt-4 font-mono text-xs text-muted-foreground space-y-2"
      >
        <p className="font-bold uppercase text-foreground">One last thing</p>
        <p>
          The best way to influence this roadmap is to play the arena and break something.
          Every bug report, every weird edge case someone finds by actually using the thing,
          shapes what gets built next. The timeline above will shift. Some of these might not
          happen at all. That is fine. The arena stays open.
        </p>
        <p>
          Questions, feedback, or if you found a bug: <span className="text-primary">support.agentarena.id</span>
        </p>
      </motion.div>
    </div>
  );
}
