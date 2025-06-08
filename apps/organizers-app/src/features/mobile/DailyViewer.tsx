import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Info,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  LogOut,
  Settings
} from 'lucide-react';
  import { supabase } from '@rhythm-sync/database';
import Header from '../../components/Header';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface ScheduleEvent {
  id: string;
  date: string;
  band_id: string;
  band_name: string;
  start_time: string;
  end_time: string;
  organizer_id: string;
  title: string;
}

export function DailyViewer() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Format date for display
  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Navigate to previous day
  const goToPreviousDay = () => {
    const currentDate = new Date(selectedDate + 'T00:00:00');
    currentDate.setDate(currentDate.getDate() - 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  // Navigate to next day
  const goToNextDay = () => {
    const currentDate = new Date(selectedDate + 'T00:00:00');
    currentDate.setDate(currentDate.getDate() + 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  // Generate time slots matching desktop version (30-minute increments from 4 PM to 12 AM)
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

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  // Format time for display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Load events for selected date
  const loadEvents = async (date: string) => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select(`
          *,
          band:bands(id, name)
        `)
        .eq('date', date)
        .eq('organizer_id', user.id)
        .order('start_time');

      if (error) {
        console.error('Error loading events:', error);
        return;
      }

      const formattedEvents: ScheduleEvent[] = (data || []).map(schedule => ({
        id: schedule.id,
        date: schedule.date,
        band_id: schedule.band_id,
        band_name: schedule.band?.name || 'Unknown Band',
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        organizer_id: schedule.organizer_id,
        title: schedule.band?.name ? `${schedule.band.name} Performance` : 'Performance',
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load events when date changes
  useEffect(() => {
    loadEvents(selectedDate);
  }, [selectedDate, user?.id]);

  // Handle event edit
  const handleEditEvent = (event: ScheduleEvent) => {
    setEditingEvent({ ...event });
    setIsEditModalOpen(true);
  };

  // Save event changes
  const handleSaveEvent = async () => {
    if (!editingEvent) return;

    try {
      const { error } = await supabase
        .from('schedules')
        .update({
          start_time: editingEvent.start_time,
          end_time: editingEvent.end_time,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingEvent.id)
        .eq('organizer_id', user?.id);

      if (error) {
        console.error('Error updating event:', error);
        return;
      }

      // Reload events
      await loadEvents(selectedDate);
      setIsEditModalOpen(false);
      setEditingEvent(null);
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  // Delete event
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', eventId)
        .eq('organizer_id', user?.id);

      if (error) {
        console.error('Error deleting event:', error);
        return;
      }

      // Reload events
      await loadEvents(selectedDate);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Website Header */}
      <Header 
        rightContent={
          <>
            <Button variant="ghost" size="icon" aria-label="Settings">
              <Settings className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </>
        }
      />

      {/* Page Header */}
      <div className="bg-background border-b border-border p-4">
        <div className="flex items-center justify-between">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold">Daily Schedule</h1>
            <div className="flex items-center justify-center space-x-2 mt-1">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={goToPreviousDay}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <p className="text-sm text-muted-foreground min-w-0 px-2">
                {formatDateDisplay(selectedDate)}
              </p>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={goToNextDay}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="w-10"></div> {/* Spacer for balance */}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Date Picker */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full text-base [color-scheme:light] dark:[color-scheme:dark]"
            />
          </CardContent>
        </Card>

        {/* Events List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Events ({events.length})
            </h2>
          </div>

          {loading ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading events...</p>
              </CardContent>
            </Card>
          ) : events.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No events scheduled for this day</p>
              </CardContent>
            </Card>
          ) : (
            events.map((event) => (
              <Card key={event.id} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-base mb-1">
                        {event.band_name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {formatTime(event.start_time)} - {formatTime(event.end_time)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {event.title}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditEvent(event)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteEvent(event.id)}
                        className="h-8 w-8 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Bottom Spacing */}
        <div className="h-8"></div>
      </div>

      {/* Edit Event Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="mx-4 max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Modify the event details below
            </DialogDescription>
          </DialogHeader>
          
          {editingEvent && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="band-name">Band Name</Label>
                <Input
                  id="band-name"
                  value={editingEvent.band_name}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="start-time" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Start Time
                  </Label>
                  <Select 
                    value={editingEvent.start_time} 
                    onValueChange={(value) => setEditingEvent({
                      ...editingEvent,
                      start_time: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select start time" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateTimeSlots().map((slot) => (
                        <SelectItem key={slot.value} value={slot.value}>
                          {slot.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="end-time" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    End Time
                  </Label>
                  <Select 
                    value={editingEvent.end_time} 
                    onValueChange={(value) => setEditingEvent({
                      ...editingEvent,
                      end_time: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select end time" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateTimeSlots().map((slot) => (
                        <SelectItem key={slot.value} value={slot.value}>
                          {slot.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Time Summary */}
              <div className="bg-muted rounded-lg p-3">
                <div className="text-sm font-medium mb-1">Performance Schedule:</div>
                <div className="text-sm text-muted-foreground">
                  {formatTimeDisplay(editingEvent.start_time)} - {formatTimeDisplay(editingEvent.end_time)}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEvent}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 