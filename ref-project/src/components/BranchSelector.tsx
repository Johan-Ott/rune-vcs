import React, { useState } from 'react';
import { GitBranch, ChevronDown, Plus, Check } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Badge } from './ui/badge';

interface Branch {
  name: string;
  current: boolean;
  ahead: number;
  behind: number;
}

interface BranchSelectorProps {
  isDark: boolean;
  currentBranch: string;
  branches: Branch[];
  onBranchChange: (branch: string) => void;
  onCreateBranch?: () => void;
  compact?: boolean;
}

export function BranchSelector({ 
  isDark, 
  currentBranch, 
  branches, 
  onBranchChange, 
  onCreateBranch,
  compact = false 
}: BranchSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getCurrentBranch = () => {
    return branches.find(b => b.name === currentBranch);
  };

  const currentBranchInfo = getCurrentBranch();

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-6 gap-1 px-2 text-xs ${
            compact ? 'max-w-32' : ''
          } ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
        >
          <span className={`${compact ? 'truncate' : ''}`}>nordic-explorer</span>
          <ChevronDown className="w-3 h-3 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="start" 
        className={`w-48 ${isDark ? 'glass-panel-dark' : 'glass-panel-light'}`}
      >
        {/* Repository Info */}
        <div className="px-3 py-2 border-b border-white/10">
          <div className="text-sm font-medium">nordic-explorer</div>
          <div className="text-xs text-muted-foreground">Switch branch</div>
        </div>
        
        {/* Branch List */}
        <div className="max-h-48 overflow-y-auto">
          {branches.map((branch) => (
            <DropdownMenuItem
              key={branch.name}
              onClick={() => onBranchChange(branch.name)}
              className={`flex items-center justify-between cursor-pointer ${
                branch.name === currentBranch ? 'bg-white/10' : ''
              }`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <GitBranch className="w-3 h-3 flex-shrink-0" />
                <span className="text-sm truncate">{branch.name}</span>
                {branch.name === currentBranch && (
                  <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                )}
              </div>
              
              {/* Branch Status */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {branch.ahead > 0 && (
                  <Badge variant="outline" className="h-4 px-1 text-xs bg-white/15 text-white/70 border-white/25">
                    ↑{branch.ahead}
                  </Badge>
                )}
                {branch.behind > 0 && (
                  <Badge variant="outline" className="h-4 px-1 text-xs bg-white/10 text-white/60 border-white/20">
                    ↓{branch.behind}
                  </Badge>
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </div>
        
        {onCreateBranch && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onCreateBranch} className="text-sm">
              <Plus className="w-3 h-3 mr-2" />
              Create new branch
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}