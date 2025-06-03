import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { TimeSlot, ScheduleItem } from '../types';
import { DraggableEvent } from './DraggableEvent';
import { Plus } from 'lucide-react';

interface DroppableTimeSlotProps {
  timeSlot: TimeSlot;
  events: ScheduleItem[];
  onRemoveEvent?: (eventId: string) => void;
}

export function DroppableTimeSlot({ 
  timeSlot, 
  events, 
  onRemoveEvent 
}: DroppableTimeSlotProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: timeSlot.id,
    data: {
      type: 'timeslot',
      timeSlot,
    },
  });

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Filter events that fall within this time slot
  const slotEvents = events.filter(event => {
    const eventStart = event.start_time;
    const eventEnd = event.end_time;
    const slotStart = timeSlot.startTime;
    const slotEnd = timeSlot.endTime;
    
    // Event overlaps with this time slot if it starts before slot ends and ends after slot starts
    return eventStart < slotEnd && eventEnd > slotStart;
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        relative min-h-[60px] border border-border rounded-lg transition-all duration-200
        ${isOver 
          ? 'bg-rhythm-50 dark:bg-rhythm-950 border-rhythm-400 shadow-md' 
          : 'bg-card hover:bg-accent/30'
        }
      `}
    >
      {/* Time Label */}
      <div className="absolute -left-20 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
        {formatTime(timeSlot.startTime)}
      </div>

      {/* Drop Zone Content */}
      <div className="p-2 h-full">
        {slotEvents.length > 0 ? (
          <div className="space-y-1">
            {slotEvents.map(event => (
              <DraggableEvent
                key={event.id}
                event={event}
                onRemove={onRemoveEvent}
              />
            ))}
          </div>
        ) : (
          <div className={`
            h-full min-h-[48px] border-2 border-dashed rounded-md flex items-center justify-center
            transition-all duration-200
            ${isOver 
              ? 'border-rhythm-400 bg-rhythm-100 dark:bg-rhythm-900' 
              : 'border-border/50 hover:border-border'
            }
          `}>
            {isOver ? (
              <div className="text-rhythm-600 dark:text-rhythm-400 text-sm font-medium flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Drop here
              </div>
            ) : (
              <div className="text-muted-foreground/50 text-xs">
                {formatTime(timeSlot.startTime)} - {formatTime(timeSlot.endTime)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Visual feedback for drag over */}
      {isOver && (
        <div className="absolute inset-0 bg-rhythm-500/10 border-2 border-rhythm-400 rounded-lg pointer-events-none" />
      )}
    </div>
  );
} 