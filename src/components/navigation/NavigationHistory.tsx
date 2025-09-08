import React from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../ui/tooltip';

interface NavigationHistoryEntry {
  path: string;
  timestamp: number;
  name: string;
}

interface NavigationHistoryProps {
  history: NavigationHistoryEntry[];
  currentIndex: number;
  onNavigateBack: () => void;
  onNavigateForward: () => void;
  onRefresh: () => void;
  onOpenInNewTab?: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  className?: string;
}

export const NavigationHistory: React.FC<NavigationHistoryProps> = ({
  history,
  currentIndex,
  onNavigateBack,
  onNavigateForward,
  onRefresh,
  onOpenInNewTab,
  canGoBack,
  canGoForward,
  className = '',
}) => {
  const currentEntry = history[currentIndex];
  const previousEntry = canGoBack ? history[currentIndex - 1] : null;
  const nextEntry = canGoForward ? history[currentIndex + 1] : null;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Back Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateBack}
            disabled={!canGoBack}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {previousEntry ? `Back to ${previousEntry.name}` : 'Go back'}
        </TooltipContent>
      </Tooltip>

      {/* Forward Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateForward}
            disabled={!canGoForward}
            className="h-8 w-8 p-0"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {nextEntry ? `Forward to ${nextEntry.name}` : 'Go forward'}
        </TooltipContent>
      </Tooltip>

      {/* Refresh Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="h-8 w-8 p-0"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Refresh current location
        </TooltipContent>
      </Tooltip>

      {/* Open in New Tab (if available) */}
      {onOpenInNewTab && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenInNewTab}
              className="h-8 w-8 p-0"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Open in new tab
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};
