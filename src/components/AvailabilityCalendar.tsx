
import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from '@/lib/utils';

type AvailabilityCalendarProps = {
  selectedDates?: Date[];
  setSelectedDates?: Dispatch<SetStateAction<Date[]>>;
  bandAvailability?: Record<string, { name: string; dates: Date[] }>;
  onlyView?: boolean;
  bandId?: string;
};

const AvailabilityCalendar = ({
  selectedDates = [],
  setSelectedDates = () => {},
  bandAvailability,
  onlyView = false,
  bandId,
}: AvailabilityCalendarProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [memberColors, setMemberColors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Assign colors to each band member for the availability visualization
    if (bandAvailability) {
      const colors = [
        'bg-red-200',
        'bg-blue-200',
        'bg-green-200',
        'bg-yellow-200',
        'bg-purple-200',
        'bg-pink-200',
        'bg-indigo-200',
        'bg-orange-200',
      ];
      
      const members = Object.keys(bandAvailability);
      const memberColorMap: Record<string, string> = {};
      
      members.forEach((member, index) => {
        memberColorMap[member] = colors[index % colors.length];
      });
      
      setMemberColors(memberColorMap);
    }
  }, [bandAvailability]);

  const handleSelect = (days: Date[] | undefined) => {
    if (days && !onlyView) {
      setSelectedDates(days);
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
      return 'bg-green-500 text-white hover:bg-green-600'; // All members available
    }
    
    return 'bg-yellow-200 hover:bg-yellow-300'; // Some members available
  };
  
  const renderDay = (day: Date) => {
    const dayClass = getDayClass(day);
    const isSelected = selectedDates.some(d => 
      format(d, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    );
    
    return (
      <div 
        className={cn(
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
          dayClass,
          isSelected && !onlyView ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""
        )}
      >
        {day.getDate()}
        {bandAvailability && (
          <div className="flex flex-wrap mt-1 justify-center">
            {Object.entries(bandAvailability)
              .filter(([_, memberData]) => 
                memberData.dates.some(d => format(d, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
              )
              .map(([memberId, memberData], index) => (
                <div 
                  key={index}
                  className={cn("h-1 w-1 rounded-full mx-0.5", memberColors[memberId])}
                  title={memberData.name}
                />
              ))
            }
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative p-4 bg-white rounded-lg shadow-md">
      <Calendar
        mode="multiple"
        selected={selectedDates}
        onSelect={handleSelect}
        className="rounded-md border"
        month={date}
        onMonthChange={setDate}
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
      
      {bandAvailability && (
        <div className="mt-4 space-y-2">
          <h3 className="font-medium text-sm">Member Availability</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(bandAvailability).map(([memberId, memberData]) => (
              <div 
                key={memberId}
                className="flex items-center space-x-1"
              >
                <div className={cn("h-3 w-3 rounded-full", memberColors[memberId])} />
                <span className="text-sm">{memberData.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityCalendar;
