import { useState, useEffect, useCallback } from 'react';
import { DaySchedule, AvailableBandItem, ScheduleItem, Band, User } from '../types';

// Mock Data - Replace with actual API calls
const MOCK_BANDS: Band[] = [
  { id: 'band-1', name: 'The Rockers' },
  { id: 'band-2', name: 'Jazz Fusion' },
  { id: 'band-3', name: 'Acoustic Harmony' },
];

const MOCK_ORGANIZER: User = {
  id: 'organizer-1',
  name: 'Main Organizer',
  email: 'organizer@example.com',
  user_type: 'organizer',
};

const getMockBandAvailability = (date: string): AvailableBandItem[] => [
  {
    id: 'avail-1',
    band_id: 'band-1',
    band: MOCK_BANDS[0],
    available_date: date,
    start_time: '10:00',
    end_time: '18:00',
    notes: 'Available all day',
  },
  {
    id: 'avail-2',
    band_id: 'band-2',
    band: MOCK_BANDS[1],
    available_date: date,
    start_time: '12:00',
    end_time: '20:00',
  },
];

const getMockScheduledEvents = (date: string): ScheduleItem[] => [
  {
    id: 'sched-1',
    date: date,
    band_id: 'band-3',
    band: MOCK_BANDS[2],
    start_time: '14:00',
    end_time: '16:00',
    organizer_id: 'organizer-1',
    organizer: MOCK_ORGANIZER,
    title: MOCK_BANDS[2].name,
  },
];

export function useSchedulerData(initialDate: string) {
  const [currentDate, setCurrentDate] = useState<string>(initialDate);
  const [daySchedule, setDaySchedule] = useState<DaySchedule | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchScheduleData = useCallback(async (date: string) => {
    setIsLoading(true);
    setError(null);
    console.log(`Fetching data for date: ${date}`);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      const availableBands = getMockBandAvailability(date);
      const scheduledEvents = getMockScheduledEvents(date);
      setDaySchedule({
        date,
        availableBands,
        scheduledEvents,
      });
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch schedule data'));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchScheduleData(currentDate);
  }, [currentDate, fetchScheduleData]);

  const addBandToSchedule = useCallback(
    async (bandAvailability: AvailableBandItem, startTime: string, endTime: string) => {
      if (!daySchedule) return;
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      try {
        const newScheduledEvent: ScheduleItem = {
          id: `sched-${Date.now()}`,
          date: currentDate,
          band_id: bandAvailability.band_id,
          band: bandAvailability.band,
          start_time: startTime,
          end_time: endTime,
          organizer_id: MOCK_ORGANIZER.id, // Assuming a default organizer for now
          organizer: MOCK_ORGANIZER,
          title: bandAvailability.band?.name || 'Scheduled Event',
        };

        setDaySchedule(prev => {
          if (!prev) return null;
          return {
            ...prev,
            scheduledEvents: [...prev.scheduledEvents, newScheduledEvent].sort(
              (a, b) => a.start_time.localeCompare(b.start_time)
            ),
            // Optionally remove from availableBands or update its status
            availableBands: prev.availableBands.filter(b => b.id !== bandAvailability.id),
          };
        });
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Failed to add band to schedule'));
      }
      setIsLoading(false);
    },
    [daySchedule, currentDate]
  );

  const addCustomEventToSchedule = useCallback(
    async (title: string, startTime: string, endTime: string, bandId?: string) => {
      if (!daySchedule) return;
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      try {
        const band = bandId ? MOCK_BANDS.find(b => b.id === bandId) : undefined;
        const newCustomEvent: ScheduleItem = {
          id: `custom-event-${Date.now()}`,
          date: currentDate,
          band_id: bandId || 'custom',
          band: band,
          start_time: startTime,
          end_time: endTime,
          organizer_id: MOCK_ORGANIZER.id,
          organizer: MOCK_ORGANIZER,
          title: title,
        };

        setDaySchedule(prev => {
          if (!prev) return null;
          return {
            ...prev,
            scheduledEvents: [...prev.scheduledEvents, newCustomEvent].sort(
              (a, b) => a.start_time.localeCompare(b.start_time)
            ),
          };
        });
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Failed to add custom event'));
      }
      setIsLoading(false);
    },
    [daySchedule, currentDate]
  );

  return {
    currentDate,
    setCurrentDate,
    daySchedule,
    isLoading,
    error,
    addBandToSchedule,
    addCustomEventToSchedule,
    fetchScheduleData, // Exposing fetch for manual refresh if needed
  };
} 