import React from 'react';
import { 
  GitBranch, 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  Minus, 
  Edit,
  FileQuestion,
  CheckCircle
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

// Simple file status indicator for individual files (used in VCSFileExplorer)
interface SimpleVCSStatusIndicatorProps {
  status: 'M' | 'A' | 'D' | 'L' | '??';
}

// Simple component for individual file status
export function VCSStatusIndicator({ status }: SimpleVCSStatusIndicatorProps) {
  const getStatusIcon = (status: SimpleVCSStatusIndicatorProps['status']) => {
    switch (status) {
      case 'M': return <Edit className="w-3 h-3" />;
      case 'A': return <Plus className="w-3 h-3" />;
      case 'D': return <Minus className="w-3 h-3" />;
      case '??': return <FileQuestion className="w-3 h-3" />;
      case 'L': return <CheckCircle className="w-3 h-3" />;
      default: return null;
    }
  };

  const getStatusColor = (status: SimpleVCSStatusIndicatorProps['status']) => {
    switch (status) {
      case 'M': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'A': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'D': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case '??': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'L': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return '';
    }
  };

  const getStatusLabel = (status: SimpleVCSStatusIndicatorProps['status']) => {
    switch (status) {
      case 'M': return 'Modified';
      case 'A': return 'Added';
      case 'D': return 'Deleted';
      case '??': return 'Untracked';
      case 'L': return 'Locked';
      default: return '';
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge variant="outline" className={`h-5 px-1.5 text-xs font-mono ${getStatusColor(status)}`}>
          {status}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>{getStatusLabel(status)}</p>
      </TooltipContent>
    </Tooltip>
  );
}