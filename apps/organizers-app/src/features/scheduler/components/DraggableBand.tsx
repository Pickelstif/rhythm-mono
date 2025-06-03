import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { AvailableBandItem } from '../types';
import { Music, Clock, Calendar } from 'lucide-react';

interface DraggableBandProps {
  band: AvailableBandItem;
}

export function DraggableBand({ band }: DraggableBandProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `band-${band.id}`,
    data: {
      type: 'band',
      band,
    },
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.7 : 1,
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (time: string) => {
    if (!time) return '';
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
        group relative bg-gradient-to-br from-blue-500 to-blue-600 
        text-white rounded-lg p-4 shadow-md cursor-grab active:cursor-grabbing
        border border-blue-400 transition-all duration-200
        hover:shadow-lg hover:scale-[1.02] min-h-[100px]
        ${isDragging ? 'z-50 rotate-1' : ''}
      `}
    >
      {/* Band Name */}
      <div className="flex items-center gap-2 mb-3">
        <Music className="h-5 w-5 text-blue-200" />
        <span className="font-bold text-base truncate">
          {band.band?.name}
        </span>
      </div>

      {/* Availability Date */}
      <div className="flex items-center gap-2 mb-2 text-blue-200 text-sm">
        <Calendar className="h-4 w-4" />
        <span>{formatDate(band.available_date)}</span>
      </div>

      {/* Time Range */}
      {band.start_time && band.end_time && (
        <div className="flex items-center gap-2 text-blue-200 text-xs">
          <Clock className="h-3 w-3" />
          <span>
            {formatTime(band.start_time)} - {formatTime(band.end_time)}
          </span>
        </div>
      )}

      {/* Notes */}
      {band.notes && (
        <div className="mt-2 text-blue-100 text-xs truncate">
          {band.notes}
        </div>
      )}

      {/* Drag Indicator */}
      <div className="absolute bottom-2 right-2">
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-blue-300 rounded-full opacity-60"></div>
          <div className="w-1 h-1 bg-blue-300 rounded-full opacity-60"></div>
          <div className="w-1 h-1 bg-blue-300 rounded-full opacity-60"></div>
        </div>
      </div>

      {/* Visual feedback when dragging */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-600 opacity-20 rounded-lg"></div>
      )}
    </div>
  );
} 