import { Link } from "wouter";

const SECTIONS = [
  {
    num: "1",
    title: "This is a Simulation",
    content: `AgentArena is a browser-based game and educational simulator. There are no real smart contracts, no real blockchain transactions, no real tokens, and no real value changing hands at any point. Every SOL balance you see is fictional. Every wallet connection is mocked. Everything runs entirely within your browser using localStorage. Nothing leaves your device.`,
  },
  {
    num: "2",
    title: "No Financial Advice",
    content: `Nothing on this platform constitutes financial advice, investment advice, or trading recommendations of any kind. The game mechanics are designed to illustrate how a class of speculative on-chain games work, not to guide real-world financial decisions. If you use this simulator to make real-money trading decisions elsewhere, that is entirely your choice and your responsibility.`,
  },
  {
    num: "3",
    title: "No Real Asset Transfers",
    content: `Choosing "Simulate Connection" generates a random public key locally with no wallet involved. Choosing Phantom or Solflare requests your public address from the extension and reads your devnet SOL balance for display. No real funds are requested, transferred, or held by this platform at any point. The game balance is purely simulated.`,
  },
  {
    num: "4",
    title: "No Liability",
    content: `To the maximum extent permitted by law, the operators of AgentArena.id accept no liability for any damages arising from use of this platform, including decisions made based on game outcomes, lost productivity, or FOMO-induced real-world trading. This is a game. Treat it like one.`,
  },
  {
    num: "5",
    title: "Fair Use and Conduct",
    content: `Since all game state is stored locally, you can technically modify your localStorage to cheat (inflate your balance, etc.). This is allowed. It defeats the point, but it's harmless to everyone else because there are no shared servers. Do not attempt to scrape, abuse, or disrupt the hosting infrastructure for this site.`,
  },
  {
    num: "6",
    title: "Changes to These Terms",
    content: `We may update these terms at any time. Continued use of the platform after changes are posted constitutes acceptance of the updated terms. Since there's no account system, we can't notify you directly. Check this page periodically if you care.`,
  },
  {
    num: "7",
    title: "Contact",
    content: `Questions about these terms? Use the Support page. We'll read it.`,
  },
];

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="text-4xl font-bold uppercase tracking-tighter mb-2">Terms of Service</h1>
        <p className="font-mono text-sm text-muted-foreground">
          Effective: July 2026. Jurisdiction: Simulation Land. Governing law: The Math.
        </p>
      </div>

      <div className="p-4 border-2 border-primary bg-primary/10 font-mono text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <span className="font-bold uppercase text-primary">TLDR: </span>
        This is a simulator. Fake money. No real value. No liability. Play fair. Don't break stuff. Use the{" "}
        <Link href="/simulator" className="text-primary font-bold hover:underline">Simulator</Link>{" "}to learn the math.
      </div>

      <div className="border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] divide-y-2 divide-border">
        {SECTIONS.map(section => (
          <div key={section.num} className="p-6 space-y-2">
            <h2 className="font-bold uppercase text-foreground font-mono">
              {section.num}. {section.title}
            </h2>
            <p className="font-mono text-sm text-muted-foreground leading-relaxed">
              {section.content}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-4 flex-wrap font-mono text-xs text-muted-foreground border-t-2 border-border pt-4">
        <Link href="/privacy" className="hover:text-foreground hover:underline underline-offset-4 transition-colors">Privacy Policy</Link>
        <Link href="/security" className="hover:text-foreground hover:underline underline-offset-4 transition-colors">Security</Link>
        <Link href="/support" className="hover:text-foreground hover:underline underline-offset-4 transition-colors">Support</Link>
      </div>
    </div>
  );
}
