import React from 'react';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { cn } from './ui/utils';

interface EstimationSelectorProps {
  value?: number;
  onChange: (value: number | undefined) => void;
  className?: string;
  size?: 'default' | 'sm';
}

const fibonacciNumbers = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

export function EstimationSelector({ value, onChange, className, size = 'default' }: EstimationSelectorProps) {
  if (size === 'sm') {
    return (
      <div className={cn('flex flex-wrap gap-1', className)}>
        {fibonacciNumbers.map((number) => (
          <Button
            key={number}
            variant={value === number ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange(value === number ? undefined : number)}
            className="h-6 w-7 text-xs p-0"
          >
            {number}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col space-y-2', className)}>
      <label className="text-sm font-medium">Story Points</label>
      <div className="flex flex-wrap gap-1">
        {fibonacciNumbers.map((number) => (
          <Button
            key={number}
            variant={value === number ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange(value === number ? undefined : number)}
            className="h-8 w-10 text-xs"
          >
            {number}
          </Button>
        ))}
        {value && !fibonacciNumbers.includes(value) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange(undefined)}
            className="h-8 px-3 text-xs"
          >
            {value}
          </Button>
        )}
      </div>
      {value && (
        <div className="text-xs text-muted-foreground">
          Estimated: {value} story {value === 1 ? 'point' : 'points'}
        </div>
      )}
    </div>
  );
}