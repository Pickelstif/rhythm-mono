import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";

interface AvailabilityTooltipProps {
  date: Date;
  availableMembers: Array<{ name: string; color: string }>;
  unavailableMembers: Array<{ name: string; color: string }>;
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AvailabilityTooltip({ 
  date, 
  availableMembers, 
  unavailableMembers, 
  children, 
  open, 
  onOpenChange 
}: AvailabilityTooltipProps) {
  const totalMembers = availableMembers.length + unavailableMembers.length;

  if (totalMembers === 0) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={onOpenChange}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-xs p-3 space-y-2"
          sideOffset={8}
        >
          <div className="font-medium text-center border-b pb-2">
            {format(date, "MMM d, yyyy")}
          </div>
          
          {availableMembers.length > 0 && (
            <div>
              <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                Available ({availableMembers.length})
              </div>
              <div className="space-y-1">
                {availableMembers.map((member, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${member.color}`} />
                    <span>{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {unavailableMembers.length > 0 && (
            <div>
              <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">
                Unavailable ({unavailableMembers.length})
              </div>
              <div className="space-y-1">
                {unavailableMembers.map((member, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                    <span>{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 