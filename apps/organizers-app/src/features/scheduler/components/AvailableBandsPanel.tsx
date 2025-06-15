import React, { useState, useEffect } from 'react';
import { AvailableBandItem, Band } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Music, Plus, Clock, GripVertical } from 'lucide-react';
import { supabase } from '@rhythm-sync/database';
import type { Tables } from '@rhythm-sync/database';
import { useDraggable } from '@dnd-kit/core';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AvailableBandsPanelProps {
  selectedDate: string | null;
  onAddBandToSchedule: (band: AvailableBandItem, startTime: string, endTime: string) => void;
  isLoading: boolean;
  refreshTrigger?: number;
}

type BandRow = Tables<'bands'>;
type BandAvailabilityRow = Tables<'band_availability'>;

// Draggable Available Band Card Component
interface DraggableAvailableBandCardProps {
  bandAvail: AvailableBandItem;
  onAddClick: () => void;
}

function DraggableAvailableBandCard({ bandAvail, onAddClick }: DraggableAvailableBandCardProps) {
  const {
    attributes: dragAttributes,
    listeners: dragListeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `available-band-${bandAvail.id}`,
    data: {
      type: 'band',
      band: bandAvail,
    },
  });

  // Custom drag handling to avoid conflicts with buttons
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start drag if clicking on buttons
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    
    // Apply drag listeners manually
    if (dragListeners && dragListeners.onMouseDown) {
      dragListeners.onMouseDown(e);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Don't start drag if clicking on buttons
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    
    // Apply drag listeners manually
    if (dragListeners && dragListeners.onPointerDown) {
      dragListeners.onPointerDown(e);
    }
  };

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.7 : 1,
  };

  const formatTime = (time: string | undefined | null): string => {
    if (!time) return '--:--';
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`p-2 cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md touch-none select-none ${isDragging ? 'rotate-1 z-50' : ''}`}
      onMouseDown={handleMouseDown}
      onPointerDown={handlePointerDown}
      {...dragAttributes}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <GripVertical className="h-3 w-3 text-muted-foreground opacity-60" />
            <Music className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-xs truncate">{bandAvail.band?.name || 'Unknown Band'}</h4>
            <p className="text-xs text-muted-foreground">
              {formatTime(bandAvail.start_time)} - {formatTime(bandAvail.end_time)}
            </p>
            {bandAvail.notes && (
              <p className="text-xs text-muted-foreground truncate">{bandAvail.notes}</p>
            )}
          </div>
        </div>
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onAddClick();
          }} 
          size="sm" 
          className="flex-shrink-0 h-7 px-2 text-xs z-10"
        >
          Add
        </Button>
      </div>
    </Card>
  );
}

// Draggable All Band Card Component
interface DraggableAllBandCardProps {
  band: Band;
  selectedDate: string | null;
  onAddClick: () => void;
}

function DraggableAllBandCard({ band, selectedDate, onAddClick }: DraggableAllBandCardProps) {
  // Create a temporary AvailableBandItem for dragging
  const availableBandItem: AvailableBandItem = {
    id: `search-${band.id}-${Date.now()}`,
    band_id: band.id,
    band: band,
    available_date: selectedDate || '',
    start_time: null,
    end_time: null,
    notes: 'Added from search',
  };

  const {
    attributes: dragAttributes,
    listeners: dragListeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `all-band-${band.id}`,
    data: {
      type: 'band',
      band: availableBandItem,
    },
  });

  // Custom drag handling to avoid conflicts with buttons
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start drag if clicking on buttons
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    
    // Apply drag listeners manually
    if (dragListeners && dragListeners.onMouseDown) {
      dragListeners.onMouseDown(e);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Don't start drag if clicking on buttons
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    
    // Apply drag listeners manually
    if (dragListeners && dragListeners.onPointerDown) {
      dragListeners.onPointerDown(e);
    }
  };

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 transition-all duration-200 cursor-grab active:cursor-grabbing hover:shadow-md touch-none select-none ${isDragging ? 'rotate-1 z-50' : ''}`}
      onMouseDown={handleMouseDown}
      onPointerDown={handlePointerDown}
      {...dragAttributes}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <GripVertical className="h-3 w-3 text-muted-foreground opacity-60" />
        <Music className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs font-medium truncate">{band.name}</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onAddClick();
        }}
        disabled={!selectedDate}
        className="h-7 px-2 text-xs flex-shrink-0 z-10"
      >
        <Plus className="h-3 w-3 mr-1" />
        Add
      </Button>
    </div>
  );
}

const formatTime = (time: string | undefined | null): string => {
  if (!time) return '--:--';
  try {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch {
    return time;
  }
};

// Find the next available start time for a day based on existing events
const findNextAvailableTime = (events: AvailableBandItem[]): string => {
  if (events.length === 0) return '19:00';
  
  // Sort events by start time
  const sortedEvents = [...events].sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
  
  // Find the latest end time
  let latestEndTime = '19:00';
  sortedEvents.forEach(event => {
    if (event.end_time && event.end_time > latestEndTime) {
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
};

export function AvailableBandsPanel({
  selectedDate,
  onAddBandToSchedule,
  isLoading,
  refreshTrigger,
}: AvailableBandsPanelProps) {
  const [selectedBand, setSelectedBand] = useState<AvailableBandItem | null>(null);
  const [selectedStartTime, setSelectedStartTime] = useState<string>('19:00');
  const [selectedDuration, setSelectedDuration] = useState<number>(60); // Duration in minutes
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  // Available bands state
  const [availableBands, setAvailableBands] = useState<AvailableBandItem[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState<boolean>(false);
  
  // All bands state for search
  const [allBands, setAllBands] = useState<Band[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loadingAllBands, setLoadingAllBands] = useState<boolean>(false);
  const [filteredBands, setFilteredBands] = useState<Band[]>([]);
  
  // Scheduled events for the selected day (to calculate suggested start time)
  const [scheduledEvents, setScheduledEvents] = useState<AvailableBandItem[]>([]);

  // Generate time slots in 30-minute increments from 4 PM to 12 AM
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 16; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = formatTimeDisplay(timeString);
        slots.push({ value: timeString, label: displayTime });
      }
    }
    // Add 12:00 AM (midnight)
    slots.push({ value: '00:00', label: '12:00 AM' });
    return slots;
  };

  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + durationMinutes;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  // Load available bands for selected date
  useEffect(() => {
    if (!selectedDate) {
      setAvailableBands([]);
      return;
    }

    const loadAvailableBands = async () => {
      setLoadingAvailable(true);
      try {
        const { data, error } = await supabase
          .from('band_availability')
          .select(`
            *,
            bands (
              id,
              name,
              created_at,
              created_by
            )
          `)
          .eq('available_date', selectedDate);

        if (error) {
          console.error('Error loading available bands:', error);
          return;
        }

        const availableBandItems: AvailableBandItem[] = data?.map((availability: any) => ({
          id: availability.id,
          band_id: availability.band_id,
          band: availability.bands ? {
            id: availability.bands.id,
            name: availability.bands.name,
          } : undefined,
          available_date: availability.available_date,
          start_time: availability.start_time,
          end_time: availability.end_time,
          notes: availability.notes,
        })) || [];

        setAvailableBands(availableBandItems);
      } catch (error) {
        console.error('Error loading available bands:', error);
      } finally {
        setLoadingAvailable(false);
      }
    };

    loadAvailableBands();
  }, [selectedDate]);

  // Load all bands for search
  useEffect(() => {
    const loadAllBands = async () => {
      setLoadingAllBands(true);
      try {
        const { data, error } = await supabase
          .from('bands')
          .select('*')
          .order('name');

        if (error) {
          console.error('Error loading all bands:', error);
          return;
        }

        const bands: Band[] = data?.map((band: BandRow) => ({
          id: band.id,
          name: band.name,
        })) || [];

        setAllBands(bands);
        setFilteredBands(bands);
      } catch (error) {
        console.error('Error loading all bands:', error);
      } finally {
        setLoadingAllBands(false);
      }
    };

    loadAllBands();
  }, [refreshTrigger]);

  // Filter bands based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBands(allBands);
    } else {
      const filtered = allBands.filter(band =>
        band.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBands(filtered);
    }
  }, [searchQuery, allBands]);

  // Load scheduled events for selected date to calculate suggested start time
  useEffect(() => {
    if (!selectedDate) {
      setScheduledEvents([]);
      return;
    }

    const loadScheduledEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('schedules')
          .select(`
            *,
            bands (
              id,
              name
            )
          `)
          .eq('date', selectedDate)
          .order('start_time');

        if (error) {
          console.error('Error loading scheduled events:', error);
          return;
        }

        // Convert to AvailableBandItem format for consistency with findNextAvailableTime function
        const events: AvailableBandItem[] = data?.map((schedule: any) => ({
          id: schedule.id,
          band_id: schedule.band_id,
          band: schedule.bands ? {
            id: schedule.bands.id,
            name: schedule.bands.name,
          } : undefined,
          available_date: schedule.date,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          notes: '',
        })) || [];

        setScheduledEvents(events);
      } catch (error) {
        console.error('Error loading scheduled events:', error);
      }
    };

    loadScheduledEvents();
  }, [selectedDate]);

  const handleAddToScheduleClick = (band: AvailableBandItem) => {
    if (!selectedDate) return;
    
    // Calculate suggested start time based on existing scheduled events
    const suggestedTime = findNextAvailableTime(scheduledEvents);
    const suggestedEndTime = calculateEndTime(suggestedTime, 60);
    
    // Create an AvailableBandItem with explicit properties (same pattern as handleAddBandFromSearch)
    const availableBandItem: AvailableBandItem = {
      id: `available-${band.id}-${Date.now()}`, // Temporary ID
      band_id: band.band_id,
      band: band.band,
      available_date: selectedDate, // Use the selectedDate from the week view, not database date
      start_time: suggestedTime,
      end_time: suggestedEndTime,
      notes: band.notes || 'Added from available bands',
    };

    setSelectedBand(availableBandItem);
    setSelectedStartTime(suggestedTime);
    setSelectedDuration(60);
    setIsModalOpen(true);
  };

  const handleAddBandFromSearch = (band: Band) => {
    if (!selectedDate) return;
    
    // Calculate suggested start time based on existing scheduled events
    const suggestedTime = findNextAvailableTime(scheduledEvents);
    const suggestedEndTime = calculateEndTime(suggestedTime, 60);
    
    // Create an AvailableBandItem from the searched band
    const availableBandItem: AvailableBandItem = {
      id: `search-${band.id}-${Date.now()}`, // Temporary ID
      band_id: band.id,
      band: band,
      available_date: selectedDate, // Use the selectedDate from the week view, not database date
      start_time: suggestedTime,
      end_time: suggestedEndTime,
      notes: 'Added from search',
    };

    setSelectedBand(availableBandItem);
    setSelectedStartTime(suggestedTime);
    setSelectedDuration(60);
    setIsModalOpen(true);
  };

  const handleConfirmAdd = () => {
    if (selectedBand) {
      const endTime = calculateEndTime(selectedStartTime, selectedDuration);
      onAddBandToSchedule(selectedBand, selectedStartTime, endTime);
      setIsModalOpen(false);
      setSelectedBand(null);
    }
  };

  const formatSelectedDay = () => {
    if (!selectedDate) return 'Select a day';
    // Parse date string components to avoid timezone interpretation
    const [year, month, day] = selectedDate.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    return `${weekdays[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };

  const timeSlots = generateTimeSlots();
  const durationOptions = [
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
    { value: 150, label: '2.5 hours' },
    { value: 180, label: '3 hours' },
  ];

  if (isLoading) {
    return (
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Available Bands</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Available Bands Section */}
        <div className="flex-shrink-0">
          <div className="p-4 pb-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Available Bands</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedDate ? (
                <>Bands available for {formatSelectedDay()}</>
              ) : (
                'Select a day to view available bands'
              )}
            </p>
          </div>
          <div className="p-4 pt-3">
            {!selectedDate ? (
              <div className="flex flex-col items-center justify-center h-24 text-center">
                <div className="text-muted-foreground">
                  <div className="mb-2">Select a day</div>
                  <div className="text-sm">to view available bands</div>
                </div>
              </div>
            ) : loadingAvailable ? (
              <div className="flex items-center justify-center h-24">
                <div className="text-muted-foreground">Loading available bands...</div>
              </div>
            ) : availableBands.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-24 text-center">
                <div className="text-muted-foreground">
                  <div className="mb-2">No bands available</div>
                  <div className="text-sm">for this day</div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {availableBands.map((bandAvail) => (
                  <DraggableAvailableBandCard key={bandAvail.id} bandAvail={bandAvail} onAddClick={() => handleAddToScheduleClick(bandAvail)} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Separator */}
        {selectedDate && (
          <div className="px-4 flex-shrink-0">
            <div className="border-t border-border my-4" />
          </div>
        )}

        {/* All Bands Search Section */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="p-4 pb-2 flex-shrink-0">
            <h3 className="text-sm font-semibold mb-2">All Bands</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="Search bands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>
          <div className="flex-1 min-h-0 px-4 pb-4">
            {loadingAllBands ? (
              <div className="flex items-center justify-center h-20">
                <div className="text-muted-foreground text-xs">Loading bands...</div>
              </div>
            ) : filteredBands.length === 0 ? (
              <div className="flex items-center justify-center h-20">
                <div className="text-muted-foreground text-xs">
                  {searchQuery ? 'No bands found matching your search' : 'No bands available'}
                </div>
              </div>
            ) : (
              <div className="h-full overflow-y-auto">
                <div className="space-y-2">
                  {filteredBands.map((band) => (
                    <DraggableAllBandCard key={band.id} band={band} selectedDate={selectedDate} onAddClick={() => handleAddBandFromSearch(band)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Time Selection Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Music className="h-5 w-5 text-rhythm-600" />
              Schedule Performance
            </DialogTitle>
            <DialogDescription>
              Set the time and duration for{' '}
              <span className="font-medium">{selectedBand?.band?.name}</span>
              {selectedDate && (
                <>
                  {' '}on <span className="font-medium">{formatSelectedDay()}</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Start Time Selection */}
            <div className="space-y-2">
              <Label htmlFor="start-time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Start Time
              </Label>
              <Select 
                key={`start-time-${selectedBand?.id}-${isModalOpen}`}
                value={selectedStartTime} 
                onValueChange={setSelectedStartTime}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select start time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot.value} value={slot.value}>
                      {slot.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration Selection */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select 
                value={selectedDuration.toString()} 
                onValueChange={(value) => setSelectedDuration(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Summary */}
            <div className="bg-muted rounded-lg p-3">
              <div className="text-sm font-medium mb-1">Performance Schedule:</div>
              <div className="text-sm text-muted-foreground">
                {formatTimeDisplay(selectedStartTime)} - {formatTimeDisplay(calculateEndTime(selectedStartTime, selectedDuration))}
                <span className="ml-2">({selectedDuration} min)</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmAdd} className="bg-rhythm-600 hover:bg-rhythm-700">
              Schedule Performance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 