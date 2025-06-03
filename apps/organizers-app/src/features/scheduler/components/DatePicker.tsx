import React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DatePicker({ 
  date, 
  onDateChange, 
  placeholder = "Pick a date",
  disabled = false 
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          disabled={disabled}
          aria-label={date ? `Selected date: ${format(date, "PPPP")}` : "Select a date"}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            <div className="flex flex-col">
              <span className="font-medium">{format(date, "PPP")}</span>
              <span className="text-xs text-muted-foreground">{format(date, "EEEE")}</span>
            </div>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          initialFocus
          showOutsideDays={false}
          className="rounded-md border"
        />
      </PopoverContent>
    </Popover>
  );
} 