import React, { useState, useRef, useEffect } from 'react';
import { Edit3, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from './ui/button';

interface DropdownItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  destructive?: boolean;
}

interface CustomDropdownProps {
  items: DropdownItem[];
  trigger?: React.ReactNode;
}

export function CustomDropdown({ items, trigger }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const handleItemClick = (item: DropdownItem) => {
    setIsOpen(false);
    item.onClick();
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {trigger ? (
        <div onClick={handleTriggerClick} className="cursor-pointer">
          {trigger}
        </div>
      ) : (
        <Button
          ref={triggerRef}
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-60 hover:opacity-100 transition-opacity"
          onClick={handleTriggerClick}
        >
          <MoreHorizontal className="w-3 h-3" />
        </Button>
      )}
      
      {isOpen && (
        <>
          {/* Backdrop to catch outside clicks */}
          <div 
            className="fixed inset-0 z-[9998]" 
            onClick={() => setIsOpen(false)}
          />
          
          <div 
            className="absolute right-0 top-full mt-1 w-44 bg-popover text-popover-foreground border border-border rounded-md shadow-lg z-[9999] py-1 overflow-hidden"
            style={{ 
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: '4px'
            }}
          >
            {items.map((item, index) => (
              <button
                key={index}
                className={`w-full px-3 py-2 text-left text-sm transition-colors flex items-center gap-2 border-none bg-transparent outline-none ${
                  item.destructive 
                    ? 'text-destructive hover:bg-destructive/10 focus:bg-destructive/10' 
                    : 'text-popover-foreground hover:bg-accent focus:bg-accent'
                }`}
                onClick={() => handleItemClick(item)}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Convenience components for common dropdown patterns
interface EditDeleteDropdownProps {
  onEdit: () => void;
  onDelete: () => void;
  itemName?: string;
}

export function EditDeleteDropdown({ onEdit, onDelete, itemName }: EditDeleteDropdownProps) {
  const items: DropdownItem[] = [
    {
      label: 'Edit',
      icon: Edit3,
      onClick: () => {
        console.log('Edit clicked for:', itemName);
        onEdit();
      }
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: () => {
        console.log('Delete clicked for:', itemName);
        onDelete();
      },
      destructive: true
    }
  ];

  return <CustomDropdown items={items} />;
}
