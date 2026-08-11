/**
 * Flat poster backdrop for HH GOA: solid deep green field, faint azulejo
 * tile grid and a soft print grain. No gradient blobs — the brand is a
 * silkscreen poster, not an aurora.
 */
export function AuroraBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      {/* azulejo tile grid */}
      <div className="absolute inset-0 azulejo opacity-[0.35]" />

      {/* faint horizon rule + sun, top right */}
      <svg
        className="absolute right-[-6%] top-[6%] h-[38vw] w-[38vw] opacity-[0.12]"
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle cx="100" cy="100" r="70" stroke="var(--color-primary)" strokeWidth="2" />
        {Array.from({ length: 9 }).map((_, i) => (
          <line
            key={i}
            x1="20"
            x2="180"
            y1={70 + i * 9}
            y2={70 + i * 9}
            stroke="var(--color-primary)"
            strokeWidth="2"
          />
        ))}
      </svg>

      {/* print grain */}
      <div
        className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")",
        }}
      />

      {/* bottom fade so long pages settle into the green */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-surface-deep" />
    </div>
  );
}
