import React from 'react';
import {
  useDroppable,
} from '@dnd-kit/core';
import { ScheduleItem } from '../types';
import { ResizableEvent } from './ResizableEvent';
import { Plus } from 'lucide-react';

interface DroppableDayColumnProps {
  date: string;
  events: ScheduleItem[];
  isSelected?: boolean;
  onSelect?: () => void;
  onEventsReorder?: (eventIds: string[]) => void;
  onRemoveEvent?: (eventId: string) => void;
  onResizeEvent?: (eventId: string, newDurationMinutes: number) => void;
  onEventUpdate?: (eventId: string, updates: Partial<ScheduleItem>) => void;
}

export function DroppableDayColumn({
  date,
  events,
  isSelected,
  onSelect,
  onEventsReorder,
  onRemoveEvent,
  onResizeEvent,
  onEventUpdate,
}: DroppableDayColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `day-${date}`,
    data: {
      type: 'day',
      date,
    },
  });

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // Create date in local timezone
    return date.getDate();
  };

  const formatDayName = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // Create date in local timezone
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[date.getDay()].substring(0, 3); // Get first 3 letters
  };

  const isToday = (dateString: string) => {
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return dateString === todayString;
  };

  const sortedEvents = [...events].sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="flex flex-col h-full">
      {/* Day Header */}
      <button
        onClick={onSelect}
        className={`
          p-3 text-center border-b transition-colors
          ${isSelected 
            ? 'bg-rhythm-100 dark:bg-rhythm-900 text-rhythm-700 dark:text-rhythm-300' 
            : 'bg-muted/50 hover:bg-accent'
          }
          ${isToday(date) ? 'font-bold text-rhythm-600 dark:text-rhythm-400' : ''}
        `}
      >
        <div className="font-medium text-sm">{formatDayName(date)}</div>
        <div className={`text-lg ${isToday(date) ? 'text-rhythm-600 dark:text-rhythm-400' : ''}`}>
          {formatDate(date)}
        </div>
        {isToday(date) && (
          <div className="text-xs text-rhythm-600 dark:text-rhythm-400 font-medium">Today</div>
        )}
      </button>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 p-3 transition-all duration-200 min-h-[400px]
          ${isOver 
            ? 'bg-rhythm-50 dark:bg-rhythm-950 border-2 border-rhythm-400 border-dashed' 
            : 'border-2 border-transparent'
          }
        `}
      >
        {sortedEvents.length > 0 ? (
          <div className="space-y-2">
            {sortedEvents.map((event) => (
              <ResizableEvent
                key={event.id}
                event={event}
                onRemove={onRemoveEvent}
                onResize={onResizeEvent}
                onEventUpdate={onEventUpdate}
                isSortable={false}
                allowCrossDayDrag={true}
              />
            ))}
          </div>
        ) : (
          <div className={`
            h-full border-2 border-dashed rounded-md flex flex-col items-center justify-center
            transition-all duration-200
            ${isOver 
              ? 'border-rhythm-400 bg-rhythm-100 dark:bg-rhythm-900' 
              : 'border-border/50 hover:border-border'
            }
          `}>
            {isOver ? (
              <div className="text-rhythm-600 dark:text-rhythm-400 text-sm font-medium flex flex-col items-center gap-2">
                <Plus className="h-6 w-6" />
                Drop band here
              </div>
            ) : (
              <div className="text-muted-foreground/50 text-sm text-center">
                <div className="mb-2">No performances</div>
                <div className="text-xs">Drop bands here to schedule</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 