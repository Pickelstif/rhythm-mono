import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AvailableBandItem } from '../types';
import { Clock, Music } from 'lucide-react';

interface TimeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (startTime: string, durationMinutes: number) => void;
  band?: AvailableBandItem;
  dayDate?: string;
  suggestedStartTime?: string;
}

export function TimeSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  band,
  dayDate,
  suggestedStartTime,
}: TimeSelectionModalProps) {
  const [selectedStartTime, setSelectedStartTime] = useState(suggestedStartTime || '19:00');
  const [selectedDuration, setSelectedDuration] = useState(60); // Default 1 hour

  // Generate time slots in 30-minute increments from 4 PM to 12 AM
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 16; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = formatTimeDisplay(timeString);
        slots.push({ value: timeString, label: displayTime });
      }
    }
    // Add 12:00 AM (midnight)
    slots.push({ value: '00:00', label: '12:00 AM' });
    return slots;
  };

  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDayDisplay = (dateString: string) => {
    // Parse date string components to avoid timezone interpretation
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + durationMinutes;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  const handleConfirm = () => {
    onConfirm(selectedStartTime, selectedDuration);
    onClose();
  };

  const timeSlots = generateTimeSlots();
  const durationOptions = [
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
    { value: 150, label: '2.5 hours' },
    { value: 180, label: '3 hours' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5 text-rhythm-600" />
            Schedule Performance
          </DialogTitle>
          <DialogDescription>
            Set the time and duration for{' '}
            <span className="font-medium">{band?.band?.name}</span>
            {dayDate && (
              <>
                {' '}on <span className="font-medium">{formatDayDisplay(dayDate)}</span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Start Time Selection */}
          <div className="space-y-2">
            <Label htmlFor="start-time" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Start Time
            </Label>
            <Select value={selectedStartTime} onValueChange={setSelectedStartTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select start time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot.value} value={slot.value}>
                    {slot.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration Selection */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Select 
              value={selectedDuration.toString()} 
              onValueChange={(value) => setSelectedDuration(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Summary */}
          <div className="bg-muted rounded-lg p-3">
            <div className="text-sm font-medium mb-1">Performance Schedule:</div>
            <div className="text-sm text-muted-foreground">
              {formatTimeDisplay(selectedStartTime)} - {formatTimeDisplay(calculateEndTime(selectedStartTime, selectedDuration))}
              <span className="ml-2">({selectedDuration} min)</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="bg-rhythm-600 hover:bg-rhythm-700">
            Schedule Performance
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 