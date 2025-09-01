import React from 'react';
import { GitBranch } from 'lucide-react';

interface BranchesPanelProps {
  isDark: boolean;
}

export function BranchesPanelSimple({ isDark }: BranchesPanelProps) {
  return (
    <div className="h-full flex flex-col">
      <div className={`${isDark ? 'glass-card' : 'glass-card-light'} m-4`}>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <GitBranch className="w-5 h-5" />
            <h2>Branches & Streams</h2>
          </div>
          <div className="text-center py-8">
            <p>Branches panel is working!</p>
            <p className="text-sm text-muted-foreground mt-2">Theme: {isDark ? 'Dark' : 'Light'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}