export interface User {
  id: string; // uuid
  name: string;
  email: string;
  user_type: 'band' | 'organizer';
}

export interface Band {
  id: string; // uuid
  name: string;
  created_by?: string; // uuid, references User
  is_custom?: boolean; // For user-created custom bands
}

export interface BandAvailability {
  id: string; // uuid
  band_id: string; // uuid, references Band
  band?: Band; // Optional: for joined data
  available_date: string; // date
  start_time?: string; // time
  end_time?: string; // time
  notes?: string;
}

export interface Schedule {
  id: string; // uuid
  date: string; // date in YYYY-MM-DD format
  band_id: string; // uuid, references Band
  band?: Band; // Optional: for joined data
  start_time: string; // time in HH:MM format
  end_time: string; // time in HH:MM format
  organizer_id: string; // uuid, references User
  organizer?: User; // Optional: for joined data
  created_at?: string; // timestamp
  updated_at?: string; // timestamp
}

export interface ScheduledEvent {
  id: string; // uuid
  date: string; // date
  band_id: string; // uuid, references Band
  band?: Band; // Optional: for joined data
  start_time: string; // time in HH:MM format
  end_time: string; // time in HH:MM format
  organizer_id: string; // uuid, references User
  organizer?: User; // Optional: for joined data
  title?: string; // For custom events not directly tied to a band name
  duration_minutes: number; // Duration in minutes (default 60, min 30)
  order_index: number; // For ordering within the day
  // Database fields
  created_at?: string; // timestamp
  updated_at?: string; // timestamp
}

// Represents an item in the schedule view
export interface ScheduleItem extends ScheduledEvent {
  // Any additional properties specific to the UI representation
}

// Represents an item in the available bands list
export interface AvailableBandItem extends BandAvailability {
  // Any additional properties specific to the UI representation
}

export interface DaySchedule {
  date: string;
  availableBands: AvailableBandItem[];
  scheduledEvents: ScheduleItem[];
}

// New types for week view
export interface WeekSchedule {
  startDate: string; // Monday of the week (YYYY-MM-DD)
  endDate: string; // Sunday of the week (YYYY-MM-DD)
  days: DaySchedule[];
}

export interface TimeSlot {
  id: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  date: string; // YYYY-MM-DD format
  scheduledEvent?: ScheduleItem;
}

export interface DragItem {
  id: string;
  type: 'band' | 'event';
  data: AvailableBandItem | ScheduleItem;
}

export interface DropResult {
  dayDate: string;
  insertIndex?: number; // Where to insert in the day's schedule
}

// For time selection when dropping bands
export interface TimeSelectionModal {
  isOpen: boolean;
  band?: AvailableBandItem;
  dayDate?: string;
  suggestedStartTime?: string;
}

// For custom band creation
export interface CustomBandForm {
  name: string;
} 