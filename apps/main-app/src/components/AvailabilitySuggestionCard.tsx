import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Plus } from "lucide-react";
import { format } from "date-fns";

interface AvailabilitySuggestionCardProps {
  date: Date;
  onScheduleEvent: (date: Date) => void;
}

export function AvailabilitySuggestionCard({ date, onScheduleEvent }: AvailabilitySuggestionCardProps) {
  return (
    <Card className="border-dashed border-2 border-primary/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-primary/80">All Members Available</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center text-sm">
            <CalendarDays className="mr-2 h-4 w-4 text-primary/80" />
            {format(date, "EEEE, MMMM d, yyyy")}
          </div>
          <Button 
            variant="outline" 
            className="w-full text-primary/80 border-primary/50 hover:bg-primary/10"
            onClick={() => onScheduleEvent(date)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Schedule Event
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 