import * as React from 'react';
import { KodexIcon } from './KodexIcon';

export function CustomNavbarBrand() {
  return (
    <div 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px',
        color: '#ffffff',
        fontSize: '1.4rem',
        fontWeight: 700,
        letterSpacing: '-0.02em'
      }}
    >
      <KodexIcon size={28} className="kodex-icon" />
      <span>Rune VCS</span>
    </div>
  );
}
