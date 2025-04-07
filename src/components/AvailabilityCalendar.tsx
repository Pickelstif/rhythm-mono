import React, { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay } from "date-fns";
import { cn } from '@/lib/utils';
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type AvailabilityCalendarProps = {
  bandId: string;
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

const AvailabilityCalendar = ({ bandId }: AvailabilityCalendarProps) => {
  const { user } = useAuth();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bandAvailability, setBandAvailability] = useState<Record<string, { name: string; dates: Date[]; color: string }>>({});
  const [isLeader, setIsLeader] = useState(false);

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

      toast.success("Availability updated successfully");
    } catch (error) {
      console.error("Error saving availability:", error);
      toast.error("Failed to save availability");
    } finally {
      setSaving(false);
    }
  };

  const getDayClass = (day: Date) => {
    if (!bandAvailability) return '';
    
    const dateStr = format(day, 'yyyy-MM-dd');
    const availableMembers = Object.entries(bandAvailability)
      .filter(([_, memberData]) => 
        memberData.dates.some(d => format(d, 'yyyy-MM-dd') === dateStr)
      );
    
    if (availableMembers.length === 0) return '';
    
    if (availableMembers.length === Object.keys(bandAvailability).length) {
      return 'ring-2 ring-amber-400 text-amber-400 hover:ring-amber-500 hover:text-amber-500'; // All members available
    }
    
    return ''; // Some members available - no background color
  };
  
  const renderDay = (day: Date) => {
    const dayClass = getDayClass(day);
    const isSelected = selectedDates.some(d => isSameDay(d, day));
    
    const dateStr = format(day, 'yyyy-MM-dd');
    const availableMembers = Object.entries(bandAvailability)
      .filter(([_, memberData]) => 
        memberData.dates.some(d => format(d, 'yyyy-MM-dd') === dateStr)
      );
    
    const allMembersAvailable = availableMembers.length === Object.keys(bandAvailability).length;
    
    return (
      <div 
        className={cn(
          "h-8 w-8 p-0 font-normal aria-selected:opacity-100 cursor-pointer rounded-full transition-colors duration-200",
          dayClass,
          isSelected ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm" : "hover:bg-muted/50",
          "flex flex-col items-center justify-center relative"
        )}
        onClick={() => handleDateClick(day)}
      >
        <span className={cn(
          "text-sm font-medium",
          allMembersAvailable && !isSelected && "text-amber-400"
        )}>{day.getDate()}</span>
        {bandAvailability && !allMembersAvailable && availableMembers.length > 0 && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-0.5 translate-y-1">
            {Object.entries(bandAvailability)
              .filter(([_, memberData]) => 
                memberData.dates.some(d => format(d, 'yyyy-MM-dd') === dateStr)
              )
              .map(([memberId, memberData], index) => (
                <div 
                  key={index}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    memberData.color
                  )}
                  title={memberData.name}
                />
              ))
            }
          </div>
        )}
      </div>
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
      <div className="text-sm text-muted-foreground text-center">
        Click on dates to select/deselect your availability
      </div>
      <div className="flex justify-center">
        <Calendar
          mode="multiple"
          selected={selectedDates}
          onSelect={setSelectedDates}
          className="rounded-lg border-none scale-110"
          components={{
            Day: ({ date, ...props }) => {
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
        <div className="space-y-3">
          <h3 className="font-medium text-sm text-muted-foreground">Member Availability</h3>
          <div className="flex flex-wrap gap-4">
            {Object.entries(bandAvailability).map(([memberId, memberData]) => (
              <div 
                key={memberId}
                className="flex items-center space-x-2"
              >
                <div className={cn(
                  "h-4 w-4 rounded-full",
                  memberData.color
                )} />
                <span className="text-sm font-medium">{memberData.name}</span>
              </div>
            ))}
          </div>
        </div>
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
