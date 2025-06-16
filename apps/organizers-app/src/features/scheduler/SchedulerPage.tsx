import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DragEndEvent } from '@dnd-kit/core';
import { useAuth } from '../../context/AuthContext';
import { useWeekScheduler } from './hooks/useWeekScheduler';
import { WeekView } from './components/WeekView';
import { AvailableBandItem, CustomBandForm } from './types';
import { Button } from '@/components/ui/button';
import Header from '../../components/Header';
import { 
  Bell,
  LogOut,
  ArrowLeft
} from 'lucide-react';

export function SchedulerPage() {
  const { signOut } = useAuth();
  const [signOutLoading, setSignOutLoading] = useState(false);
  
  const {
    weekSchedule,
    selectedDay,
    setSelectedDay,
    currentWeekStart,
    isLoading,
    error,
    timeSelectionModal,
    setTimeSelectionModal,
    navigateWeek,
    goToToday,
    addCustomBand,
    showTimeSelection,
    addBandToSchedule,
    moveEvent,
    reorderEvents,
    resizeEvent,
    removeEvent,
    updateEvent,
    getAllAvailableBands,
    saveChanges,
    hasUnsavedChanges,
    isSaving,
  } = useWeekScheduler();

  const handleSignOut = async () => {
    try {
      setSignOutLoading(true);
      await signOut();
    } catch (error) {
      console.error('Error during sign out:', error);
    } finally {
      setSignOutLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !weekSchedule) return;

    const dragData = active.data.current;
    const dropData = over.data.current;

    if (!dragData || !dropData) return;

    // Handle dropping a band onto a day
    if (dragData.type === 'band' && dropData.type === 'day') {
      const band = dragData.band;
      const dayDate = dropData.date;
      
      // Calculate the suggested start time using the same logic as the Add button
      const dayEvents = weekSchedule.days.find(d => d.date === dayDate)?.scheduledEvents || [];
      
      // Find the next available start time for a day based on existing events
      let suggestedTime = '19:00'; // Default start time
      if (dayEvents.length > 0) {
        // Sort events by start time
        const sortedEvents = [...dayEvents].sort((a, b) => a.start_time.localeCompare(b.start_time));
        
        // Find the latest end time
        let latestEndTime = '19:00';
        sortedEvents.forEach(event => {
          if (event.end_time > latestEndTime) {
            latestEndTime = event.end_time;
          }
        });
        
        // Add 30 minutes buffer
        const [hours, minutes] = latestEndTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + 30;
        const newHours = Math.floor(totalMinutes / 60);
        const newMinutes = totalMinutes % 60;
        
        // Don't schedule past 12 AM (midnight), but allow scheduling up to 12 AM
        if (newHours < 24) {
          suggestedTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
        }
      }
      
      const defaultDuration = 60; // Default 1 hour duration
      
      // Automatically schedule the band with the calculated time
      addBandToSchedule(
        band.band_id,
        dayDate,
        suggestedTime,
        defaultDuration
      );
      return;
    }

    // Handle event dragging
    if (dragData.type === 'event') {
      const draggedEvent = dragData.event;
      
      // Handle dropping event on another event (reordering within same day)
      if (dropData.type === 'event') {
        const targetEvent = dropData.event;
        
        // Only reorder if they're in the same day
        if (draggedEvent.date === targetEvent.date) {
          const dayEvents = weekSchedule.days
            .find(d => d.date === draggedEvent.date)?.scheduledEvents || [];
          
          const dragIndex = dayEvents.findIndex(e => e.id === draggedEvent.id);
          const dropIndex = dayEvents.findIndex(e => e.id === targetEvent.id);
          
          if (dragIndex !== -1 && dropIndex !== -1 && dragIndex !== dropIndex) {
            // Create new order array
            const sortedEvents = dayEvents.sort((a, b) => a.order_index - b.order_index);
            const newOrder = [...sortedEvents];
            const [movedEvent] = newOrder.splice(dragIndex, 1);
            newOrder.splice(dropIndex, 0, movedEvent);
            
            reorderEvents(draggedEvent.date, newOrder.map(e => e.id));
          }
        }
        return;
      }
      
      // Handle dropping event on a day (cross-day move)
      if (dropData.type === 'day') {
        const newDate = dropData.date;
        
        // Only move if it's a different day
        if (draggedEvent.date !== newDate) {
          moveEvent(draggedEvent.id, newDate);
        }
      }
    }
  };

  const handleTimeSelectionConfirm = (startTime: string, durationMinutes: number) => {
    if (timeSelectionModal.band && timeSelectionModal.dayDate) {
      addBandToSchedule(
        timeSelectionModal.band.band_id,
        timeSelectionModal.dayDate,
        startTime,
        durationMinutes
      );
    }
    setTimeSelectionModal({ isOpen: false });
  };

  const handleTimeSelectionClose = () => {
    setTimeSelectionModal({ isOpen: false });
  };

  const handleAddCustomBand = async (customBandForm: CustomBandForm) => {
    try {
      await addCustomBand(customBandForm);
    } catch (error) {
      console.error('Error adding custom band:', error);
      // You could add a toast notification here for user feedback
    }
  };

  const handleAddBandToSchedule = async (band: AvailableBandItem, startTime: string, endTime: string) => {
    if (!band.band_id || !band.available_date) {
      return;
    }

    // Calculate duration in minutes from start and end times
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    const durationMinutes = endTotalMinutes - startTotalMinutes;

    // Ensure positive duration
    if (durationMinutes <= 0) {
      console.error('Invalid time range: end time must be after start time');
      return;
    }

    await addBandToSchedule(
      band.band_id,
      band.available_date,
      startTime,
      durationMinutes
    );
  };

  if (isLoading && !weekSchedule) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          rightContent={
            <>
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleSignOut}
                disabled={signOutLoading}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                {signOutLoading ? 'Signing Out...' : 'Sign Out'}
              </Button>
            </>
          }
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rhythm-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading week schedule...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header 
        rightContent={
          <>
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              disabled={signOutLoading}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              {signOutLoading ? 'Signing Out...' : 'Sign Out'}
            </Button>
          </>
        }
      />

      <div className="flex-1 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col min-h-0">
        {/* Header with Back Navigation */}
        <div className="mb-2 flex-shrink-0">
          <div className="flex items-center gap-4 mb-2">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl font-bold">Week Scheduler</h1>
          <p className="text-muted-foreground text-sm">
            Drag and drop bands to schedule performances across the week.
          </p>
        </div>

        {/* Instructions Legend */}
        <div className="bg-muted/50 rounded-lg p-2 space-y-1 mb-2 flex-shrink-0">
          <h4 className="text-xs font-medium">How to use the scheduler:</h4>
          <div className="grid gap-0.5 text-xs">
            <div className="flex items-center gap-2">
              <span>👆</span>
              <span className="text-muted-foreground">
                Select a day to see available bands for that date
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>➕</span>
              <span className="text-muted-foreground">
                Use "Add to Schedule" to book bands or search all bands for more options
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>🖱️</span>
              <span className="text-muted-foreground">
                Drag events to reorder within a day or move to different days
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>↕️</span>
              <span className="text-muted-foreground">
                Resize events by dragging the bottom edge to adjust duration
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>✏️</span>
              <span className="text-muted-foreground">
                Double-click events to edit details or click (i) icon on small events for info
              </span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-xl relative mb-2 flex-shrink-0" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-1">{error.message}</span>
          </div>
        )}

        {/* Week View */}
        <div className="flex-1 min-h-0">
          {weekSchedule && (
            <WeekView
              weekSchedule={weekSchedule}
              selectedDay={selectedDay}
              onDaySelect={setSelectedDay}
              onNavigateWeek={navigateWeek}
              onGoToToday={goToToday}
              onDragEnd={handleDragEnd}
              onRemoveEvent={removeEvent}
              onResizeEvent={resizeEvent}
              onReorderEvents={reorderEvents}
              onEventUpdate={updateEvent}
              currentWeekStart={currentWeekStart}
              timeSelectionModal={timeSelectionModal}
              onTimeSelectionConfirm={handleTimeSelectionConfirm}
              onTimeSelectionClose={handleTimeSelectionClose}
              onAddCustomBand={handleAddCustomBand}
              onAddBandToSchedule={handleAddBandToSchedule}
              hasUnsavedChanges={hasUnsavedChanges}
              isSaving={isSaving}
              onSave={saveChanges}
            />
          )}
        </div>
      </div>
    </div>
  );
} 