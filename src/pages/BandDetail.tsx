import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Band, Event, BandMember } from "@/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, MapPin, Plus, Clock, Users, Copy } from "lucide-react";
import { format } from "date-fns";
import Header from "@/components/Header";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Footer from '@/components/Footer';
import { toast } from "sonner";

const BandDetail = () => {
  const { bandId } = useParams<{ bandId: string }>();
  const { user } = useAuth();
  const [band, setBand] = useState<Band | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBand = async () => {
      if (!bandId || !user) return;
      
      try {
        // Get band details
        const { data: bandData, error: bandError } = await supabase
          .from("bands")
          .select("*")
          .eq("id", bandId)
          .single();

        if (bandError) throw bandError;
        if (!bandData) return;

        // Get band members
        const { data: members, error: membersError } = await supabase
          .from("band_members")
          .select("user_id, role")
          .eq("band_id", bandId);

        if (membersError) throw membersError;

        // Get user details for each member
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

        // Get band events
        const { data: events, error: eventsError } = await supabase
          .from("events")
          .select("*")
          .eq("band_id", bandId);

        if (eventsError) throw eventsError;

        const formattedEvents = events?.map(event => ({
          id: event.id,
          bandId: event.band_id,
          title: event.title,
          description: event.description,
          startTime: new Date(event.date),
          endTime: new Date(event.date), // Using the same date for now since we don't have end_time
          attendees: [], // We'll implement attendees later
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

    fetchBand();
  }, [bandId, user]);

  const isLeader = band?.members.some(
    member => member.userId === user?.id && member.role === "leader"
  );

  const sortEventsByDate = (events: Event[]) => {
    return [...events].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
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
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container py-8 flex-1">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{band.name}</h1>
            {band.description && <p className="text-muted-foreground">{band.description}</p>}
            {isLeader && (
              <div className="space-y-2 pt-2">
                <h3 className="font-medium text-sm text-muted-foreground">Invite Members</h3>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-2 bg-muted rounded-md text-sm font-mono truncate">
                    {`${window.location.origin}/join-band/${band.id}`}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/join-band/${band.id}`);
                      toast.success("Invite link copied to clipboard");
                    }}
                    className="shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          {isLeader && (
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Schedule Event
            </Button>
          )}
        </div>

        <Tabs defaultValue="events">
          <TabsList className="mb-6">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>
          
          <TabsContent value="events" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortEventsByDate(band.events).map((event) => (
                <Card key={event.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    {event.description && (
                      <CardDescription>{event.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                        {format(event.startTime, "EEEE, MMMM d, yyyy")}
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        {format(event.startTime, "h:mm a")} - {format(event.endTime, "h:mm a")}
                      </div>
                      <div className="flex items-center text-sm">
                        <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                        {event.attendees.length} attendees
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {band.events.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No events scheduled</h3>
                  <p className="text-muted-foreground mb-4">
                    There are no upcoming events for this band.
                  </p>
                  {isLeader && (
                    <Button>
                      <Plus className="mr-2 h-4 w-4" /> Schedule First Event
                    </Button>
                  )}
                </div>
              )}
            </div>
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
      </main>
      <Footer />
    </div>
  );
};

export default BandDetail;
