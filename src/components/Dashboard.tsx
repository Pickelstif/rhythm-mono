import { useEffect, useState } from "react";
import { Band } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, CalendarDays, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import CreateBandDialog from "./CreateBandDialog";

const Dashboard = () => {
  const { user } = useAuth();
  const [bands, setBands] = useState<Band[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBands = async () => {
    if (!user) return;

    try {
      // Get bands where the user is a member
      const { data: bandMembers, error: membersError } = await supabase
        .from("band_members")
        .select("band_id")
        .eq("user_id", user.id);

      if (membersError) throw membersError;

      if (!bandMembers || bandMembers.length === 0) {
        setBands([]);
        return;
      }

      const bandIds = bandMembers.map((member) => member.band_id);

      // Get the band details
      const { data: bandsData, error: bandsError } = await supabase
        .from("bands")
        .select("*")
        .in("id", bandIds);

      if (bandsError) throw bandsError;

      // Get member details for each band
      const bandsWithMembers = await Promise.all(
        bandsData.map(async (band) => {
          const { data: members, error: membersError } = await supabase
            .from("band_members")
            .select("user_id, role")
            .eq("band_id", band.id);

          if (membersError) throw membersError;

          // Get user details for each member
          const memberDetails = await Promise.all(
            members.map(async (member) => {
              const { data: userData, error: userError } = await supabase
                .from("users")
                .select("name")
                .eq("id", member.user_id)
                .single();

              if (userError) throw userError;

              return {
                userId: member.user_id,
                name: userData.name,
                role: member.role as "leader" | "member",
              };
            })
          );

          return {
            id: band.id,
            name: band.name,
            members: memberDetails,
            events: [], // We'll implement events fetching later
            createdAt: new Date(band.created_at || ""),
          };
        })
      );

      setBands(bandsWithMembers);
    } catch (error) {
      console.error("Error fetching bands:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBands();
  }, [user]);

  const getUpcomingEvents = (band: Band) => {
    const now = new Date();
    return band.events
      .filter((event) => event.startTime > now)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-12 bg-muted rounded mb-3"></div>
                <div className="h-12 bg-muted rounded"></div>
              </CardContent>
              <CardFooter>
                <div className="h-10 bg-muted rounded w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Bands</h1>
        <CreateBandDialog onBandCreated={fetchBands} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {bands.map((band) => (
          <Card key={band.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle>{band.name}</CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex items-center mb-3 text-sm text-muted-foreground">
                <Users className="mr-2 h-4 w-4" />
                <span>{band.members.length} members</span>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Upcoming Events:</h4>
                {getUpcomingEvents(band).length > 0 ? (
                  getUpcomingEvents(band).map(event => (
                    <div key={event.id} className="bg-secondary p-2 rounded-md text-sm">
                      <div className="font-medium">{event.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center mt-1">
                        <CalendarDays className="h-3 w-3 mr-1" />
                        {format(event.startTime, "EEE, MMM d • h:mm a")}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No upcoming events</div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Link to={`/band/${band.id}`} className="w-full">
                <Button variant="outline" className="w-full">View Band</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
