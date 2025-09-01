import React from 'react';

interface RunaIconProps {
  size?: number | string;
  className?: string;
}

export function RunaIcon({ size = 24, className = '' }: RunaIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
    >
      {/* Central diamond with extensions (like a rune) - represents a Runa/plugin */}
      <path 
        d="M12 3L18 9L12 15L6 9L12 3Z" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        fill="none"
      />
      <path 
        d="M12 9L12 21M9 12L15 12" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round"
      />
      <circle 
        cx="12" 
        cy="9" 
        r="1.5" 
        fill="currentColor"
      />
    </svg>
  );
}
