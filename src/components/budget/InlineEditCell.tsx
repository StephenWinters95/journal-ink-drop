import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";

interface InlineEditCellProps {
  value: string | number | Date;
  onSave: (value: any) => void;
  onCancel: () => void;
  type: 'text' | 'number' | 'date' | 'select';
  options?: { value: string; label: string }[];
  className?: string;
}

const InlineEditCell: React.FC<InlineEditCellProps> = ({
  value,
  onSave,
  onCancel,
  type,
  options,
  className = ""
}) => {
  const [editValue, setEditValue] = useState(() => {
    if (type === 'date' && value instanceof Date) {
      return format(value, 'yyyy-MM-dd');
    }
    return String(value || '');
  });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    } else if (selectRef.current) {
      selectRef.current.focus();
    }
  }, []);

  const handleSave = () => {
    let finalValue: any = editValue;
    
    if (type === 'number') {
      finalValue = parseFloat(editValue) || 0;
    } else if (type === 'date') {
      finalValue = parseISO(editValue);
    }
    
    onSave(finalValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  if (type === 'select' && options) {
    return (
      <Select
        value={editValue}
        onValueChange={(value) => {
          setEditValue(value);
          onSave(value); // Auto-save on selection
        }}
        open={true} // Keep dropdown open immediately
      >
        <SelectTrigger className={`w-full h-8 ${className}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Input
      ref={inputRef}
      type={type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'}
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`h-8 px-2 border-primary ${className}`}
      step={type === 'number' ? '0.01' : undefined}
    />
  );
};

export default InlineEditCell;