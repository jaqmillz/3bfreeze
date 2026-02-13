"use client";

/** Large floating orbs — subtle, used on inner sections */
export function GradientOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="animate-float-slow absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-primary/[0.12] blur-[100px]" />
      <div className="animate-float-slower absolute -bottom-32 -left-32 h-[360px] w-[360px] rounded-full bg-primary/[0.08] blur-[100px]" />
      <div className="animate-float-medium absolute top-1/2 left-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-[80px]" />
    </div>
  );
}

/** Hero-grade background with bold gradient mesh and glow */
export function HeroGradient() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Top-right primary blob */}
      <div className="animate-float-slow absolute -top-24 right-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
      {/* Bottom-left accent blob */}
      <div className="animate-float-slower absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-[oklch(0.6_0.15_260)]/[0.12] blur-[100px]" />
      {/* Center warm glow */}
      <div className="animate-float-medium absolute top-1/3 left-1/2 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-[oklch(0.7_0.08_300)]/10 blur-[100px]" />
      {/* Top gradient wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.53 0.1 280 / 0.07) 0%, transparent 70%)",
        }}
      />
      {/* Subtle grain texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />
    </div>
  );
}

/** Dot grid — subtle texture */
export function GridPattern() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />
    </div>
  );
}
