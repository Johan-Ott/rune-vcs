import * as React from 'react';

interface KodexIconProps {
  size?: number | string;
  className?: string;
}

export function KodexIcon({ size = 24, className = '' }: KodexIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
    >
      {/* Nordic-inspired Kodex rune - represents knowledge/wisdom system */}
      {/* Outer triangular frame - representing wisdom/knowledge ascending */}
      <path 
        d="M12 2L20 18L4 18L12 2Z" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        fill="none"
      />
      {/* Inner runic tree pattern - knowledge branches */}
      <path 
        d="M12 6L12 16M8 10L16 10M9 13L15 13" 
        stroke="currentColor" 
        strokeWidth="1.2" 
        strokeLinecap="round"
      />
      {/* Mystical nodes - wisdom points */}
      <circle 
        cx="12" 
        cy="6" 
        r="1" 
        fill="currentColor"
      />
      <circle 
        cx="8" 
        cy="10" 
        r="0.8" 
        fill="currentColor"
      />
      <circle 
        cx="16" 
        cy="10" 
        r="0.8" 
        fill="currentColor"
      />
      {/* Base anchor - foundation of knowledge */}
      <path 
        d="M9 18L15 18" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
    </svg>
  );
}
