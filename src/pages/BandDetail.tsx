import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Band, Event, BandMember } from "@/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, MapPin, Plus, Clock, Users, Copy, Trash2 } from "lucide-react";
import { format } from "date-fns";
import Header from "@/components/Header";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Footer from '@/components/Footer';
import { toast } from "sonner";
import { CreateEventModal } from "@/components/CreateEventModal";
import { AvailabilitySuggestionCard } from "@/components/AvailabilitySuggestionCard";

const BandDetail = () => {
  const { bandId } = useParams<{ bandId: string }>();
  const { user } = useAuth();
  const [band, setBand] = useState<Band | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const fetchBand = async () => {
    if (!bandId || !user) return;
    
    try {
      const { data: bandData, error: bandError } = await supabase
        .from("bands")
        .select("*")
        .eq("id", bandId)
        .single();

      if (bandError) throw bandError;
      if (!bandData) return;

      const { data: members, error: membersError } = await supabase
        .from("band_members")
        .select("user_id, role")
        .eq("band_id", bandId);

      if (membersError) throw membersError;

      const memberDetails = await Promise.all(
        members.map(async (member) => {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("name, instruments")
            .eq("id", member.user_id)
            .single();

          if (userError) throw userError;

          return {
            userId: member.user_id,
            name: userData.name,
            role: member.role as "leader" | "member",
            instruments: userData.instruments || [],
          };
        })
      );

      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .eq("band_id", bandId);

      if (eventsError) throw eventsError;

      const formattedEvents = events?.map(event => ({
        id: event.id,
        bandId: event.band_id,
        title: event.title,
        location: event.location,
        startTime: new Date(event.start_time),
        eventType: event.event_type as "rehearsal" | "gig",
        attendees: [],
        createdBy: event.created_by,
        createdAt: new Date(event.created_at),
      })) || [];

      setBand({
        id: bandData.id,
        name: bandData.name,
        members: memberDetails,
        events: formattedEvents,
        createdAt: new Date(bandData.created_at),
      });
    } catch (error) {
      console.error("Error fetching band:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberAvailability = async () => {
    if (!bandId) return;

    try {
      // Get all band members
      const { data: members, error: membersError } = await supabase
        .from("band_members")
        .select("user_id")
        .eq("band_id", bandId);

      if (membersError) throw membersError;
      if (!members || members.length === 0) return;

      // Get availability for each member
      const memberAvailability = await Promise.all(
        members.map(async (member) => {
          const { data: availability, error: availabilityError } = await supabase
            .from("availability")
            .select("date")
            .eq("user_id", member.user_id)
            .eq("band_id", bandId)
            .gte("date", new Date().toISOString().split("T")[0]);

          if (availabilityError) throw availabilityError;
          return availability?.map(a => new Date(a.date)) || [];
        })
      );

      // Find dates where all members are available
      const allMemberDates = memberAvailability.flat();
      const dateCounts = new Map<string, number>();

      allMemberDates.forEach(date => {
        const dateStr = date.toISOString().split("T")[0];
        dateCounts.set(dateStr, (dateCounts.get(dateStr) || 0) + 1);
      });

      const commonDates = Array.from(dateCounts.entries())
        .filter(([_, count]) => count === members.length)
        .map(([dateStr]) => new Date(dateStr));

      setAvailableDates(commonDates);
    } catch (error) {
      console.error("Error fetching availability:", error);
    }
  };

  useEffect(() => {
    fetchBand();
  }, [bandId, user]);

  useEffect(() => {
    if (band) {
      fetchMemberAvailability();
    }
  }, [band]);

  const isLeader = band?.members.some(
    member => member.userId === user?.id && member.role === "leader"
  );

  const sortEventsByDate = (events: Event[]) => {
    return [...events].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;

      toast.success("Event deleted successfully");
      fetchBand(); // Refresh the events list
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  const handleScheduleFromSuggestion = (date: Date) => {
    setSelectedDate(date);
    setIsCreateEventModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8 animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="grid gap-6">
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!band) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Band not found</h1>
          <p className="mb-6">The band you are looking for does not exist or you don't have access to it.</p>
          <Button asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        {band && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-bold">{band.name}</h1>
              {isLeader && (
                <Button onClick={() => setIsCreateEventModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              )}
            </div>

            <Tabs defaultValue="events" className="space-y-6">
              <TabsList>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
              </TabsList>

              <TabsContent value="events" className="space-y-6">
                {band.events.length === 0 ? (
                  <div className="space-y-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                          <p className="text-lg text-muted-foreground">
                            No events scheduled yet.
                          </p>
                          {isLeader && availableDates.length > 0 && (
                            <div className="space-y-4">
                              <p className="text-muted-foreground">
                                The following dates would be great for scheduling rehearsals or gigs, as all band members are available:
                              </p>
                              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {availableDates.map((date) => (
                                  <AvailabilitySuggestionCard
                                    key={date.toISOString()}
                                    date={date}
                                    onScheduleEvent={handleScheduleFromSuggestion}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                          {!isLeader && availableDates.length > 0 && (
                            <div className="space-y-4">
                              <p className="text-muted-foreground">
                                The following dates would be great for scheduling rehearsals or gigs, as all band members are available:
                              </p>
                              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {availableDates.map((date) => (
                                  <Card key={date.toISOString()}>
                                    <CardContent className="pt-6">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="font-medium">
                                            {format(date, "MMMM d, yyyy")}
                                          </p>
                                          <p className="text-sm text-muted-foreground">
                                            All members available
                                          </p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Consider suggesting these dates to your band leader for scheduling events.
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {isLeader && availableDates.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Available Dates</h3>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {availableDates.map((date) => (
                            <AvailabilitySuggestionCard
                              key={date.toISOString()}
                              date={date}
                              onScheduleEvent={handleScheduleFromSuggestion}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {!isLeader && availableDates.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Available Dates</h3>
                        <p className="text-muted-foreground">
                          The following dates would be great for scheduling rehearsals or gigs, as all band members are available:
                        </p>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {availableDates.map((date) => (
                            <Card key={date.toISOString()}>
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">
                                      {format(date, "MMMM d, yyyy")}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      All members available
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Consider suggesting these dates to your band leader for scheduling events.
                        </p>
                      </div>
                    )}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Scheduled Events</h3>
                      <div className="grid gap-6">
                        {sortEventsByDate(band.events).map((event) => (
                          <Card key={event.id}>
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle>{event.title}</CardTitle>
                                  <CardDescription className="flex items-center gap-2 mt-1">
                                    <span className="capitalize">{event.eventType}</span>
                                    <span>•</span>
                                    <span>{format(event.startTime, "MMMM d, yyyy")}</span>
                                    <span>•</span>
                                    <span>{format(event.startTime, "h:mm a")}</span>
                                  </CardDescription>
                                </div>
                                {isLeader && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteEvent(event.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent>
                              {event.location && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <MapPin className="h-4 w-4" />
                                  <span>{event.location}</span>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="availability">
                <Card>
                  <CardHeader>
                    <CardTitle>Band Availability</CardTitle>
                    <CardDescription>
                      See when band members are available for rehearsals and performances.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AvailabilityCalendar bandId={band.id} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="members" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {band.members.map((member) => (
                    <Card key={member.userId}>
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback className="bg-rhythm-500">
                              {member.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                          </div>
                        </div>
                        {member.instruments && member.instruments.length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs font-medium mb-1">Instruments:</p>
                            <div className="flex flex-wrap gap-1">
                              {member.instruments.map((instrument) => (
                                <span 
                                  key={instrument} 
                                  className="text-xs bg-secondary py-1 px-2 rounded-full"
                                >
                                  {instrument}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}

        <CreateEventModal
          bandId={bandId || ""}
          isOpen={isCreateEventModalOpen}
          onClose={() => {
            setIsCreateEventModalOpen(false);
            setSelectedDate(null);
          }}
          onEventCreated={fetchBand}
          initialDate={selectedDate}
        />
      </main>
      <Footer />
    </div>
  );
};

export default BandDetail;
