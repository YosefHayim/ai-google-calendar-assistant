import Image from "next/image";

/**
 * AllyLogo component using an inline SVG to ensure perfect visibility
 * and zero external dependencies for the brand mark.
 */
export const AllyLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <Image
    alt="Ally Logo"
    className={className}
    height={40}
    src="/logo.svg"
    width={40}
  />
);

export const BetaBadge = () => (
  <span className="ml-1.5 self-center rounded-sm border border-primary/20 bg-primary/10 px-1.5 py-0.5 font-bold text-[6px] text-primary uppercase leading-none tracking-wider">
    BETA
  </span>
);
