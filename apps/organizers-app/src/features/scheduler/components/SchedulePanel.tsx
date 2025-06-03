import React, { useState } from 'react';
import { ScheduleItem } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';

interface SchedulePanelProps {
  scheduledEvents: ScheduleItem[];
  currentDate: string;
  onAddCustomEvent: (title: string, startTime: string, endTime: string) => void;
  isLoading: boolean;
}

function formatTime(timeStr: string): string {
  // Assuming timeStr is in HH:mm format
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const formattedHours = h % 12 || 12; // Convert 0 to 12 for 12 AM/PM
  return `${formattedHours}:${minutes} ${ampm}`;
}

export function SchedulePanel({
  scheduledEvents,
  currentDate,
  onAddCustomEvent,
  isLoading,
}: SchedulePanelProps) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [customEventTitle, setCustomEventTitle] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:00');

  const handleAddCustomEvent = () => {
    if (customEventTitle.trim() === '') {
        alert('Event title cannot be empty.'); // Basic validation
        return;
    }
    onAddCustomEvent(customEventTitle, startTime, endTime);
    setIsModalOpen(false);
    setCustomEventTitle(''); // Reset form
  };

  if (isLoading) {
    return <Card><CardHeader><CardTitle>Schedule for {currentDate}</CardTitle></CardHeader><CardContent><p>Loading...</p></CardContent></Card>;
  }

  return (
    <Card className="flex-1">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Schedule for {new Date(currentDate + 'T00:00:00').toLocaleDateString()}</CardTitle>
        <Button onClick={() => setIsModalOpen(true)}>Add Custom Event</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {scheduledEvents.length === 0 && <p>No events scheduled for this date.</p>}
        {scheduledEvents.map((event) => (
          <Card key={event.id} className="p-4">
             <CardHeader className="p-0 mb-2">
                <CardTitle className="text-lg">{event.title || event.band?.name || 'Event'}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-sm text-muted-foreground">
                <p>Time: {formatTime(event.start_time)} - {formatTime(event.end_time)}</p>
                {event.band?.name && <p>Band: {event.band.name}</p>}
                {event.organizer?.name && <p>Organizer: {event.organizer.name}</p>}
            </CardContent>
          </Card>
        ))}
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Event to Schedule</DialogTitle>
            <DialogDescription>
              Enter the details for the custom event.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-title" className="text-right">
                Title
              </Label>
              <Input
                id="event-title"
                value={customEventTitle}
                onChange={(e) => setCustomEventTitle(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Sound Check / Setup"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start-time-custom" className="text-right">
                Start Time
              </Label>
              <Input
                id="start-time-custom"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end-time-custom" className="text-right">
                End Time
              </Label>
              <Input
                id="end-time-custom"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCustomEvent}>Add Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
} 