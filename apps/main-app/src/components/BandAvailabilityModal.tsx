import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarDays, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface BandAvailability {
  id: string;
  available_date: string;
  start_time?: string;
  end_time?: string;
  notes?: string;
}

interface BandAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    date: Date;
    startTime?: string;
    endTime?: string;
    notes?: string;
  }) => void;
  selectedDate: Date | null;
  existingAvailability?: BandAvailability | null;
}

export const BandAvailabilityModal = ({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  existingAvailability
}: BandAvailabilityModalProps) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Reset form when modal opens/closes or when editing different availability
  useEffect(() => {
    if (isOpen) {
      if (existingAvailability) {
        // Editing existing availability
        setDate(new Date(existingAvailability.available_date));
        setStartTime(existingAvailability.start_time || '');
        setEndTime(existingAvailability.end_time || '');
        setNotes(existingAvailability.notes || '');
      } else if (selectedDate) {
        // Adding new availability for selected date
        setDate(selectedDate);
        setStartTime('');
        setEndTime('');
        setNotes('');
      } else {
        // Adding new availability without pre-selected date
        setDate(undefined);
        setStartTime('');
        setEndTime('');
        setNotes('');
      }
    }
  }, [isOpen, existingAvailability, selectedDate]);

  const handleSave = () => {
    if (!date) return;

    onSave({
      date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      notes: notes || undefined,
    });
  };

  const isFormValid = () => {
    if (!date) return false;
    
    // If both times are provided, start time should be before end time
    if (startTime && endTime) {
      return startTime < endTime;
    }
    
    return true;
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeStr);
      }
    }
    return options;
  };

  const formatTimeDisplay = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {existingAvailability ? 'Edit Band Availability' : 'Add Band Availability'}
          </DialogTitle>
          <DialogDescription>
            Set when your band is available for gigs and events. You can specify time ranges or leave blank for all-day availability.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {date ? format(date, "MMMM d, yyyy") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    setDate(newDate);
                    setIsCalendarOpen(false);
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time (Optional)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                >
                  <option value="">All day</option>
                  {generateTimeOptions().map((time) => (
                    <option key={time} value={time}>
                      {formatTimeDisplay(time)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time (Optional)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                >
                  <option value="">Open ended</option>
                  {generateTimeOptions().map((time) => (
                    <option key={time} value={time}>
                      {formatTimeDisplay(time)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Validation Message */}
          {startTime && endTime && startTime >= endTime && (
            <div className="text-sm text-destructive">
              Start time must be before end time
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional details about this availability..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Time Preview */}
          {date && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <h4 className="text-sm font-medium">Preview</h4>
              <p className="text-sm text-muted-foreground">
                <strong>{format(date, "MMMM d, yyyy")}</strong>
                {startTime || endTime ? (
                  <>
                    {' • '}
                    {startTime && endTime ? (
                      `${formatTimeDisplay(startTime)} - ${formatTimeDisplay(endTime)}`
                    ) : startTime ? (
                      `From ${formatTimeDisplay(startTime)}`
                    ) : endTime ? (
                      `Until ${formatTimeDisplay(endTime)}`
                    ) : (
                      'All day'
                    )}
                  </>
                ) : (
                  ' • All day availability'
                )}
              </p>
              {notes && (
                <p className="text-sm italic">"{notes}"</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!isFormValid()}
          >
            {existingAvailability ? 'Update' : 'Add'} Availability
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 