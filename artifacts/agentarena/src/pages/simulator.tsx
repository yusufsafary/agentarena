import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatSol, calculatePayout } from "@/lib/utils";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend
} from "recharts";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

const PRESET_SCENARIOS = [
  { label: "The Pit", basePrice: 0.1, growthFactor: 1.2, cutPercentage: 0.5, purchases: 12 },
  { label: "High Roller", basePrice: 1.0, growthFactor: 1.5, cutPercentage: 0.8, purchases: 8 },
  { label: "Degens Only", basePrice: 0.01, growthFactor: 1.05, cutPercentage: 0.2, purchases: 30 },
  { label: "Custom", basePrice: 1, growthFactor: 1.2, cutPercentage: 0.5, purchases: 10 },
];

function Slider({ label, value, min, max, step, onChange, display }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; display?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-xs uppercase font-bold text-muted-foreground">{label}</label>
        <span className="font-mono text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 border border-primary">
          {display ?? value}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-primary h-2 cursor-pointer"
      />
      <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 font-mono text-xs">
        <p className="font-bold uppercase mb-1">Turn {label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {typeof p.value === 'number' ? p.value.toFixed(3) + ' SOL' : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Simulator() {
  const [basePrice, setBasePrice] = useState(1);
  const [growthFactor, setGrowthFactor] = useState(1.2);
  const [cutPercentage, setCutPercentage] = useState(0.5);
  const [purchases, setPurchases] = useState(12);
  const [buyOnTurn, setBuyOnTurn] = useState(1);
  const [activePreset, setActivePreset] = useState(0);
  const [mode, setMode] = useState<'sandbox' | 'compare'>('sandbox');

  const applyPreset = (idx: number) => {
    const p = PRESET_SCENARIOS[idx];
    setBasePrice(p.basePrice);
    setGrowthFactor(p.growthFactor);
    setCutPercentage(p.cutPercentage);
    setPurchases(p.purchases);
    setActivePreset(idx);
  };

  const simData = useMemo(() => {
    let currentPrice = basePrice * 1e9;
    const data: any[] = [];
    let myYield = 0;
    let myBuyPrice = 0;

    for (let i = 1; i <= purchases; i++) {
      const priceSOL = currentPrice / 1e9;
      const entry: any = {
        turn: i,
        price: parseFloat(priceSOL.toFixed(4)),
        priceRaw: currentPrice,
        event: 'Bot buys',
        myAmount: 0,
      };

      if (i === buyOnTurn) {
        myBuyPrice = currentPrice;
        entry.event = 'You Buy';
        entry.myAmount = -parseFloat((currentPrice / 1e9).toFixed(4));
      } else if (i === buyOnTurn + 1 && buyOnTurn < purchases) {
        const payout = calculatePayout(currentPrice, cutPercentage);
        myYield = payout;
        entry.event = 'You Get Cut';
        entry.myAmount = parseFloat((payout / 1e9).toFixed(4));
      }

      data.push(entry);
      currentPrice = Math.floor(currentPrice * growthFactor);
    }

    const netProfit = myYield - myBuyPrice;
    const roi = myBuyPrice > 0 ? (((myYield - myBuyPrice) / myBuyPrice) * 100) : 0;
    const breakEven = cutPercentage > 0 ? (1 / cutPercentage) : Infinity;

    return { data, myBuyPrice, myYield, netProfit, roi, breakEven };
  }, [basePrice, growthFactor, cutPercentage, purchases, buyOnTurn]);

  // Compare scenarios: buy at different turns
  const compareData = useMemo(() => {
    return Array.from({ length: Math.min(purchases - 1, 8) }).map((_, idx) => {
      const turn = idx + 1;
      let currentPrice = basePrice * 1e9;
      let myBuyPrice = 0;
      let myYield = 0;

      for (let i = 1; i <= purchases; i++) {
        if (i === turn) myBuyPrice = currentPrice;
        else if (i === turn + 1) myYield = calculatePayout(currentPrice, cutPercentage);
        currentPrice = Math.floor(currentPrice * growthFactor);
      }

      const netProfit = myYield - myBuyPrice;
      const roi = myBuyPrice > 0 ? ((myYield / myBuyPrice - 1) * 100) : 0;
      return { turn: `T${turn}`, roi: parseFloat(roi.toFixed(1)), profit: parseFloat((netProfit / 1e9).toFixed(3)), profitable: netProfit > 0 };
    });
  }, [basePrice, growthFactor, cutPercentage, purchases]);

  const isProfit = simData.netProfit > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-block px-3 py-1 bg-accent text-accent-foreground font-mono text-xs font-bold uppercase border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-3">
            ⚡ The Sandbox
          </div>
          <h1 className="text-4xl font-bold uppercase tracking-tighter">Simulator</h1>
          <p className="text-muted-foreground font-mono mt-1">Play with the math before throwing fake money around.</p>
        </div>
        {/* Mode switcher */}
        <div className="flex gap-0 border-2 border-border font-mono text-xs uppercase font-bold">
          <button
            onClick={() => setMode('sandbox')}
            className={cn("px-4 py-2 transition-colors", mode === 'sandbox' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}
          >
            Sandbox
          </button>
          <button
            onClick={() => setMode('compare')}
            className={cn("px-4 py-2 transition-colors border-l-2 border-border", mode === 'compare' ? 'bg-secondary text-secondary-foreground' : 'hover:bg-muted')}
          >
            Entry Comparison
          </button>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2">
        <span className="font-mono text-xs uppercase text-muted-foreground self-center mr-1">Load Arena:</span>
        {PRESET_SCENARIOS.map((p, idx) => (
          <button
            key={p.label}
            onClick={() => applyPreset(idx)}
            className={cn(
              "px-3 py-1.5 font-mono text-xs uppercase font-bold border-2 border-border transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]",
              activePreset === idx ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {mode === 'sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader className="pb-2 bg-muted border-b-2 border-border">
                <CardTitle className="text-sm uppercase font-mono">Parameters</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-5">
                <Slider
                  label="Base Price (SOL)"
                  value={basePrice}
                  min={0.01} max={10} step={0.01}
                  onChange={v => { setBasePrice(v); setActivePreset(3); }}
                  display={`${basePrice} SOL`}
                />
                <Slider
                  label="Growth Multiplier"
                  value={growthFactor}
                  min={1.01} max={3} step={0.01}
                  onChange={v => { setGrowthFactor(v); setActivePreset(3); }}
                  display={`${growthFactor}x (+${((growthFactor - 1) * 100).toFixed(0)}%)`}
                />
                <Slider
                  label="Owner Cut"
                  value={cutPercentage}
                  min={0.05} max={1} step={0.05}
                  onChange={v => { setCutPercentage(v); setActivePreset(3); }}
                  display={`${(cutPercentage * 100).toFixed(0)}%`}
                />
                <Slider
                  label="Total Purchases"
                  value={purchases}
                  min={2} max={40} step={1}
                  onChange={v => { setPurchases(v); setActivePreset(3); if (buyOnTurn >= v) setBuyOnTurn(v - 1); }}
                  display={`${purchases} buys`}
                />
                <Slider
                  label="You Buy on Turn"
                  value={buyOnTurn}
                  min={1} max={Math.max(1, purchases - 1)} step={1}
                  onChange={v => { setBuyOnTurn(v); setActivePreset(3); }}
                  display={`Turn ${buyOnTurn}`}
                />
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <Card className={cn("border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", isProfit ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground")}>
                <CardContent className="p-4">
                  <div className="text-xs font-mono uppercase font-bold opacity-70 mb-1">Net Profit</div>
                  <div className="text-2xl font-bold leading-none">
                    {isProfit ? '+' : ''}{(simData.netProfit / 1e9).toFixed(3)}
                  </div>
                  <div className="text-xs font-mono mt-1 opacity-80">SOL</div>
                </CardContent>
              </Card>
              <Card className="border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-accent text-accent-foreground">
                <CardContent className="p-4">
                  <div className="text-xs font-mono uppercase font-bold opacity-70 mb-1">ROI</div>
                  <div className="text-2xl font-bold leading-none">
                    {simData.roi.toFixed(1)}%
                  </div>
                  <div className="text-xs font-mono mt-1 opacity-80">{isProfit ? 'profit' : 'loss'}</div>
                </CardContent>
              </Card>
              <Card className="border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CardContent className="p-4">
                  <div className="text-xs font-mono uppercase font-bold text-muted-foreground mb-1">You Pay</div>
                  <div className="text-xl font-bold text-destructive leading-none">{formatSol(simData.myBuyPrice)}</div>
                </CardContent>
              </Card>
              <Card className="border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CardContent className="p-4">
                  <div className="text-xs font-mono uppercase font-bold text-muted-foreground mb-1">You Get</div>
                  <div className="text-xl font-bold text-primary leading-none">{formatSol(simData.myYield)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Break-even note */}
            <div className="p-3 border-2 border-border bg-muted font-mono text-xs">
              <p className="font-bold uppercase mb-1">Break-even Rule</p>
              <p className="text-muted-foreground">
                At <span className="text-foreground font-bold">{(cutPercentage * 100).toFixed(0)}% cut</span>, you break even when the buyer pays at least <span className="text-foreground font-bold">{(1 / cutPercentage).toFixed(2)}x</span> your entry. With <span className="text-foreground font-bold">{growthFactor}x</span> pump, your multiplier × cut = <span className="text-foreground font-bold">{(growthFactor * cutPercentage).toFixed(3)}</span> — {growthFactor * cutPercentage > 1 ? <span className="text-primary font-bold">profitable ✓ (dump on the very next turn)</span> : <span className="text-destructive font-bold">loss ✗ (need to hold longer or pick a higher-cut arena)</span>}. Turn {buyOnTurn} entry is {isProfit ? <span className="text-primary">profitable when dumped turn {buyOnTurn + 1}</span> : <span className="text-destructive">a loss if dumped turn {buyOnTurn + 1}</span>}.
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="lg:col-span-8 space-y-6">
            {/* Price Chart */}
            <Card className="border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader className="pb-2 bg-muted border-b-2 border-border">
                <CardTitle className="text-sm uppercase font-mono">Price Growth Over Time</CardTitle>
                <CardDescription className="font-mono text-xs">Exponential pump — every purchase inflates the bag.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={simData.data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="turn" tickFormatter={v => `T${v}`} tick={{ fontFamily: 'monospace', fontSize: 10 }} />
                    <YAxis tickFormatter={v => `${v}◎`} tick={{ fontFamily: 'monospace', fontSize: 10 }} width={60} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine x={buyOnTurn} stroke="hsl(var(--destructive))" strokeDasharray="4 2" label={{ value: 'YOU BUY', position: 'top', fontFamily: 'monospace', fontSize: 9, fill: 'hsl(var(--destructive))' }} />
                    {buyOnTurn + 1 <= purchases && (
                      <ReferenceLine x={buyOnTurn + 1} stroke="hsl(var(--primary))" strokeDasharray="4 2" label={{ value: 'GET CUT', position: 'top', fontFamily: 'monospace', fontSize: 9, fill: 'hsl(var(--primary))' }} />
                    )}
                    <Line
                      type="monotone"
                      dataKey="price"
                      name="Price"
                      stroke="hsl(var(--secondary))"
                      strokeWidth={2}
                      dot={{ r: 3, fill: 'hsl(var(--secondary))' }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Turn-by-turn timeline */}
            <Card className="border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader className="pb-2 bg-muted border-b-2 border-border">
                <CardTitle className="text-sm uppercase font-mono">Your Cash Flow</CardTitle>
                <CardDescription className="font-mono text-xs">Green bars = money in. Red = money out.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={simData.data.filter(d => d.myAmount !== 0)} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="turn" tickFormatter={v => `T${v}`} tick={{ fontFamily: 'monospace', fontSize: 10 }} />
                    <YAxis tick={{ fontFamily: 'monospace', fontSize: 10 }} width={55} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={0} stroke="hsl(var(--border))" />
                    <Bar
                      dataKey="myAmount"
                      name="Your Flow"
                      fill="hsl(var(--primary))"
                      radius={0}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Full timeline table */}
            <Card className="border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader className="pb-2 bg-muted border-b-2 border-border">
                <CardTitle className="text-sm uppercase font-mono">Full Transaction Timeline</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-56 overflow-auto font-mono text-xs">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-muted border-b-2 border-border">
                      <tr>
                        <th className="text-left p-2 text-muted-foreground uppercase">Turn</th>
                        <th className="text-left p-2 text-muted-foreground uppercase">Event</th>
                        <th className="text-right p-2 text-muted-foreground uppercase">Price</th>
                        <th className="text-right p-2 text-muted-foreground uppercase">Your Flow</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {simData.data.map(row => (
                        <tr
                          key={row.turn}
                          className={cn(
                            "transition-colors",
                            row.turn === buyOnTurn && "bg-destructive/10",
                            row.turn === buyOnTurn + 1 && "bg-primary/10",
                          )}
                        >
                          <td className="p-2 text-muted-foreground">{row.turn}</td>
                          <td className={cn("p-2 font-bold",
                            row.turn === buyOnTurn && "text-destructive",
                            row.turn === buyOnTurn + 1 && "text-primary",
                          )}>
                            {row.event}
                          </td>
                          <td className="p-2 text-right">{row.price} SOL</td>
                          <td className={cn("p-2 text-right font-bold",
                            row.myAmount > 0 && "text-primary",
                            row.myAmount < 0 && "text-destructive",
                            row.myAmount === 0 && "text-muted-foreground",
                          )}>
                            {row.myAmount !== 0 ? `${row.myAmount > 0 ? '+' : ''}${row.myAmount} SOL` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {mode === 'compare' && (
        <div className="space-y-6">
          <div className="p-4 bg-muted border-2 border-border font-mono text-sm">
            <span className="font-bold uppercase">What this shows: </span>
            <span className="text-muted-foreground">ROI and profit if you buy on each possible turn and get dumped on the very next turn. Assumes {growthFactor}x pump, {(cutPercentage * 100).toFixed(0)}% cut.</span>
          </div>

          <Card className="border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="bg-muted border-b-2 border-border">
              <CardTitle className="text-sm uppercase font-mono">ROI by Entry Turn</CardTitle>
              <CardDescription className="font-mono text-xs">Later entry = higher absolute profit, same ROI (it's fixed by the multiplier and cut).</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={compareData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="turn" tick={{ fontFamily: 'monospace', fontSize: 11 }} />
                  <YAxis tickFormatter={v => `${v}%`} tick={{ fontFamily: 'monospace', fontSize: 10 }} width={55} />
                  <Tooltip
                    formatter={(value: any, name: string) => [`${value}%`, name === 'roi' ? 'ROI' : name]}
                    contentStyle={{ fontFamily: 'monospace', fontSize: 11, border: '2px solid', borderColor: 'hsl(var(--border))' }}
                  />
                  <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={2} />
                  <Bar
                    dataKey="roi"
                    name="ROI (%)"
                    fill="hsl(var(--primary))"
                    radius={0}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="bg-muted border-b-2 border-border">
              <CardTitle className="text-sm uppercase font-mono">Absolute Profit by Entry Turn</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y-2 divide-border font-mono text-sm">
                {compareData.map((row) => (
                  <div key={row.turn} className={cn("flex items-center gap-4 px-4 py-3", row.profitable ? "hover:bg-primary/5" : "hover:bg-destructive/5")}>
                    <span className="text-muted-foreground w-10 font-bold">{row.turn}</span>
                    <div className="flex-1 h-4 bg-muted border border-border overflow-hidden">
                      <div
                        className={cn("h-full transition-all", row.profitable ? "bg-primary" : "bg-destructive")}
                        style={{ width: `${Math.min(Math.abs(row.profit) / Math.max(...compareData.map(d => Math.abs(d.profit))) * 100, 100)}%` }}
                      />
                    </div>
                    <span className={cn("w-24 text-right font-bold", row.profitable ? "text-primary" : "text-destructive")}>
                      {row.profit > 0 ? '+' : ''}{row.profit} SOL
                    </span>
                    <span className={cn("text-xs w-20 text-right", row.profitable ? "text-primary" : "text-destructive")}>
                      {row.roi.toFixed(1)}% ROI
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="p-4 border-2 border-border bg-accent text-accent-foreground font-mono text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-bold uppercase mb-1">⚡ Key Insight</p>
            <p>
              With a <strong>{growthFactor}x</strong> multiplier, your ROI from a single hold is always <strong>{(((growthFactor * cutPercentage) - 1) * 100).toFixed(1)}%</strong> regardless of when you enter — because the math is proportional. What changes is the <em>absolute</em> size of your bag. Enter late = bigger numbers, same percentage outcome.
            </p>
          </div>
        </div>
      )}

      <div className="text-center font-mono text-sm text-muted-foreground border-t-2 border-border pt-4">
        Ready to apply the math?{" "}
        <Link href="/arena" className="text-primary font-bold hover:underline underline-offset-4">
          Enter the Lobby →
        </Link>
      </div>
    </div>
  );
}
