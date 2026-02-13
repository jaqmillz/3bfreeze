/**
 * Bureau brand logos rendered as SVG.
 * Colors match each bureau's brand identity.
 */

export function EquifaxLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Equifax"
    >
      <text
        x="0"
        y="22"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="22"
        fontWeight="700"
        fill="#d22630"
        letterSpacing="-0.5"
      >
        Equifax
      </text>
    </svg>
  );
}

export function TransUnionLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 140 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="TransUnion"
    >
      <text
        x="0"
        y="22"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="22"
        fontWeight="700"
        fill="#00a0df"
        letterSpacing="-0.5"
      >
        TransUnion
      </text>
    </svg>
  );
}

export function ExperianLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Experian"
    >
      <text
        x="0"
        y="22"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="22"
        fontWeight="700"
        fill="#1d4f91"
        letterSpacing="-0.5"
      >
        Experian
      </text>
    </svg>
  );
}

import type { Bureau } from "@/lib/types";

const LOGOS: Record<Bureau, React.FC<{ className?: string }>> = {
  equifax: EquifaxLogo,
  transunion: TransUnionLogo,
  experian: ExperianLogo,
};

export function BureauLogo({
  bureau,
  className,
}: {
  bureau: Bureau;
  className?: string;
}) {
  const Logo = LOGOS[bureau];
  return <Logo className={className} />;
}
