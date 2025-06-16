import React, { useState, useEffect, useCallback } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Clock, Plus, Trash2, Edit } from "lucide-react";
import { cn } from '@/lib/utils';
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BandAvailabilityModal } from "./BandAvailabilityModal";
import { 
  parseDateString, 
  formatDateToString, 
  getTodayString, 
  isSameDate, 
  isDateInPast,
  getTodayAtStartOfDay,
  getCurrentMonthStart,
  getCurrentMonthEnd
} from "@/utils/dateUtils";
interface BandAvailability {
  id: string;
  available_date: string;
  start_time?: string;
  end_time?: string;
  notes?: string;
}

interface BandAvailabilityCalendarProps {
  bandId: string;
  isLeader: boolean;
}

export const BandAvailabilityCalendar = ({ bandId, isLeader }: BandAvailabilityCalendarProps) => {
  const { user } = useAuth();
  const [availability, setAvailability] = useState<BandAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState<BandAvailability | null>(null);
  // New state for member availability
  const [memberAvailability, setMemberAvailability] = useState<Map<string, Date[]>>(new Map());

  // Fetch band availability
  const fetchBandAvailability = useCallback(async () => {
    if (!bandId) return;

    try {
      // Using type assertion for the band_availability table that doesn't exist in types yet
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("band_availability")
        .select("*")
        .eq("band_id", bandId)
        .gte("available_date", getTodayString())
        .order("available_date", { ascending: true });

      if (error) throw error;
      setAvailability((data || []) as BandAvailability[]);
    } catch (error) {
      console.error("Error fetching band availability:", error);
      toast.error("Failed to load band availability");
    } finally {
      setLoading(false);
    }
  }, [bandId]);

  // Fetch member availability to show when all members are available
  const fetchMemberAvailability = useCallback(async () => {
    if (!bandId) return;

    try {
      // Get all band members
      const { data: members, error: membersError } = await supabase
        .from("band_members")
        .select("user_id")
        .eq("band_id", bandId);

      if (membersError) throw membersError;
      if (!members || members.length === 0) return;

      // Get availability for each member (current month)
      const memberAvailabilityPromises = members.map(async (member) => {
        const { data: availability, error: availabilityError } = await supabase
          .from("availability")
          .select("date")
          .eq("user_id", member.user_id)
          .eq("band_id", bandId)
          .gte("date", getCurrentMonthStart())
          .lte("date", getCurrentMonthEnd());

        if (availabilityError) throw availabilityError;
        
        return {
          userId: member.user_id,
          dates: availability?.map(a => parseDateString(a.date)) || []
        };
      });

      const memberAvailabilityData = await Promise.all(memberAvailabilityPromises);
      
      // Create a map of member availability
      const availabilityMap = new Map<string, Date[]>();
      memberAvailabilityData.forEach(member => {
        availabilityMap.set(member.userId, member.dates);
      });
      
      setMemberAvailability(availabilityMap);
    } catch (error) {
      console.error("Error fetching member availability:", error);
    }
  }, [bandId]);

  useEffect(() => {
    fetchBandAvailability();
    fetchMemberAvailability();
  }, [bandId, fetchBandAvailability, fetchMemberAvailability]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date || !isLeader) return;
    
    setSelectedDate(date);
    const existingAvailability = availability.find(av => 
      isSameDate(parseDateString(av.available_date), date)
    );
    
    if (existingAvailability) {
      setEditingAvailability(existingAvailability);
    } else {
      setEditingAvailability(null);
    }
    
    setIsModalOpen(true);
  };

  const handleSaveAvailability = async (availabilityData: {
    date: Date;
    startTime?: string;
    endTime?: string;
    notes?: string;
  }) => {
    if (!isLeader || !user) return;

    try {
      const dateStr = formatDateToString(availabilityData.date);
      
      if (editingAvailability) {
        // Update existing availability
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from("band_availability")
          .update({
            start_time: availabilityData.startTime || null,
            end_time: availabilityData.endTime || null,
            notes: availabilityData.notes || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingAvailability.id);

        if (error) throw error;
        toast.success("Band availability updated successfully");
      } else {
        // Create new availability
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from("band_availability")
          .insert({
            band_id: bandId,
            available_date: dateStr,
            start_time: availabilityData.startTime || null,
            end_time: availabilityData.endTime || null,
            notes: availabilityData.notes || null,
          });

        if (error) throw error;
        toast.success("Band availability added successfully");
      }

      await fetchBandAvailability();
      setIsModalOpen(false);
      setEditingAvailability(null);
      setSelectedDate(null);
    } catch (error) {
      console.error("Error saving band availability:", error);
      toast.error("Failed to save band availability");
    }
  };

  const handleDeleteAvailability = async (availabilityId: string) => {
    if (!isLeader) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("band_availability")
        .delete()
        .eq("id", availabilityId);

      if (error) throw error;
      
      toast.success("Band availability removed successfully");
      await fetchBandAvailability();
    } catch (error) {
      console.error("Error deleting band availability:", error);
      toast.error("Failed to remove band availability");
    }
  };

  const getAvailabilityForDate = (date: Date) => {
    return availability.find(av => 
      isSameDate(parseDateString(av.available_date), date)
    );
  };

  const isAllMembersAvailable = (date: Date) => {
    if (memberAvailability.size === 0) return false;
    
    const dateStr = formatDateToString(date);
    let availableCount = 0;
    
    memberAvailability.forEach((dates, userId) => {
      const isAvailable = dates.some(d => formatDateToString(d) === dateStr);
      if (isAvailable) {
        availableCount++;
      }
    });
    
    return availableCount === memberAvailability.size && memberAvailability.size > 0;
  };

  const renderDay = (day: Date) => {
    const dayAvailability = getAvailabilityForDate(day);
    const isPast = isDateInPast(day);
    const allMembersAvailable = isAllMembersAvailable(day);
    
    return (
      <div 
        className={cn(
          "h-8 w-8 p-0 font-normal rounded-full transition-colors duration-200 relative",
          "flex items-center justify-center",
          isLeader && !isPast ? "cursor-pointer hover:bg-muted/50" : "",
          allMembersAvailable && "ring-2 ring-amber-400"
        )}
        onClick={() => isLeader && !isPast && handleDateSelect(day)}
      >
        <span className={cn(
          "text-sm font-medium leading-none",
          isPast ? "text-muted-foreground" : "text-foreground",
          allMembersAvailable && "text-amber-600"
        )}>
          {day.getDate()}
        </span>
        
        {/* Green dot for band availability */}
        {dayAvailability && (
          <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2">
            <div className="w-1 h-1 bg-green-500 rounded-full" />
          </div>
        )}
      </div>
    );
  };

  const formatTimeRange = (startTime?: string, endTime?: string) => {
    if (!startTime && !endTime) return "All day";
    
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    };

    if (startTime && endTime) {
      return `${formatTime(startTime)} - ${formatTime(endTime)}`;
    } else if (startTime) {
      return `From ${formatTime(startTime)}`;
    } else if (endTime) {
      return `Until ${formatTime(endTime)}`;
    }
    
    return "All day";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Band Availability</CardTitle>
              <CardDescription>
                {isLeader 
                  ? "Set when your band is available for gigs and events. Click dates to add or edit availability."
                  : "View when your band is available for gigs and events."
                }
              </CardDescription>
            </div>
            {isLeader && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedDate(new Date());
                  setEditingAvailability(null);
                  setIsModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Date
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* How to use */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-medium">How to use:</h4>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Use this calendar to mark when your band is available for gigs and events. When you set your band as available, event organizers using our companion app will be able to see these dates and reach out to book your band.
              </p>
              <div className="flex items-center gap-6 text-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 border border-border rounded-full flex items-center justify-center text-xs relative ring-2 ring-amber-400">
                    15
                  </div>
                  <span className="text-muted-foreground">All members available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 border border-border rounded-full flex items-center justify-center text-xs relative">
                    20
                    <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2">
                      <div className="w-1 h-1 bg-green-500 rounded-full" />
                    </div>
                  </div>
                  <span className="text-muted-foreground">Band available for gigs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 border border-border rounded-full flex items-center justify-center text-xs">
                    25
                  </div>
                  <span className="text-muted-foreground">Not available</span>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={undefined}
              onSelect={undefined}
              disabled={(date) => isDateInPast(date)}
              components={{
                Day: ({ date, displayMonth, ...props }) => {
                  return (
                    <div {...props}>
                      {renderDay(date)}
                    </div>
                  );
                },
              }}
              className="rounded-lg border-none scale-110"
            />
          </div>

          {/* Availability List */}
          {availability.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Upcoming Availability</h4>
              <div className="grid gap-3">
                {availability.map((av) => (
                  <Card key={av.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {format(parseDateString(av.available_date), "MMMM d, yyyy")}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTimeRange(av.start_time, av.end_time)}
                          </Badge>
                          {isAllMembersAvailable(parseDateString(av.available_date)) && (
                            <Badge variant="outline" className="text-xs border-amber-400 text-amber-600">
                              All members available
                            </Badge>
                          )}
                        </div>
                        {av.notes && (
                          <p className="text-sm text-muted-foreground">
                            {av.notes}
                          </p>
                        )}
                      </div>
                      {isLeader && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingAvailability(av);
                              setSelectedDate(parseDateString(av.available_date));
                              setIsModalOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAvailability(av.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <BandAvailabilityModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAvailability(null);
          setSelectedDate(null);
        }}
        onSave={handleSaveAvailability}
        selectedDate={selectedDate}
        existingAvailability={editingAvailability}
      />
    </>
  );
}; 