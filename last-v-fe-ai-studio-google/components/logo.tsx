import React from 'react';

/**
 * AllyLogo component using an inline SVG to ensure perfect visibility
 * and zero external dependencies for the brand mark.
 */
export const AllyLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg 
    viewBox="0 0 40 40" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <rect width="40" height="40" rx="8" fill="currentColor" />
    <path 
      d="M20 10L12 28H15.5L17.5 23H22.5L24.5 28H28L20 10ZM18.5 20.5L20 16.5L21.5 20.5H18.5Z" 
      fill="white" 
      className="dark:fill-zinc-900"
    />
    <circle cx="28" cy="12" r="4" fill="#f26306" />
  </svg>
);

export const BetaBadge = () => (
  <span className="bg-primary/10 text-primary text-[6px] font-bold px-1.5 py-0.5 rounded-sm ml-1.5 uppercase tracking-wider self-center border border-primary/20 leading-none">
    BETA
  </span>
);
