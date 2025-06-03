# Band Availability Feature

## Overview

The Band Availability feature allows band leaders to set and manage when their band is available for gigs and events. This is separate from individual member availability and represents the band's official availability as a group.

## Features

### For Band Leaders

- **Set Band Availability**: Add specific dates when the band is available for bookings
- **Time Slots**: Optionally specify time ranges (start/end times) for availability
- **Notes**: Add context or special requirements for each availability date
- **Visual Calendar**: Easy-to-use calendar interface with visual indicators
- **Edit/Delete**: Modify or remove existing availability entries

### For Band Members

- **View Only**: Members can view when the band is officially available but cannot edit

## How to Use

### Adding Band Availability

1. Navigate to your band's detail page
2. Click on the "Band Availability" tab (only visible to band leaders)
3. Use one of these methods to add availability:
   - Click "Add Date" button to open the modal
   - Click directly on a calendar date to add availability for that day

### Setting Time Ranges

- **All Day**: Leave both start and end times empty for all-day availability
- **Start Time Only**: Set when availability begins (open-ended)
- **End Time Only**: Set when availability ends (available until that time)
- **Time Range**: Set both start and end times for specific windows

### Adding Notes

Use the notes field to add important context:
- "Available for outdoor venues only"
- "Requires 2-week notice"
- "Prefer evening slots"
- "Available for corporate events"

## Database Schema

The feature uses the `band_availability` table with the following fields:

```sql
CREATE TABLE public.band_availability (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  band_id uuid NOT NULL,
  available_date date NOT NULL,
  start_time time without time zone,
  end_time time without time zone,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
```

## UI Components

### BandAvailabilityCalendar

Main component that handles:
- Displaying the calendar with availability indicators
- Loading and saving band availability data
- Providing edit/delete functionality for leaders
- Read-only view for non-leaders

**Props:**
- `bandId: string` - The ID of the band
- `isLeader: boolean` - Whether the current user is a band leader

### BandAvailabilityModal

Modal component for adding/editing availability:
- Date picker with future dates only
- Time selection dropdowns (30-minute intervals)
- Notes textarea
- Form validation (start time must be before end time)
- Preview of the availability entry

## Permissions

- **Band Leaders**: Full CRUD access to band availability
- **Band Members**: Read-only access to view band availability
- **Non-members**: No access

## Integration with Existing Features

### Member Availability vs Band Availability

- **Member Availability**: Individual band members set their personal availability
- **Band Availability**: Band leaders set official band availability for organizers/venues

### Event Scheduling

The band availability feature complements the existing event scheduling system by providing venues and organizers with clear windows when the band is bookable.

## Future Enhancements

- Bulk import/export of availability dates
- Integration with external calendar systems (.ics export)
- Automatic conflict detection with existing events
- Notification system for availability updates
- Multiple time slots per day
- Recurring availability patterns 