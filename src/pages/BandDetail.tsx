
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Band, Event, BandMember } from "@/types";
import { getBandById } from "@/services/mock-data";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, MapPin, Plus, Clock, Users } from "lucide-react";
import { format } from "date-fns";
import Header from "@/components/Header";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import { currentUser } from "@/services/mock-data";

const BandDetail = () => {
  const { bandId } = useParams<{ bandId: string }>();
  const [band, setBand] = useState<Band | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBand = async () => {
      if (!bandId) return;
      
      try {
        const bandData = await getBandById(bandId);
        if (bandData) {
          setBand(bandData);
        }
      } catch (error) {
        console.error("Error fetching band:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBand();
  }, [bandId]);

  const isLeader = band?.members.some(
    member => member.userId === currentUser.id && member.role === "leader"
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
            <Link to="/">Back to Dashboard</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{band.name}</h1>
            {band.description && <p className="text-muted-foreground">{band.description}</p>}
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
                      {event.location && (
                        <div className="flex items-center text-sm">
                          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                          {event.location}
                        </div>
                      )}
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
    </div>
  );
};

export default BandDetail;
