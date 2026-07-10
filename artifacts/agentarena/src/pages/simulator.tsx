import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatSol, calculatePayout } from "@/lib/utils";

export default function Simulator() {
  const [basePrice, setBasePrice] = useState(1); // in SOL
  const [growthFactor, setGrowthFactor] = useState(1.2);
  const [cutPercentage, setCutPercentage] = useState(0.5);
  const [purchases, setPurchases] = useState(10);
  
  const simData = useMemo(() => {
    let currentPrice = basePrice * 1e9;
    let data = [];
    let totalSpent = 0;
    let myYield = 0;

    // Simulate buying on turn 1
    const myBuyPrice = currentPrice;
    data.push({ turn: 1, price: currentPrice, event: 'You Buy', amount: -currentPrice });
    currentPrice = currentPrice * growthFactor;

    // Simulate others buying
    for (let i = 2; i <= purchases; i++) {
      if (i === 2) {
        // Someone buys it from you
        const payout = calculatePayout(currentPrice, cutPercentage);
        myYield = payout;
        data.push({ turn: i, price: currentPrice, event: 'Sold (You get cut)', amount: payout });
      } else {
        data.push({ turn: i, price: currentPrice, event: 'Other buys', amount: 0 });
      }
      currentPrice = currentPrice * growthFactor;
    }

    const netProfit = myYield - myBuyPrice;
    const roi = (myYield / myBuyPrice) * 100;

    return {
      data,
      myBuyPrice,
      myYield,
      netProfit,
      roi
    };
  }, [basePrice, growthFactor, cutPercentage, purchases]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold uppercase tracking-tighter mb-2">Economics Simulator</h1>
        <p className="text-muted-foreground font-mono">Test parameters before risking the real fake money.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle>Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 font-mono">
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground block">Base Price (SOL)</label>
              <input 
                type="number" 
                value={basePrice} 
                onChange={e => setBasePrice(Number(e.target.value))}
                className="w-full bg-background border-2 border-border p-2 focus:outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground block">Growth Multiplier (e.g. 1.2 = +20%)</label>
              <input 
                type="number" 
                step="0.05"
                value={growthFactor} 
                onChange={e => setGrowthFactor(Number(e.target.value))}
                className="w-full bg-background border-2 border-border p-2 focus:outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground block">Previous Owner Cut (0 to 1)</label>
              <input 
                type="number" 
                step="0.1"
                min="0"
                max="1"
                value={cutPercentage} 
                onChange={e => setCutPercentage(Number(e.target.value))}
                className="w-full bg-background border-2 border-border p-2 focus:outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground block">Simulated Purchases</label>
              <input 
                type="number" 
                min="2"
                max="50"
                value={purchases} 
                onChange={e => setPurchases(Number(e.target.value))}
                className="w-full bg-background border-2 border-border p-2 focus:outline-none focus:border-primary"
              />
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-6">
                <div className="text-sm font-mono opacity-80 uppercase font-bold mb-1">Your ROI (If sold on turn 2)</div>
                <div className="text-4xl font-bold">{simData.roi.toFixed(1)}%</div>
                <div className="text-sm font-mono mt-2 font-bold">
                  {simData.netProfit > 0 ? '+' : ''}{formatSol(simData.netProfit)} Profit
                </div>
              </CardContent>
            </Card>
            <Card className="bg-accent text-accent-foreground">
              <CardContent className="p-6">
                <div className="text-sm font-mono opacity-80 uppercase font-bold mb-1">Price After {purchases} Buys</div>
                <div className="text-4xl font-bold">{formatSol(simData.data[simData.data.length-1].price)}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
              <CardDescription>Assuming you buy on Turn 1 and get bought out on Turn 2.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-sm h-64 overflow-auto">
                {simData.data.map(row => (
                  <div key={row.turn} className={`flex justify-between items-center p-2 border-b border-border/20 ${row.turn === 1 ? 'bg-primary/10 text-primary font-bold' : row.turn === 2 ? 'bg-accent/10 text-accent-foreground font-bold' : ''}`}>
                    <div className="flex gap-4 w-1/2">
                      <span className="text-muted-foreground w-16">Turn {row.turn}</span>
                      <span>{row.event}</span>
                    </div>
                    <div className="flex justify-between w-1/2 text-right">
                      <span className="w-1/2">Price: {formatSol(row.price)}</span>
                      <span className={`w-1/2 ${row.amount > 0 ? 'text-primary' : row.amount < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {row.amount !== 0 ? (row.amount > 0 ? '+' : '') + formatSol(row.amount) : '-'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
