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

/** Hero background — clean subtle wash */
export function HeroGradient() {
  return null;
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
