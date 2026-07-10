export function Logo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 54L54 10H118V54L74 118H10V54Z" fill="hsl(var(--primary))" stroke="hsl(var(--foreground))" strokeWidth="8" strokeLinejoin="miter"/>
      <path d="M30 64L64 30H108V64L74 108H30V64Z" fill="hsl(var(--accent))" stroke="hsl(var(--foreground))" strokeWidth="8" strokeLinejoin="miter"/>
      <path d="M45 70L70 45H95V70L70 95H45V70Z" fill="hsl(var(--background))" stroke="hsl(var(--foreground))" strokeWidth="8" strokeLinejoin="miter"/>
      <path d="M100 20L110 10L125 35L100 20Z" fill="hsl(var(--foreground))"/>
    </svg>
  );
}
