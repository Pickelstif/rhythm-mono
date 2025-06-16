import React, { useState, useRef } from 'react';
import { useDraggable, useDroppable, DraggableAttributes } from '@dnd-kit/core';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { ScheduleItem } from '../types';
import { Button } from '@/components/ui/button';
import { X, Clock, Music, Info } from 'lucide-react';
import { EventDetailsModal } from './EventDetailsModal';

interface ResizableEventProps {
  event: ScheduleItem;
  onRemove?: (eventId: string) => void;
  onResize?: (eventId: string, newDurationMinutes: number) => void;
  onTimeChange?: (eventId: string, newStartTime: string, newDurationMinutes: number) => void;
  onEventUpdate?: (eventId: string, updates: Partial<ScheduleItem>) => void;
  // Flag to indicate if this is used in a sortable context (to avoid drag conflicts)
  isSortable?: boolean;
  // Sortable drag props (when used in sortable context)
  dragAttributes?: DraggableAttributes;
  dragListeners?: SyntheticListenerMap;
  // Allow cross-day dragging even in sortable context
  allowCrossDayDrag?: boolean;
}

export function ResizableEvent({ 
  event, 
  onRemove, 
  onResize,
  onTimeChange,
  onEventUpdate,
  isSortable = false,
  dragAttributes,
  dragListeners,
  allowCrossDayDrag = false
}: ResizableEventProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const resizeStartRef = useRef<{ y: number; height: number } | null>(null);

  // Use draggable hook for cross-day moves
  const {
    attributes: crossDayAttributes,
    listeners: crossDayListeners,
    setNodeRef: setCrossDayNodeRef,
    transform: crossDayTransform,
    isDragging: isCrossDayDragging,
  } = useDraggable({
    id: event.id,
    data: {
      type: 'event',
      event,
    },
  });

  // Use droppable hook to allow other events to be dropped on this one
  const {
    isOver: isDropOver,
    setNodeRef: setDropNodeRef,
  } = useDroppable({
    id: `event-drop-${event.id}`,
    data: {
      type: 'event',
      event,
    },
  });

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  // Calculate height based on duration (30 minutes = 60px base height)
  const heightPx = Math.max(60, (event.duration_minutes / 30) * 60);
  
  // Determine if the event is too small to show full information
  const isSmallEvent = heightPx < 100;

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      y: e.clientY,
      height: heightPx,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizeStartRef.current || !onResize) return;

      const deltaY = moveEvent.clientY - resizeStartRef.current.y;
      const newHeight = Math.max(60, resizeStartRef.current.height + deltaY);
      
      // Convert height back to duration (60px = 30 minutes)
      const newDurationMinutes = Math.max(30, Math.round((newHeight / 60) * 30));
      
      // Snap to 30-minute intervals
      const snappedDuration = Math.round(newDurationMinutes / 30) * 30;
      
      if (snappedDuration !== event.duration_minutes) {
        onResize(event.id, snappedDuration);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      resizeStartRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleEventSave = (eventId: string, updates: Partial<ScheduleItem>) => {
    if (onEventUpdate) {
      onEventUpdate(eventId, updates);
    }
  };

  // Custom drag handling to avoid conflicts with buttons
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start drag if clicking on buttons or resize handle
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[data-resize-handle]')) {
      return;
    }
    
    // Apply drag listeners manually
    if (crossDayListeners && crossDayListeners.onMouseDown) {
      crossDayListeners.onMouseDown(e);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Don't start drag if clicking on buttons or resize handle
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[data-resize-handle]')) {
      return;
    }
    
    // Apply drag listeners manually
    if (crossDayListeners && crossDayListeners.onPointerDown) {
      crossDayListeners.onPointerDown(e);
    }
  };

  const crossDayStyle = {
    transform: crossDayTransform ? `translate3d(${crossDayTransform.x}px, ${crossDayTransform.y}px, 0)` : undefined,
    opacity: isCrossDayDragging ? 0.7 : 1,
  };

  // Combine refs for both draggable and droppable
  const setRefs = (element: HTMLDivElement | null) => {
    setCrossDayNodeRef(element);
    setDropNodeRef(element);
  };

  return (
    <>
      <div
        ref={setRefs}
        style={{
          height: `${heightPx}px`,
          ...crossDayStyle,
        }}
        className={`
          group relative bg-gradient-to-br from-rhythm-500 to-rhythm-600 
          text-white rounded-lg shadow-lg border border-rhythm-400 
          transition-all duration-200 hover:shadow-xl cursor-grab active:cursor-grabbing
          touch-none select-none
          ${isResizing ? 'cursor-ns-resize' : ''}
          ${isCrossDayDragging ? 'z-50 rotate-1' : ''}
          ${isDropOver ? 'ring-2 ring-rhythm-300 bg-rhythm-400' : ''}
          mb-2
        `}
        onMouseDown={handleMouseDown}
        onPointerDown={handlePointerDown}
        title="Drag to move event"
        {...crossDayAttributes}
      >
        {/* Content */}
        <div className="p-3 h-full flex flex-col">
          {!isSmallEvent ? (
            <>
              {/* Band Name - with text wrapping */}
              <div className="flex items-start gap-2 mb-2 flex-shrink-0">
                <Music className="h-4 w-4 text-rhythm-200 flex-shrink-0 mt-0.5" />
                <span className="font-semibold text-sm leading-tight break-words">
                  {event.band?.name || event.title}
                </span>
              </div>

              {/* Time and Duration with end time */}
              <div className="flex items-center gap-2 text-rhythm-200 text-xs flex-shrink-0">
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span className="break-words">
                  {formatTime(event.start_time)} - {formatTime(event.end_time)}
                </span>
              </div>
              
              {/* Duration on separate line if space allows */}
              {heightPx > 120 && (
                <div className="text-rhythm-200 text-xs mt-1 flex-shrink-0">
                  Duration: {formatDuration(event.duration_minutes)}
                </div>
              )}
            </>
          ) : (
            /* Small event - show band name */
            <div className="relative h-full flex items-center justify-center px-1">
              {/* Band Name - truncated for small space */}
              <div className="flex-1 min-w-0 text-center">
                <span className="font-semibold text-xs leading-tight truncate block">
                  {event.band?.name || event.title}
                </span>
              </div>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />
        </div>

        {/* Info Button - matches X button styling but in opposite corner */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setShowDetailsModal(true);
          }}
          className="
            absolute -top-2 -left-2 h-6 w-6 p-0 
            bg-blue-500 hover:bg-blue-600 text-white rounded-full
            opacity-0 group-hover:opacity-100 transition-opacity
            shadow-md z-10
          "
          title={`${event.band?.name || event.title} - Click for details`}
        >
          <span className="text-xs font-bold italic">i</span>
        </Button>

        {/* Remove Button */}
        {onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onRemove(event.id);
            }}
            className="
              absolute -top-2 -right-2 h-6 w-6 p-0 
              bg-red-500 hover:bg-red-600 text-white rounded-full
              opacity-0 group-hover:opacity-100 transition-opacity
              shadow-md z-10
            "
          >
            <X className="h-3 w-3" />
          </Button>
        )}

        {/* Resize Handle */}
        {onResize && (
          <div
            data-resize-handle
            className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto"
            onMouseDown={(e) => {
              e.stopPropagation();
              handleResizeStart(e);
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="w-8 h-1 bg-rhythm-300 rounded-full" />
          </div>
        )}

        {/* Visual feedback when resizing */}
        {isResizing && (
          <div className="absolute inset-0 bg-rhythm-600 opacity-20 rounded-lg pointer-events-none" />
        )}

        {/* Drop indicator */}
        {isDropOver && (
          <div className="absolute inset-0 border-2 border-rhythm-300 rounded-lg pointer-events-none bg-rhythm-600/20" />
        )}
      </div>

      {/* Event Details Modal */}
      <EventDetailsModal
        event={event}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onSave={handleEventSave}
      />
    </>
  );
} 