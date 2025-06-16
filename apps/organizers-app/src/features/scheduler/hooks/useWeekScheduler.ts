import React, { useState, useEffect, useCallback } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { 
  WeekSchedule, 
  DaySchedule, 
  ScheduleItem, 
  AvailableBandItem, 
  Band,
  CustomBandForm,
  TimeSelectionModal,
  Schedule
} from '../types';
import { supabase } from '@rhythm-sync/database';
import { useAuth } from '../../../context/AuthContext';

// Get the start of the week (Monday) for a given date
function getWeekStart(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()); // Create date in local timezone
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  // Calculate days to subtract to get to Monday
  // If day is 0 (Sunday), we need to go back 6 days
  // If day is 1 (Monday), we need to go back 0 days
  // If day is 2 (Tuesday), we need to go back 1 day, etc.
  const daysToSubtract = day === 0 ? 6 : day - 1;
  
  d.setDate(d.getDate() - daysToSubtract);
  return d;
}

// Format date as YYYY-MM-DD using local timezone
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate week dates (Monday to Sunday)
function getWeekDates(startDate: Date): string[] {
  const dates: string[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
    const dateString = formatDate(date);
    dates.push(dateString);
  }
  
  return dates;
}

// Mock data generators
function generateMockBands(): Band[] {
  return [
    { id: '1', name: 'Electric Dreams' },
    { id: '2', name: 'Jazz Collective' },
    { id: '3', name: 'Rock Legends' },
    { id: '4', name: 'Indie Vibes' },
    { id: '5', name: 'Classical Masters' },
    { id: '6', name: 'Folk Tales' },
    { id: '7', name: 'Electronic Pulse' },
    { id: '8', name: 'Blues Brothers' },
  ];
}

function generateMockAvailability(bands: Band[], dates: string[]): AvailableBandItem[] {
  const availability: AvailableBandItem[] = [];
  
  bands.forEach(band => {
    // Each band is available on 2-4 random days of the week
    // Create a copy of the dates array before sorting to avoid mutating the original
    const availableDays = [...dates].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 2);
    
    availableDays.forEach(date => {
      // Create timezone-agnostic weekday name
      const [year, month, day] = date.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const weekdayName = weekdays[dateObj.getDay()];
      
      availability.push({
        id: `avail-${band.id}-${date}`,
        band_id: band.id,
        band,
        available_date: date,
        start_time: '09:00',
        end_time: '23:00',
        notes: `Available all day on ${weekdayName}`,
      });
    });
  });
  
  return availability;
}

function generateMockScheduledEvents(bands: Band[], dates: string[]): ScheduleItem[] {
  const events: ScheduleItem[] = [];
  
  // Add some random scheduled events
  const eventCount = Math.floor(Math.random() * 8) + 5; // 5-12 events
  
  for (let i = 0; i < eventCount; i++) {
    const randomBand = bands[Math.floor(Math.random() * bands.length)];
    const randomDate = dates[Math.floor(Math.random() * dates.length)];
    const startHour = Math.floor(Math.random() * 8) + 16; // 4 PM to 11 PM
    const duration = [30, 60, 90, 120][Math.floor(Math.random() * 4)]; // 30min, 1h, 1.5h, 2h
    
    const endTime = calculateEndTime(
      `${startHour.toString().padStart(2, '0')}:00`,
      duration
    );
    
    events.push({
      id: `event-${i}`,
      date: randomDate,
      band_id: randomBand.id,
      band: randomBand,
      start_time: `${startHour.toString().padStart(2, '0')}:00`,
      end_time: endTime,
      organizer_id: 'user-1',
      title: `${randomBand.name} Performance`,
      duration_minutes: duration,
      order_index: 0, // Will be set correctly below
    });
  }
  
  // Group events by date and sort chronologically
  const eventsByDate = events.reduce((acc, event) => {
    if (!acc[event.date]) {
      acc[event.date] = [];
    }
    acc[event.date].push(event);
    return acc;
  }, {} as Record<string, ScheduleItem[]>);

  // Sort events within each date by start time and assign proper order_index
  const sortedEvents: ScheduleItem[] = [];
  Object.keys(eventsByDate).forEach(date => {
    const dayEvents = eventsByDate[date];
    dayEvents.sort((a, b) => a.start_time.localeCompare(b.start_time));
    
    // Assign order_index based on chronological order within the day
    dayEvents.forEach((event, index) => {
      event.order_index = index;
      sortedEvents.push(event);
    });
  });
  
  return sortedEvents;
}

// Calculate end time based on start time and duration
function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startMinutes = hours * 60 + minutes;
  const endMinutes = startMinutes + durationMinutes;
  const endHours = Math.floor(endMinutes / 60);
  const endMins = endMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
}

// Find the next available start time for a day
function findNextAvailableTime(events: ScheduleItem[]): string {
  if (events.length === 0) return '19:00';
  
  // Sort events by start time
  const sortedEvents = [...events].sort((a, b) => a.start_time.localeCompare(b.start_time));
  
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
  if (newHours >= 24) return '19:00'; // Default fallback
  
  return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
}

export function useWeekScheduler(initialDate?: Date) {
  const { user } = useAuth();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    getWeekStart(initialDate || new Date())
  );
  const [weekSchedule, setWeekSchedule] = useState<WeekSchedule | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [customBands, setCustomBands] = useState<Band[]>([]);
  const [timeSelectionModal, setTimeSelectionModal] = useState<TimeSelectionModal>({
    isOpen: false,
  });
  
  // Track changes for saving
  const [originalSchedules, setOriginalSchedules] = useState<Schedule[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load week schedule data
  const loadWeekSchedule = useCallback(async (weekStart: Date) => {
    setIsLoading(true);
    setError(null);

    try {
      const weekDates = getWeekDates(weekStart);
      const startDate = formatDate(weekStart);
      const endDate = weekDates[6];
      
      // Load schedules from database (only for current organizer)
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('schedules')
        .select(`
          *,
          band:bands(id, name)
        `)
        .gte('date', startDate)
        .lte('date', endDate)
        .eq('organizer_id', user?.id);

      if (schedulesError) {
        throw schedulesError;
      }

      // Load band availability from database
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('band_availability')
        .select(`
          *,
          band:bands(id, name)
        `)
        .gte('available_date', startDate)
        .lte('available_date', endDate);

      if (availabilityError) {
        throw availabilityError;
      }

      // Convert database schedules to ScheduleItem format
      const schedules: Schedule[] = schedulesData || [];
      const scheduledEvents: ScheduleItem[] = schedules.map(schedule => {
        // Calculate duration in minutes
        const [startHours, startMinutes] = schedule.start_time.split(':').map(Number);
        const [endHours, endMinutes] = schedule.end_time.split(':').map(Number);
        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;
        const durationMinutes = endTotalMinutes - startTotalMinutes;

        return {
          id: schedule.id,
          date: schedule.date,
          band_id: schedule.band_id,
          band: schedule.band,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          organizer_id: schedule.organizer_id,
          title: schedule.band?.name ? `${schedule.band.name} Performance` : 'Performance',
          duration_minutes: durationMinutes > 0 ? durationMinutes : 60,
          order_index: 0, // Will be set correctly below
          created_at: schedule.created_at,
          updated_at: schedule.updated_at,
        };
      });

      // Convert database availability to AvailableBandItem format
      const availability: AvailableBandItem[] = (availabilityData || []).map(avail => ({
        id: avail.id,
        band_id: avail.band_id,
        band: avail.band,
        available_date: avail.available_date,
        start_time: avail.start_time,
        end_time: avail.end_time,
        notes: avail.notes,
      }));

      // Group data by day and sort events by start time
      const days: DaySchedule[] = weekDates.map(date => {
        const dayEvents = scheduledEvents.filter(event => event.date === date);
        // Sort events by start time and assign order_index
        dayEvents.sort((a, b) => a.start_time.localeCompare(b.start_time));
        dayEvents.forEach((event, index) => {
          event.order_index = index;
        });

        return {
          date,
          availableBands: availability.filter(avail => avail.available_date === date),
          scheduledEvents: dayEvents,
        };
      });

      setWeekSchedule({
        startDate,
        endDate,
        days,
      });

      // Store original schedules for change tracking
      setOriginalSchedules([...schedules]);
      setHasUnsavedChanges(false);

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load week schedule'));
    } finally {
      setIsLoading(false);
    }
  }, [customBands]);

  // Navigate to different week
  const navigateWeek = useCallback((direction: 'prev' | 'next') => {
    const newWeekStart = new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), currentWeekStart.getDate());
    newWeekStart.setDate(newWeekStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newWeekStart);
  }, [currentWeekStart]);

  // Go to today's week
  const goToToday = useCallback(() => {
    setCurrentWeekStart(getWeekStart(new Date()));
  }, []);

  // Add custom band
  const addCustomBand = useCallback(async (customBandForm: CustomBandForm) => {
    if (!user?.id) {
      console.error('User not authenticated');
      return;
    }

    try {
      // Generate a real UUID for the band
      const bandId = crypto.randomUUID();
      
      // Insert the band into the database
      const { data: newBandData, error: insertError } = await supabase
        .from('bands')
        .insert({
          id: bandId,
          name: customBandForm.name,
          created_by: user.id,
        })
        .select('id, name, created_by, created_at')
        .single();

      if (insertError) {
        console.error('Error creating band:', insertError);
        throw insertError;
      }

      const newBand: Band = {
        id: newBandData.id,
        name: newBandData.name,
        created_by: newBandData.created_by,
        is_custom: true,
      };
      
      setCustomBands(prev => [...prev, newBand]);
      
      // Add availability for all days of current week
      if (weekSchedule) {
        const newAvailability: AvailableBandItem[] = weekSchedule.days.map(day => ({
          id: `avail-${newBand.id}-${day.date}`,
          band_id: newBand.id,
          band: newBand,
          available_date: day.date,
          start_time: '09:00',
          end_time: '23:00',
          notes: 'Custom band - available all week',
        }));

        setWeekSchedule(prev => {
          if (!prev) return prev;
          
          return {
            ...prev,
            days: prev.days.map(day => ({
              ...day,
              availableBands: [
                ...day.availableBands,
                ...newAvailability.filter(avail => avail.available_date === day.date),
              ],
            })),
          };
        });

        // Automatically trigger time selection modal for the selected day or today
        const targetDate = selectedDay || formatDate(new Date());
        const targetAvailability = newAvailability.find(avail => avail.available_date === targetDate);
        
        if (targetAvailability) {
          // Find suggested time for the target day
          const dayEvents = weekSchedule.days.find(d => d.date === targetDate)?.scheduledEvents || [];
          const suggestedTime = findNextAvailableTime(dayEvents);
          
          // Trigger the time selection modal for scheduling
          setTimeSelectionModal({
            isOpen: true,
            band: targetAvailability,
            dayDate: targetDate,
            suggestedStartTime: suggestedTime,
          });
        }
      }
    } catch (error) {
      console.error('Error creating custom band:', error);
      throw error;
    }
  }, [user, weekSchedule, selectedDay]);

  // Show time selection modal
  const showTimeSelection = useCallback((band: AvailableBandItem, dayDate: string) => {
    const dayEvents = weekSchedule?.days.find(d => d.date === dayDate)?.scheduledEvents || [];
    const suggestedTime = findNextAvailableTime(dayEvents);
    
    setTimeSelectionModal({
      isOpen: true,
      band,
      dayDate,
      suggestedStartTime: suggestedTime,
    });
  }, [weekSchedule]);

  // Mark changes as unsaved when schedule is modified
  const markUnsavedChanges = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  // Add band to schedule with time selection
  const addBandToSchedule = useCallback(async (
    bandId: string, 
    date: string, 
    startTime: string, 
    durationMinutes: number
  ) => {
    if (!weekSchedule) {
      return;
    }

    // Try to find band in existing availableBands first
    let band = weekSchedule.days
      .flatMap(day => day.availableBands)
      .find(avail => avail.band_id === bandId)?.band;

    // If not found, fetch band information from database
    if (!band) {
      try {
        const { data: bandData, error } = await supabase
          .from('bands')
          .select('id, name')
          .eq('id', bandId)
          .single();

        if (error || !bandData) {
          console.error('Error fetching band:', error);
          return;
        }

        band = {
          id: bandData.id,
          name: bandData.name,
        };
      } catch (error) {
        console.error('Error fetching band:', error);
        return;
      }
    }

    if (!band) {
      return;
    }

    const endTime = calculateEndTime(startTime, durationMinutes);

    const newEvent: ScheduleItem = {
      id: `event-${Date.now()}`,
      date,
      band_id: bandId,
      band,
      start_time: startTime,
      end_time: endTime,
      organizer_id: user?.id || 'user-1',
      title: `${band.name} Performance`,
      duration_minutes: durationMinutes,
      order_index: 0, // Will be set correctly below
    };

    setWeekSchedule(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        days: prev.days.map(day => {
          if (day.date === date) {
            // Insert the new event in chronological order
            const updatedEvents = [...day.scheduledEvents, newEvent];
            
            // Sort by start time
            updatedEvents.sort((a, b) => a.start_time.localeCompare(b.start_time));
            
            // Update order_index to match the new chronological order
            const reorderedEvents = updatedEvents.map((event, index) => ({
              ...event,
              order_index: index,
            }));
            
            return { ...day, scheduledEvents: reorderedEvents };
          }
          return day;
        }),
      };
    });

    // Mark as unsaved
    markUnsavedChanges();
  }, [weekSchedule, user, markUnsavedChanges]);

  // Move event to different day
  const moveEvent = useCallback((
    eventId: string,
    newDate: string
  ) => {
    if (!weekSchedule) return;

    setWeekSchedule(prev => {
      if (!prev) return prev;

      // Find and remove the event from its current position
      let eventToMove: ScheduleItem | null = null;
      const updatedDays = prev.days.map(day => ({
        ...day,
        scheduledEvents: day.scheduledEvents.filter(event => {
          if (event.id === eventId) {
            eventToMove = { ...event, date: newDate };
            return false;
          }
          return true;
        }),
      }));

      // Add the event to its new position in chronological order
      if (eventToMove) {
        const updatedDaysWithNewEvent = updatedDays.map(day => {
          if (day.date === newDate) {
            // Insert the event in chronological order
            const updatedEvents = [...day.scheduledEvents, eventToMove];
            
            // Sort by start time
            updatedEvents.sort((a, b) => a.start_time.localeCompare(b.start_time));
            
            // Update order_index to match the new chronological order
            const reorderedEvents = updatedEvents.map((event, index) => ({
              ...event,
              order_index: index,
            }));
            
            return { ...day, scheduledEvents: reorderedEvents };
          }
          return day;
        });

        return { ...prev, days: updatedDaysWithNewEvent };
      }

      return { ...prev, days: updatedDays };
    });

    // Mark as unsaved
    markUnsavedChanges();
  }, [weekSchedule, markUnsavedChanges]);

  // Reorder events within a day
  const reorderEvents = useCallback((date: string, eventIds: string[]) => {
    if (!weekSchedule) return;

    setWeekSchedule(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        days: prev.days.map(day => {
          if (day.date === date) {
            // Get the original events sorted by start time
            const originalEvents = [...day.scheduledEvents].sort((a, b) => 
              a.start_time.localeCompare(b.start_time)
            );
            
            // Extract the time slots from the original order
            const timeSlots = originalEvents.map(event => ({
              start_time: event.start_time,
              end_time: event.end_time,
              duration_minutes: event.duration_minutes,
            }));

            // Create reordered events with swapped time slots
            const reorderedEvents = eventIds.map((id, index) => {
              const event = day.scheduledEvents.find(e => e.id === id);
              if (!event) return null;

              // Assign the time slot from the corresponding position
              const timeSlot = timeSlots[index] || timeSlots[0]; // Fallback to first slot if index out of bounds

              return {
                ...event,
                start_time: timeSlot.start_time,
                end_time: timeSlot.end_time,
                duration_minutes: timeSlot.duration_minutes,
                order_index: index,
              };
            }).filter(Boolean) as ScheduleItem[];

            return { ...day, scheduledEvents: reorderedEvents };
          }
          return day;
        }),
      };
    });

    // Mark as unsaved
    markUnsavedChanges();
  }, [weekSchedule, markUnsavedChanges]);

  // Resize event
  const resizeEvent = useCallback((eventId: string, newDurationMinutes: number) => {
    if (!weekSchedule) return;

    setWeekSchedule(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        days: prev.days.map(day => ({
          ...day,
          scheduledEvents: day.scheduledEvents.map(event => {
            if (event.id === eventId) {
              const newEndTime = calculateEndTime(event.start_time, newDurationMinutes);
              return {
                ...event,
                duration_minutes: newDurationMinutes,
                end_time: newEndTime,
              };
            }
            return event;
          }),
        })),
      };
    });

    // Mark as unsaved
    markUnsavedChanges();
  }, [weekSchedule, markUnsavedChanges]);

  // Remove event from schedule
  const removeEvent = useCallback((eventId: string) => {
    if (!weekSchedule) return;

    setWeekSchedule(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        days: prev.days.map(day => {
          const filteredEvents = day.scheduledEvents.filter(event => event.id !== eventId);
          
          // If an event was removed, update order_index values
          if (filteredEvents.length !== day.scheduledEvents.length) {
            // Sort by start time and update order_index
            filteredEvents.sort((a, b) => a.start_time.localeCompare(b.start_time));
            const reorderedEvents = filteredEvents.map((event, index) => ({
              ...event,
              order_index: index,
            }));
            
            return { ...day, scheduledEvents: reorderedEvents };
          }
          
          return day;
        }),
      };
    });

    // Mark as unsaved
    markUnsavedChanges();
  }, [weekSchedule, markUnsavedChanges]);

  // Update event details
  const updateEvent = useCallback((eventId: string, updates: Partial<ScheduleItem>) => {
    if (!weekSchedule) return;

    setWeekSchedule(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        days: prev.days.map(day => ({
          ...day,
          scheduledEvents: day.scheduledEvents.map(event => {
            if (event.id === eventId) {
              return { ...event, ...updates };
            }
            return event;
          }),
        })),
      };
    });

    // Mark as unsaved
    markUnsavedChanges();
  }, [weekSchedule, markUnsavedChanges]);

  // Get available bands for selected day (including custom bands)
  const getAvailableBandsForDay = useCallback((date: string): AvailableBandItem[] => {
    if (!weekSchedule) return [];
    
    const day = weekSchedule.days.find(d => d.date === date);
    return day?.availableBands || [];
  }, [weekSchedule]);

  // Get all available bands (for showing in sidebar)
  const getAllAvailableBands = useCallback((): AvailableBandItem[] => {
    if (!weekSchedule || !selectedDay) return [];
    
    const day = weekSchedule.days.find(d => d.date === selectedDay);
    if (!day) return [];

    // Add custom bands that might not be in the day's availability
    const dayBands = day.availableBands;
    const customBandAvailability: AvailableBandItem[] = customBands
      .filter(band => !dayBands.some(avail => avail.band_id === band.id))
      .map(band => ({
        id: `avail-${band.id}-${selectedDay}`,
        band_id: band.id,
        band,
        available_date: selectedDay,
        start_time: '09:00',
        end_time: '23:00',
        notes: 'Custom band - available all week',
      }));

    return [...dayBands, ...customBandAvailability];
  }, [weekSchedule, selectedDay, customBands]);

  // Save changes to database
  const saveChanges = useCallback(async () => {
    if (!weekSchedule || !user || !hasUnsavedChanges) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Get current schedules from weekSchedule
      const currentSchedules: Schedule[] = [];
      weekSchedule.days.forEach(day => {
        day.scheduledEvents.forEach(event => {
          currentSchedules.push({
            id: event.id,
            date: event.date,
            band_id: event.band_id,
            start_time: event.start_time,
            end_time: event.end_time,
            organizer_id: event.organizer_id || user.id,
            created_at: event.created_at,
            updated_at: event.updated_at,
          });
        });
      });

      // Find schedules to delete (in original but not in current)
      const schedulesToDelete = originalSchedules.filter(
        original => !currentSchedules.find(current => current.id === original.id)
      );

      // Find schedules to insert (new ones with temporary IDs)
      const schedulesToInsert = currentSchedules.filter(
        current => current.id.startsWith('event-') // temporary IDs
      );

      // Find schedules to update (existing ones that changed)
      const schedulesToUpdate = currentSchedules.filter(current => {
        if (current.id.startsWith('event-')) return false; // skip new ones
        const original = originalSchedules.find(orig => orig.id === current.id);
        if (!original) return false;
        
        return (
          original.date !== current.date ||
          original.band_id !== current.band_id ||
          original.start_time !== current.start_time ||
          original.end_time !== current.end_time
        );
      });

      // Perform database operations
      const operations = [];

      // Delete removed schedules
      if (schedulesToDelete.length > 0) {
        const deleteIds = schedulesToDelete.map(s => s.id);
        operations.push(
          supabase.from('schedules').delete().in('id', deleteIds)
        );
      }

      // Insert new schedules
      if (schedulesToInsert.length > 0) {
        const insertData = schedulesToInsert.map(schedule => ({
          date: schedule.date,
          band_id: schedule.band_id,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          organizer_id: user.id,
        }));
        operations.push(
          supabase.from('schedules').insert(insertData)
        );
      }

      // Update existing schedules
      for (const schedule of schedulesToUpdate) {
        operations.push(
          supabase
            .from('schedules')
            .update({
              date: schedule.date,
              band_id: schedule.band_id,
              start_time: schedule.start_time,
              end_time: schedule.end_time,
              updated_at: new Date().toISOString(),
            })
            .eq('id', schedule.id)
        );
      }

      // Execute all operations
      const results = await Promise.all(operations);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`Database errors: ${errors.map(e => e.error?.message).join(', ')}`);
      }

      // Reload the week schedule to get fresh data with proper IDs
      await loadWeekSchedule(currentWeekStart);

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save changes'));
    } finally {
      setIsSaving(false);
    }
  }, [weekSchedule, user, hasUnsavedChanges, originalSchedules, currentWeekStart, loadWeekSchedule]);

  // Load initial data
  useEffect(() => {
    loadWeekSchedule(currentWeekStart);
  }, [currentWeekStart, loadWeekSchedule]);

  return {
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
    getAvailableBandsForDay,
    getAllAvailableBands,
    saveChanges,
    hasUnsavedChanges,
    isSaving,
  };
} 