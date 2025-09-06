import React, { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './ui/utils';

interface ExpandableRowProps {
  children: ReactNode;
  expandedContent?: ReactNode;
  className?: string;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
  disabled?: boolean;
  hoverContent?: ReactNode;
}

export function ExpandableRow({
  children,
  expandedContent,
  className,
  defaultExpanded = false,
  expanded,
  onExpandChange,
  disabled = false,
  hoverContent
}: ExpandableRowProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  
  // Use controlled state if provided, otherwise use internal state
  const isExpanded = expanded !== undefined ? expanded : internalExpanded;

  const handleClick = () => {
    if (disabled || !expandedContent) return;
    const newExpanded = !isExpanded;
    
    if (expanded === undefined) {
      setInternalExpanded(newExpanded);
    }
    
    onExpandChange?.(newExpanded);
  };

  const hasExpandableContent = !!expandedContent;
  const isClickable = hasExpandableContent && !disabled;

  return (
    <div className="group border-b border-border/50 last:border-b-0">
      <div
        className={cn(
          "relative px-4 py-3 transition-all duration-150",
          isClickable && "cursor-pointer hover:bg-muted/40",
          className
        )}
        onClick={handleClick}
      >
        {/* Main row content */}
        {children}

        {/* Hover overlay content */}
        {hoverContent && (
          <div className="absolute inset-0 px-4 py-3 bg-muted/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {hoverContent}
          </div>
        )}
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && expandedContent && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden bg-muted/20 border-b border-border/30"
          >
            <div className="mx-4 border-l border-border/50 pl-6 py-4">
              {expandedContent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Convenience components for common patterns
interface ExpandableRowContentProps {
  avatar?: ReactNode;
  title: ReactNode;
  subtitle?: string;
  badges?: ReactNode[];
  actions?: ReactNode[];
}

export function ExpandableRowContent({
  avatar,
  title,
  subtitle,
  badges,
  actions
}: ExpandableRowContentProps) {
  return (
    <div className="flex items-center justify-between min-h-[32px]">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {avatar && (
          <div className="flex-shrink-0">
            {avatar}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm truncate">{title}</span>
            {badges && badges.length > 0 && (
              <div className="flex items-center gap-2 flex-shrink-0">
                {badges}
              </div>
            )}
          </div>
          {subtitle && (
            <div className="text-xs text-muted-foreground truncate mt-0.5">
              {subtitle}
            </div>
          )}
        </div>
      </div>
      
      {actions && actions.length > 0 && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
          {actions}
        </div>
      )}
    </div>
  );
}

// Hook for managing multiple expandable rows
export function useExpandableRows(defaultExpanded: string[] = []) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set(defaultExpanded));

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const isExpanded = (id: string) => expandedRows.has(id);

  const collapseAll = () => setExpandedRows(new Set());
  const expandAll = (ids: string[]) => setExpandedRows(new Set(ids));

  return {
    expandedRows,
    toggleRow,
    isExpanded,
    collapseAll,
    expandAll
  };
}