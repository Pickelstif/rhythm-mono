import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ScheduleItem } from '../types';
import { Button } from '@/components/ui/button';
import { X, Clock, Music } from 'lucide-react';

interface DraggableEventProps {
  event: ScheduleItem;
  onRemove?: (eventId: string) => void;
}

export function DraggableEvent({ event, onRemove }: DraggableEventProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: event.id,
    data: {
      type: 'event',
      event,
    },
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        group relative bg-gradient-to-br from-rhythm-500 to-rhythm-600 
        text-white rounded-lg p-3 shadow-lg cursor-grab active:cursor-grabbing
        border border-rhythm-400 transition-all duration-200
        hover:shadow-xl hover:scale-[1.02] min-h-[80px]
        ${isDragging ? 'z-50 rotate-2' : ''}
      `}
    >
      {/* Band Name */}
      <div className="flex items-center gap-2 mb-2">
        <Music className="h-4 w-4 text-rhythm-200" />
        <span className="font-semibold text-sm truncate">
          {event.band?.name || event.title}
        </span>
      </div>

      {/* Time Display */}
      <div className="flex items-center gap-1 text-rhythm-200 text-xs">
        <Clock className="h-3 w-3" />
        <span>
          {formatTime(event.start_time)} - {formatTime(event.end_time)}
        </span>
      </div>

      {/* Remove Button */}
      {onRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(event.id);
          }}
          className="
            absolute -top-2 -right-2 h-6 w-6 p-0 
            bg-red-500 hover:bg-red-600 text-white rounded-full
            opacity-0 group-hover:opacity-100 transition-opacity
            shadow-md
          "
        >
          <X className="h-3 w-3" />
        </Button>
      )}

      {/* Drag Indicator */}
      <div className="absolute bottom-1 right-1">
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-rhythm-300 rounded-full opacity-60"></div>
          <div className="w-1 h-1 bg-rhythm-300 rounded-full opacity-60"></div>
          <div className="w-1 h-1 bg-rhythm-300 rounded-full opacity-60"></div>
        </div>
      </div>
    </div>
  );
} 