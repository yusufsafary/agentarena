import { Button } from "@/components/ui/button";

export default function Support() {
  return (
    <div className="max-w-xl mx-auto space-y-8 pb-12">
      <h1 className="text-4xl font-bold uppercase tracking-tighter">Support</h1>
      
      <div className="p-8 border-2 border-border bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6 font-mono">
        <p className="text-sm text-muted-foreground">
          Found a bug in the simulator? Got an idea for a new arena? Let us know. Just remember this is a simulated environment, so we can't help you recover real funds because you didn't spend any.
        </p>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <label className="text-xs uppercase font-bold text-foreground">Email</label>
            <input 
              type="email" 
              placeholder="you@example.com"
              className="w-full bg-background border-2 border-border p-3 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs uppercase font-bold text-foreground">Message</label>
            <textarea 
              rows={5}
              placeholder="What's broken?"
              className="w-full bg-background border-2 border-border p-3 text-sm focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <Button type="submit" size="lg" className="w-full uppercase font-bold" onClick={() => alert("Message sent into the void. (This is a simulator)")}>
            Send Message
          </Button>
        </form>
      </div>
    </div>
  );
}
