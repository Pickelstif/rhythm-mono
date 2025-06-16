import React, { useState } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  MouseSensor,
  KeyboardSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { WeekSchedule, TimeSelectionModal as TimeSelectionModalType, CustomBandForm, DragItem } from '../types';
import { DroppableDayColumn } from './DroppableDayColumn';
import { ResizableEvent } from './ResizableEvent';
import { TimeSelectionModal } from './TimeSelectionModal';
import { CustomBandModal } from './CustomBandModal';
import { AvailableBandsPanel } from './AvailableBandsPanel';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Plus, Music, Clock } from 'lucide-react';
import { ScheduleItem, AvailableBandItem } from '../types';

interface WeekViewProps {
  weekSchedule: WeekSchedule;
  selectedDay: string | null;
  onDaySelect: (date: string) => void;
  onNavigateWeek: (direction: 'prev' | 'next') => void;
  onGoToToday: () => void;
  onDragEnd: (event: DragEndEvent) => void;
  onRemoveEvent: (eventId: string) => void;
  onResizeEvent: (eventId: string, newDurationMinutes: number) => void;
  onReorderEvents: (date: string, eventIds: string[]) => void;
  onEventUpdate?: (eventId: string, updates: Partial<ScheduleItem>) => void;
  currentWeekStart: Date;
  timeSelectionModal: TimeSelectionModalType;
  onTimeSelectionConfirm: (startTime: string, durationMinutes: number) => void;
  onTimeSelectionClose: () => void;
  onAddCustomBand: (customBand: CustomBandForm) => void;
  onAddBandToSchedule: (band: AvailableBandItem, startTime: string, endTime: string) => void;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
}

export function WeekView({
  weekSchedule,
  selectedDay,
  onDaySelect,
  onNavigateWeek,
  onGoToToday,
  onDragEnd,
  onRemoveEvent,
  onResizeEvent,
  onReorderEvents,
  onEventUpdate,
  currentWeekStart,
  timeSelectionModal,
  onTimeSelectionConfirm,
  onTimeSelectionClose,
  onAddCustomBand,
  onAddBandToSchedule,
  hasUnsavedChanges,
  isSaving,
  onSave,
}: WeekViewProps) {
  const [activeDragItem, setActiveDragItem] = useState<{ type: 'band' | 'event'; band?: AvailableBandItem; event?: ScheduleItem } | null>(null);
  const [showCustomBandModal, setShowCustomBandModal] = useState(false);
  const [bandsRefreshTrigger, setBandsRefreshTrigger] = useState(0);

  // Configure sensors for both mouse and touch devices
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag (prevents accidental drags)
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms hold delay for touch devices
        tolerance: 8, // 8px movement tolerance during delay
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(KeyboardSensor) // For accessibility
  );

  const formatWeekRange = () => {
    // Parse date strings to create dates in local timezone
    const [startYear, startMonth, startDay] = weekSchedule.startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = weekSchedule.endDate.split('-').map(Number);
    const startDate = new Date(startYear, startMonth - 1, startDay); // month is 0-indexed
    const endDate = new Date(endYear, endMonth - 1, endDay); // month is 0-indexed
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return `${months[startDate.getMonth()]} ${startDate.getDate()} - ${months[endDate.getMonth()]} ${endDate.getDate()}, ${endDate.getFullYear()}`;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragItem(event.active.data.current as { type: 'band' | 'event'; band?: AvailableBandItem; event?: ScheduleItem });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragItem(null);
    onDragEnd(event);
  };

  const handleCustomBandAdd = async (customBand: CustomBandForm) => {
    await onAddCustomBand(customBand);
    // Trigger refresh of bands list after creating a new band
    setBandsRefreshTrigger(prev => prev + 1);
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-full gap-6">
        {/* Left Sidebar - Available Bands */}
        <div className="w-80 flex-shrink-0 h-full">
          <div className="bg-card rounded-xl shadow-sm border h-full flex flex-col">
            {/* Custom Band Button */}
            <div className="p-4 border-b flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCustomBandModal(true)}
                className="w-full flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Custom Band
              </Button>
            </div>

            {/* Available Bands Panel */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <AvailableBandsPanel
                selectedDate={selectedDay}
                onAddBandToSchedule={onAddBandToSchedule}
                isLoading={false}
                refreshTrigger={bandsRefreshTrigger}
              />
            </div>
          </div>
        </div>

        {/* Right Side - Week View */}
        <div className="flex-1 min-w-0 h-full">
          <div className="space-y-1 h-full flex flex-col">
            {/* Week Navigation */}
            <div className="flex items-center justify-between flex-shrink-0 py-0.5">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold">Week View</h2>
                <div className="text-muted-foreground text-xs">
                  {formatWeekRange()}
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {/* Save Button */}
                {hasUnsavedChanges && (
                  <Button
                    onClick={onSave}
                    disabled={isSaving}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 h-8 text-xs"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onGoToToday}
                  className="flex items-center gap-2 h-8"
                >
                  <Calendar className="h-3 w-3" />
                  <span className="text-xs">Today</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigateWeek('prev')}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigateWeek('next')}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Week Grid */}
            <div className="bg-card rounded-xl shadow-sm border overflow-hidden flex-1 min-h-0">
              <div className="grid grid-cols-7 h-full min-h-[80vh]">
                {weekSchedule.days.map((day) => (
                  <div key={day.date} className="border-r border-border last:border-r-0">
                    <DroppableDayColumn
                      date={day.date}
                      events={day.scheduledEvents}
                      isSelected={selectedDay === day.date}
                      onSelect={() => onDaySelect(day.date)}
                      onEventsReorder={(eventIds) => onReorderEvents(day.date, eventIds)}
                      onRemoveEvent={onRemoveEvent}
                      onResizeEvent={onResizeEvent}
                      onEventUpdate={onEventUpdate}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TimeSelectionModal
        isOpen={timeSelectionModal.isOpen}
        onClose={onTimeSelectionClose}
        onConfirm={onTimeSelectionConfirm}
        band={timeSelectionModal.band}
        dayDate={timeSelectionModal.dayDate}
        suggestedStartTime={timeSelectionModal.suggestedStartTime}
      />

      <CustomBandModal
        isOpen={showCustomBandModal}
        onClose={() => setShowCustomBandModal(false)}
        onConfirm={handleCustomBandAdd}
      />

      {/* Drag Overlay */}
      <DragOverlay>
        {activeDragItem ? (
          activeDragItem.type === 'band' ? (
            <BandDragPreview band={activeDragItem.band} />
          ) : (
            <ResizableEvent event={activeDragItem.event} />
          )
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// Component to show what a band will look like as an event card
function BandDragPreview({ band }: { band: AvailableBandItem }) {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div
      className="
        relative bg-gradient-to-br from-rhythm-500 to-rhythm-600 
        text-white rounded-lg shadow-lg border border-rhythm-400 
        transition-all duration-200 w-48 h-20 rotate-1 z-50
      "
    >
      <div className="p-3 h-full flex flex-col">
        {/* Band Name */}
        <div className="flex items-start gap-2 mb-1 flex-shrink-0">
          <Music className="h-4 w-4 text-rhythm-200 flex-shrink-0 mt-0.5" />
          <span className="font-semibold text-sm leading-tight break-words">
            {band.band?.name || 'Unknown Band'}
          </span>
        </div>

        {/* Default duration preview */}
        <div className="flex items-center gap-2 text-rhythm-200 text-xs flex-shrink-0">
          <Clock className="h-3 w-3 flex-shrink-0" />
          <span>1 hour duration</span>
        </div>
      </div>
    </div>
  );
} 