
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { getMemberAvailabilityForMonth, updateMemberAvailability } from "@/services/mock-data";
import { currentUser } from "@/services/mock-data";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { format, isSameDay, addMonths, subMonths } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AvailabilityCalendarProps {
  bandId: string;
}

const AvailabilityCalendar = ({ bandId }: AvailabilityCalendarProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [availabilityData, setAvailabilityData] = useState<{ [userId: string]: Date[] }>({});
  const [memberNames, setMemberNames] = useState<{ [userId: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  useEffect(() => {
    fetchAvailabilityData(date.getFullYear(), date.getMonth());
  }, [bandId, date]);

  const fetchAvailabilityData = async (year: number, month: number) => {
    setLoading(true);
    try {
      const data = await getMemberAvailabilityForMonth(bandId, year, month);
      setAvailabilityData(data);
      
      // Extract member names from the data
      const names: { [userId: string]: string } = {};
      Object.keys(data).forEach(userId => {
        // This is a mock approach - in a real app, you'd fetch proper names from your backend
        names[userId] = userId === "user1" ? "Jane Smith" : 
                        userId === "user2" ? "Alex Johnson" : 
                        userId === "user3" ? "Olivia Williams" :
                        userId === "user4" ? "Michael Brown" :
                        userId === "user5" ? "Sophie Chen" : userId;
      });
      setMemberNames(names);
      
      // Initialize selectedDates with the current user's availability
      if (data[currentUser.id]) {
        setSelectedDates(data[currentUser.id]);
      }
    } catch (error) {
      console.error("Failed to fetch availability data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (day: Date | undefined) => {
    if (!day) return;
    
    // Create a new date at midnight for comparison
    const selectedDate = new Date(day);
    selectedDate.setHours(0, 0, 0, 0);
    
    setSelectedDates(prev => {
      // Check if the date is already selected
      const isSelected = prev.some(d => isSameDay(d, selectedDate));
      
      if (isSelected) {
        // Remove the date if already selected
        return prev.filter(d => !isSameDay(d, selectedDate));
      } else {
        // Add the date if not already selected
        return [...prev, selectedDate];
      }
    });
  };

  const handleSaveAvailability = async () => {
    setIsUpdating(true);
    try {
      const success = await updateMemberAvailability(bandId, currentUser.id, selectedDates);
      if (success) {
        // Update the local state to reflect the changes
        setAvailabilityData(prev => ({
          ...prev,
          [currentUser.id]: selectedDates
        }));
      }
    } catch (error) {
      console.error("Failed to update availability:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePreviousMonth = () => {
    setDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setDate(prev => addMonths(prev, 1));
  };

  // Calculate how many band members are available on each day
  const getDayAvailability = (day: Date) => {
    let availableCount = 0;
    Object.values(availabilityData).forEach(dates => {
      if (dates.some(d => isSameDay(d, day))) {
        availableCount++;
      }
    });
    return availableCount;
  };

  // Custom day rendering to show availability stats
  const renderDay = (day: Date) => {
    const availableCount = getDayAvailability(day);
    const totalMembers = Object.keys(availabilityData).length;
    
    // Check if current user has marked this day as available
    const isAvailable = selectedDates.some(d => isSameDay(d, day));
    
    return (
      <div className="relative w-full h-full p-1">
        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
          isAvailable ? 'bg-rhythm-500 text-white' : ''
        }`}>
          {format(day, "d")}
        </div>
        {availableCount > 0 && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center">
            <div className="text-[10px] bg-muted rounded-full px-1">
              {availableCount}/{totalMembers}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-medium">{format(date, "MMMM yyyy")}</h3>
        <Button variant="outline" size="sm" onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Calendar
              mode="multiple"
              selected={selectedDates}
              onSelect={(day) => handleDateSelect(day)}
              className="rounded-md border"
              month={date}
              onMonthChange={setDate}
              renderDay={renderDay}
              className="pointer-events-auto"
            />
            <div className="mt-4 flex justify-end">
              <Button onClick={handleSaveAvailability} disabled={isUpdating}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save My Availability
              </Button>
            </div>
          </div>
          
          <div>
            <div className="rounded-md border p-4">
              <h3 className="text-sm font-medium mb-2">Band Member Availability</h3>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {Object.entries(availabilityData).map(([userId, dates]) => (
                    <div key={userId} className="space-y-1">
                      <h4 className="text-sm font-medium">{memberNames[userId] || userId}</h4>
                      <div className="flex flex-wrap gap-1">
                        {dates.length > 0 ? (
                          dates.map((date, i) => (
                            <span 
                              key={i} 
                              className="text-xs bg-secondary py-1 px-2 rounded-full"
                            >
                              {format(date, "MMM d")}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">No availability set</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityCalendar;
