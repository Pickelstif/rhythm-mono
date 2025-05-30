import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay } from "date-fns";
import { cn } from '@/lib/utils';
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AvailabilityTooltip } from "./AvailabilityTooltip";

type AvailabilityCalendarProps = {
  bandId: string;
  onAvailabilityChange?: () => void;
};

// Predefined colors for members
const MEMBER_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-orange-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-emerald-500',
];

const AvailabilityCalendar = ({ bandId, onAvailabilityChange }: AvailabilityCalendarProps) => {
  const { user } = useAuth();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bandAvailability, setBandAvailability] = useState<Record<string, { name: string; dates: Date[]; color: string }>>({});
  const [isLeader, setIsLeader] = useState(false);
  
  // Tooltip state
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipDate, setTooltipDate] = useState<Date | null>(null);
  
  // Double tap state
  const lastTapTimeRef = useRef<number>(0);
  const lastTapDateRef = useRef<Date | null>(null);

  // Fetch existing availability for the band
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!user || !bandId) return;

      try {
        // Check if user is a leader
        const { data: memberData, error: memberError } = await supabase
          .from("band_members")
          .select("role")
          .eq("band_id", bandId)
          .eq("user_id", user.id)
          .single();

        if (memberError) throw memberError;
        setIsLeader(memberData.role === "leader");

        // Get all members of the band
        const { data: members, error: membersError } = await supabase
          .from("band_members")
          .select("user_id")
          .eq("band_id", bandId);

        if (membersError) throw membersError;

        // Get availability for each member
        const availabilityPromises = members.map(async (member, index) => {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("name, email")
            .eq("id", member.user_id)
            .single();

          if (userError) throw userError;

          const { data: availabilityData, error: availabilityError } = await supabase
            .from("availability")
            .select("date")
            .eq("band_id", bandId)
            .eq("user_id", member.user_id);

          if (availabilityError) throw availabilityError;

          return {
            userId: member.user_id,
            name: userData.name || userData.email || "Unknown",
            dates: availabilityData?.map(avail => new Date(avail.date)) || [],
            color: MEMBER_COLORS[index % MEMBER_COLORS.length],
          };
        });

        const memberAvailability = await Promise.all(availabilityPromises);
        
        // Convert to the format expected by the calendar
        const availabilityMap: Record<string, { name: string; dates: Date[]; color: string }> = {};
        memberAvailability.forEach(member => {
          availabilityMap[member.userId] = {
            name: member.name,
            dates: member.dates,
            color: member.color,
          };
        });

        setBandAvailability(availabilityMap);

        // Set the current user's selected dates
        const currentUserAvailability = memberAvailability.find(m => m.userId === user.id);
        if (currentUserAvailability) {
          setSelectedDates(currentUserAvailability.dates);
        }
      } catch (error) {
        console.error("Error fetching availability:", error);
        toast.error("Failed to load availability data");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [bandId, user]);

  const handleDateClick = (date: Date) => {
    const now = Date.now();
    const timeDiff = now - lastTapTimeRef.current;
    const isSameDate = lastTapDateRef.current && isSameDay(lastTapDateRef.current, date);
    
    // Double tap detected if same date is tapped within 200ms
    if (isSameDate && timeDiff < 200) {
      // Double tap - show tooltip
      setTooltipDate(date);
      setTooltipOpen(true);
      
      // Reset tap tracking
      lastTapTimeRef.current = 0;
      lastTapDateRef.current = null;
    } else {
      // First tap or different date - record it and schedule single click action
      lastTapTimeRef.current = now;
      lastTapDateRef.current = date;
      
      // Schedule single click action after double tap window
      setTimeout(() => {
        // Only execute if this is still the latest tap (no double tap occurred)
        if (lastTapTimeRef.current === now) {
          setSelectedDates(prev => {
            const isSelected = prev.some(d => isSameDay(d, date));
            if (isSelected) {
              // Remove the date if it's already selected
              return prev.filter(d => !isSameDay(d, date));
            } else {
              // Add the date if it's not selected
              return [...prev, date];
            }
          });
          
          // Clear tracking
          lastTapTimeRef.current = 0;
          lastTapDateRef.current = null;
        }
      }, 200);
    }
  };

  const getAvailabilityForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const available: Array<{ name: string; color: string }> = [];
    const unavailable: Array<{ name: string; color: string }> = [];

    Object.entries(bandAvailability).forEach(([memberId, memberData]) => {
      const isAvailable = memberData.dates.some(d => format(d, 'yyyy-MM-dd') === dateStr);
      
      if (isAvailable) {
        available.push({ name: memberData.name, color: memberData.color });
      } else {
        unavailable.push({ name: memberData.name, color: memberData.color });
      }
    });

    return { available, unavailable };
  };

  const handleSave = async () => {
    if (!user || !bandId) return;

    try {
      setSaving(true);

      // Delete existing availability for this user and band
      const { error: deleteError } = await supabase
        .from("availability")
        .delete()
        .eq("band_id", bandId)
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;

      // Insert new availability
      const availabilityData = selectedDates.map(date => ({
        band_id: bandId,
        user_id: user.id,
        date: format(date, "yyyy-MM-dd"),
        source: "manual",
      }));

      const { error: insertError } = await supabase
        .from("availability")
        .insert(availabilityData);

      if (insertError) throw insertError;

      // Get the user's name
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("name")
        .eq("id", user.id)
        .single();

      if (userError) throw userError;

      // Update local state while preserving the existing color
      setBandAvailability(prev => ({
        ...prev,
        [user.id]: {
          name: userData.name || user.email || "You",
          dates: selectedDates,
          color: prev[user.id]?.color || MEMBER_COLORS[0], // Use existing color or default to first color
        },
      }));

      // Notify parent component of availability change
      onAvailabilityChange?.();

      toast.success("Availability updated successfully");
    } catch (error) {
      console.error("Error saving availability:", error);
      toast.error("Failed to save availability");
    } finally {
      setSaving(false);
    }
  };

  const renderDay = (day: Date) => {
    const isSelected = selectedDates.some(d => isSameDay(d, day));
    const { available, unavailable } = getAvailabilityForDate(day);
    const totalMembers = available.length + unavailable.length;
    const availableCount = available.length;
    
    // Show count only if at least one member is available
    const showCount = availableCount > 0 && totalMembers > 0;
    
    // All members available styling
    const allMembersAvailable = availableCount === totalMembers && totalMembers > 0;
    
    return (
      <AvailabilityTooltip
        date={day}
        availableMembers={available}
        unavailableMembers={unavailable}
        open={tooltipOpen && tooltipDate && isSameDay(tooltipDate, day)}
        onOpenChange={(open) => {
          if (!open) {
            setTooltipOpen(false);
            setTooltipDate(null);
          }
        }}
      >
        <div 
          className={cn(
            "h-8 w-8 p-0 font-normal cursor-pointer rounded-full transition-colors duration-200 relative",
            "flex flex-col items-center justify-center",
            isSelected 
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm" 
              : "hover:bg-muted/50",
            allMembersAvailable && "ring-2 ring-amber-400"
          )}
          onClick={() => handleDateClick(day)}
        >
          <span className={cn(
            "font-medium leading-none",
            showCount ? "text-xs -mt-0.5" : "text-sm",
            allMembersAvailable && !isSelected && "text-amber-600"
          )}>
            {day.getDate()}
          </span>
          
          {showCount && (
            <span className="text-[10px] leading-none font-medium text-muted-foreground">
              {availableCount}/{totalMembers}
            </span>
          )}
        </div>
      </AvailabilityTooltip>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-card rounded-lg border shadow-sm">
      <div className="flex justify-center">
        <Calendar
          mode="multiple"
          selected={selectedDates}
          onSelect={setSelectedDates}
          className="rounded-lg border-none scale-110"
          components={{
            Day: ({ date, displayMonth, ...props }) => {
              return (
                <div {...props}>
                  {renderDay(date)}
                </div>
              );
            },
          }}
        />
      </div>
      
      <div className="flex flex-col gap-4">
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full"
        >
          {saving ? "Saving..." : "Save Availability"}
        </Button>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
