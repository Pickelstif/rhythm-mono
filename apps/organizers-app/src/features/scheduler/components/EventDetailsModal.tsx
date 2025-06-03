import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScheduleItem } from '../types';
import { Music, Clock, Calendar } from 'lucide-react';

interface EventDetailsModalProps {
  event: ScheduleItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventId: string, updates: Partial<ScheduleItem>) => void;
}

export function EventDetailsModal({ 
  event, 
  isOpen, 
  onClose, 
  onSave 
}: EventDetailsModalProps) {
  const [startTime, setStartTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);

  useEffect(() => {
    if (event) {
      setStartTime(event.start_time);
      setDurationMinutes(event.duration_minutes);
    }
  }, [event]);

  // Generate time slots in 30-minute increments from 4 PM to 12 AM
  const generateTimeSlots = () => {
    const slots = [];
    // Generate slots from 4 PM (16:00) to 11:30 PM (23:30)
    for (let hour = 16; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = formatTimeDisplay(timeString);
        slots.push({ value: timeString, label: displayTime });
      }
    }
    // Add 12:00 AM (midnight) at the end
    slots.push({ value: '00:00', label: '12:00 AM' });
    
    // If event has a start time that's not in our predefined slots, add it
    if (event && event.start_time && !slots.some(slot => slot.value === event.start_time)) {
      const displayTime = formatTimeDisplay(event.start_time);
      slots.push({ value: event.start_time, label: `${displayTime} (current)` });
      // Sort slots by time, but treat 00:00 as coming after 23:30
      slots.sort((a, b) => {
        const [aHour, aMin] = a.value.split(':').map(Number);
        const [bHour, bMin] = b.value.split(':').map(Number);
        
        // Convert to minutes for comparison, treating 00:00 as 24:00 (1440 minutes)
        const aMinutes = aHour === 0 ? 24 * 60 + aMin : aHour * 60 + aMin;
        const bMinutes = bHour === 0 ? 24 * 60 + bMin : bHour * 60 + bMin;
        
        return aMinutes - bMinutes;
      });
    }
    
    return slots;
  };

  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + durationMinutes;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    if (!event) return;

    const endTime = calculateEndTime(startTime, durationMinutes);

    onSave(event.id, {
      start_time: startTime,
      end_time: endTime,
      duration_minutes: durationMinutes,
    });
    
    onClose();
  };

  const formatDate = (date: string) => {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} minutes`;
    if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minutes`;
  };

  if (!event) return null;

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5 text-rhythm-500" />
            Event Details
          </DialogTitle>
          <DialogDescription>
            View and edit the details for this scheduled event.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Band Information */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Music className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Band</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {event.band?.name || 'Custom Event'}
            </p>
          </div>

          {/* Date Information */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Date</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDate(event.date)}
            </p>
          </div>

          {/* Editable Fields */}
          <div className="space-y-4">
            {/* Start Time Selection */}
            <div className="space-y-2">
              <Label htmlFor="start-time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Start Time
              </Label>
              <Select value={startTime} onValueChange={setStartTime}>
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
                value={durationMinutes.toString()} 
                onValueChange={(value) => setDurationMinutes(parseInt(value))}
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
                {formatTimeDisplay(startTime)} - {formatTimeDisplay(calculateEndTime(startTime, durationMinutes))}
                <span className="ml-2">({durationMinutes} min)</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 