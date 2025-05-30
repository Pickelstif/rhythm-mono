import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Band, Event, BandMember, Song, Setlist } from "@/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, MapPin, Plus, Clock, Users, Copy, Trash2, Pencil, Music, ExternalLink, FileText, Loader2, List, Download } from "lucide-react";
import { format } from "date-fns";
import Header from "@/components/Header";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreateEventModal } from "@/components/CreateEventModal";
import { AvailabilitySuggestionCard } from "@/components/AvailabilitySuggestionCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreateSongModal } from "@/components/CreateSongModal";
import { SetlistModal } from "@/components/SetlistModal";
import { Database } from "@/integrations/supabase/types";
import { ImportSpotifyPlaylistModal } from "@/components/ImportSpotifyPlaylistModal";
import { Switch } from "@/components/ui/switch";

// Type definitions for Supabase query results
type SetlistRow = Database['public']['Tables']['setlists']['Row'];

const BandDetail = () => {
  const { bandId } = useParams<{ bandId: string }>();
  const { user } = useAuth();
  const [band, setBand] = useState<Band | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<{id: string, title: string} | null>(null);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [bandAvailability, setBandAvailability] = useState<Map<string, Date[]>>(new Map());
  
  // New state variables for songs
  const [songs, setSongs] = useState<Song[]>([]);
  const [isAddSongModalOpen, setIsAddSongModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [deletingSong, setDeletingSong] = useState<{id: string, title: string} | null>(null);
  const [songsheetUploading, setSongsheetUploading] = useState(false);

  // State for setlist management
  const [isSetlistModalOpen, setIsSetlistModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [eventsWithSetlists, setEventsWithSetlists] = useState<Map<string, boolean>>(new Map());

  const [isImportPlaylistModalOpen, setIsImportPlaylistModalOpen] = useState(false);

  // TEMPORARY: State for delete all songs confirmation
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  const navigate = useNavigate();

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
          
          // Convert dates to ISO strings and remove duplicates
          const uniqueDates = new Set(
            availability?.map(a => new Date(a.date).toISOString().split("T")[0]) || []
          );
          return Array.from(uniqueDates);
        })
      );

      // Find dates where all members are available
      const allDates = new Set(memberAvailability.flat());
      const commonDates: Date[] = [];

      // For each date, check if all members have it
      allDates.forEach(dateStr => {
        const isCommonDate = memberAvailability.every(memberDates => 
          memberDates.includes(dateStr)
        );
        
        if (isCommonDate) {
          commonDates.push(new Date(dateStr));
        }
      });

      // Sort dates chronologically
      commonDates.sort((a, b) => a.getTime() - b.getTime());

      // Update the band availability map
      setBandAvailability(prev => {
        const newMap = new Map(prev);
        newMap.set(bandId, commonDates);
        return newMap;
      });
    } catch (error) {
      console.error("Error fetching availability:", error);
    }
  };

  const fetchSongs = async () => {
    if (!bandId) return;
    
    try {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .eq("band_id", bandId)
        .order("title");

      if (error) throw error;

      const formattedSongs = data?.map(song => ({
        id: song.id,
        bandId: song.band_id,
        title: song.title,
        artist: song.artist,
        spotifyLink: song.spotify_link,
        songSheetPath: song.song_sheet_path,
        createdBy: song.created_by,
        createdAt: new Date(song.created_at),
      })) || [];

      setSongs(formattedSongs);
    } catch (error) {
      console.error("Error fetching songs:", error);
      toast.error("Failed to load songs");
    }
  };

  const fetchEventsWithSetlists = async () => {
    if (!bandId || !band) return;
    
    try {
      // Get all events for this band
      const eventIds = band.events.map(event => event.id);
      
      if (eventIds.length === 0) return;
      
      // Check which events have setlists
      const { data: setlists, error } = await supabase
        .from("setlists")
        .select("event_id")
        .in("event_id", eventIds);

      if (error) throw error;
      
      // Create a map of event IDs to boolean (has setlist)
      const setlistMap = new Map<string, boolean>();
      band.events.forEach(event => {
        setlistMap.set(event.id, false);
      });
      
      if (setlists) {
        // Explicitly type the result
        (setlists as Pick<SetlistRow, 'event_id'>[]).forEach(setlist => {
          setlistMap.set(setlist.event_id, true);
        });
      }
      
      setEventsWithSetlists(setlistMap);
    } catch (error) {
      console.error("Error fetching setlists:", error);
    }
  };

  useEffect(() => {
    fetchBand();
  }, [bandId, user]);

  useEffect(() => {
    if (band) {
      fetchMemberAvailability();
      fetchEventsWithSetlists();
    }
  }, [band]);

  useEffect(() => {
    if (band) {
      fetchSongs();
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
    } finally {
      setDeletingEvent(null);
    }
  };

  const handleDeleteSong = async (songId: string) => {
    try {
      const { error } = await supabase
        .from("songs")
        .delete()
        .eq("id", songId);

      if (error) throw error;

      toast.success("Song deleted successfully");
      fetchSongs(); // Refresh songs list
    } catch (error) {
      console.error("Error deleting song:", error);
      toast.error("Failed to delete song");
    } finally {
      setDeletingSong(null);
    }
  };

  const confirmDeleteEvent = (event: Event) => {
    setDeletingEvent({
      id: event.id,
      title: event.title
    });
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setIsCreateEventModalOpen(true);
  };

  const handleScheduleFromSuggestion = (date: Date) => {
    setSelectedDate(date);
    setEditingEvent(null);
    setIsCreateEventModalOpen(true);
  };

  const handleManageSetlist = (event: Event) => {
    setCurrentEvent(event);
    setIsSetlistModalOpen(true);
  };

  // TEMPORARY: Function to delete all songs
  const handleDeleteAllSongs = async () => {
    if (!bandId) return;
    
    try {
      const { error } = await supabase
        .from("songs")
        .delete()
        .eq("band_id", bandId);

      if (error) throw error;
      
      toast.success("All songs deleted successfully");
      fetchSongs();
    } catch (error) {
      console.error("Error deleting songs:", error);
      toast.error("Failed to delete songs");
    } finally {
      setShowDeleteAllConfirm(false);
    }
  };

  const handleRoleToggle = async (memberId: string, currentRole: "leader" | "member") => {
    if (!bandId || !user) return;
    
    try {
      // Don't allow changing your own role
      if (memberId === user.id) {
        toast.error("You cannot change your own role");
        return;
      }

      const newRole = currentRole === "leader" ? "member" : "leader";
      
      const { error } = await supabase
        .from("band_members")
        .update({ role: newRole })
        .eq("band_id", bandId)
        .eq("user_id", memberId);

      if (error) throw error;

      toast.success(`Role updated successfully`);
      fetchBand(); // Refresh the band data
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    }
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
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </main>
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
              <div className="space-y-2">
                <h1 className="text-4xl font-bold">{band.name}</h1>
                {isLeader && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/join-band/${band.id}`);
                        toast.success("Invite link copied to clipboard");
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Invite Link
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/dashboard')}
                >
                  Back to Dashboard
                </Button>
                <Link to={`/band/${bandId}/finances`}>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Finances
                  </Button>
                </Link>
              </div>
            </div>

            <Tabs defaultValue="availability" className="space-y-6">
              <TabsList>
                <TabsTrigger value="availability">Availability</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="songs">Songs</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
              </TabsList>

              <TabsContent value="availability">
                <Card>
                  <CardHeader>
                    <CardTitle>Band Availability</CardTitle>
                    <CardDescription>
                      See when band members are available for rehearsals and performances.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Legend */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <h4 className="text-sm font-medium">How to use:</h4>
                      <div className="grid gap-2 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-card border-2 border-amber-500 rounded-full flex items-center justify-center text-xs font-medium">
                            15
                          </div>
                          <span className="text-muted-foreground">
                            Orange ring = All members available
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-card border rounded-full flex items-center justify-center text-[10px] font-medium">
                            3/4
                          </div>
                          <span className="text-muted-foreground">
                            Numbers show available/total members
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                            25
                          </div>
                          <span className="text-muted-foreground">
                            Your selected dates appear highlighted
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg">👆</span>
                          <span className="text-muted-foreground">
                            Double-tap any date to see which members are available
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <AvailabilityCalendar 
                      bandId={band.id} 
                      onAvailabilityChange={fetchMemberAvailability}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="events" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Events</h3>
                  {isLeader && (
                    <Button onClick={() => setIsCreateEventModalOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </Button>
                  )}
                </div>
                
                {band.events.length === 0 ? (
                  <div className="space-y-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                          <p className="text-lg text-muted-foreground">
                            No events scheduled yet.
                          </p>
                          {isLeader && bandAvailability.get(band.id)?.length > 0 && (
                            <div className="space-y-4">
                              <p className="text-muted-foreground">
                                The following dates would be great for scheduling rehearsals or gigs, as all band members are available:
                              </p>
                              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {bandAvailability.get(band.id)?.map((date) => (
                                  <AvailabilitySuggestionCard
                                    key={date.toISOString()}
                                    date={date}
                                    onScheduleEvent={handleScheduleFromSuggestion}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                          {!isLeader && bandAvailability.get(band.id)?.length > 0 && (
                            <div className="space-y-4">
                              <p className="text-muted-foreground">
                                The following dates would be great for scheduling rehearsals or gigs, as all band members are available:
                              </p>
                              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {bandAvailability.get(band.id)?.map((date) => (
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
                                <div className="flex space-x-1">
                                  {eventsWithSetlists.get(event.id) ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex items-center gap-1"
                                      onClick={() => handleManageSetlist(event)}
                                    >
                                      <List className="h-4 w-4" />
                                      Edit Setlist
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex items-center gap-1"
                                      onClick={() => handleManageSetlist(event)}
                                    >
                                      <Plus className="h-4 w-4" />
                                      Add Setlist
                                    </Button>
                                  )}
                                  {isLeader && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEditEvent(event)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => confirmDeleteEvent(event)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
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
                    
                    {isLeader && bandAvailability.get(band.id)?.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Available Dates</h3>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {bandAvailability.get(band.id)?.map((date) => (
                            <AvailabilitySuggestionCard
                              key={date.toISOString()}
                              date={date}
                              onScheduleEvent={handleScheduleFromSuggestion}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {!isLeader && bandAvailability.get(band.id)?.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Available Dates</h3>
                        <p className="text-muted-foreground">
                          The following dates would be great for scheduling rehearsals or gigs, as all band members are available:
                        </p>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {bandAvailability.get(band.id)?.map((date) => (
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
                )}
              </TabsContent>

              <TabsContent value="songs" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Song Library</h3>
                  {isLeader && (
                    <div className="flex gap-2">
                      <Button onClick={() => setIsAddSongModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Song
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setIsImportPlaylistModalOpen(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Import Spotify Playlist
                      </Button>
                      {/* TEMPORARY: Delete all songs button - Remove this before production */}
                      <Button 
                        variant="destructive"
                        onClick={() => setShowDeleteAllConfirm(true)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete All Songs
                      </Button>
                    </div>
                  )}
                </div>
                {songs.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-lg text-muted-foreground">
                          No songs in your library yet.
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {isLeader
                            ? "Add songs to create a repertoire for your band."
                            : "The band leader can add songs to the library."}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-0">
                      <ul className="divide-y">
                        {songs.map((song) => (
                          <li key={song.id} className="p-4 hover:bg-muted/50">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <Music className="h-4 w-4 text-muted-foreground shrink-0" />
                                <div>
                                  <h4 className="font-medium">{song.title}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {song.artist}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {song.spotifyLink && (
                                  <a
                                    href={song.spotifyLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-xs bg-secondary py-1 px-2 rounded-full hover:bg-secondary/80"
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    Spotify
                                  </a>
                                )}
                                {song.songSheetPath && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="inline-flex items-center text-xs py-1 px-2 rounded-full hover:bg-secondary/80"
                                    onClick={async (e) => {
                                      // Set loading state on the button
                                      const button = e.currentTarget;
                                      const originalContent = button.innerHTML;
                                      button.innerHTML = `<svg class="h-3 w-3 mr-1 animate-spin" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Downloading...`;
                                      
                                      try {
                                        console.log("Attempting to generate signed URL for:", song.songSheetPath);
                                        const { data, error } = await supabase.storage
                                          .from('song_sheets')
                                          .createSignedUrl(song.songSheetPath, 60); // 60 seconds expiry
                                        
                                        if (error) {
                                          console.error("Error creating signed URL:", error);
                                          throw error;
                                        }
                                        
                                        console.log("Signed URL generated:", data?.signedUrl);
                                        
                                        if (data?.signedUrl) {
                                          window.open(data.signedUrl, '_blank');
                                        } else {
                                          console.error("No signed URL returned");
                                          console.log("Trying direct public URL as fallback");
                                          // Try direct public URL as fallback
                                          const publicUrl = `https://ndypjhbdytqcuenohppd.supabase.co/storage/v1/object/public/song_sheets/${song.songSheetPath}`;
                                          console.log("Using public URL:", publicUrl);
                                          window.open(publicUrl, '_blank');
                                        }
                                      } catch (error) {
                                        console.error('Error getting download URL:', error);
                                        toast.error('Failed to download song sheet');
                                      } finally {
                                        // Restore button content
                                        button.innerHTML = originalContent;
                                      }
                                    }}
                                  >
                                    <FileText className="h-3 w-3 mr-1" />
                                    Song Sheet
                                  </Button>
                                )}
                                {isLeader && (
                                  <div className="flex space-x-1 ml-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setEditingSong(song)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setDeletingSong({
                                        id: song.id,
                                        title: song.title
                                      })}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
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
                          <div className="flex-1">
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                          </div>
                          {isLeader && member.userId !== user?.id && (
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={member.role === "leader"}
                                onCheckedChange={() => handleRoleToggle(member.userId, member.role)}
                                aria-label="Toggle leader role"
                              />
                              <span className="text-xs text-muted-foreground">
                                Leader
                              </span>
                            </div>
                          )}
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
            setEditingEvent(null);
          }}
          onEventCreated={fetchBand}
          initialDate={selectedDate}
          editingEvent={editingEvent}
        />

        <AlertDialog open={!!deletingEvent} onOpenChange={(open) => !open && setDeletingEvent(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the event "{deletingEvent?.title}". This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deletingEvent && handleDeleteEvent(deletingEvent.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!deletingSong} onOpenChange={(open) => !open && setDeletingSong(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the song "{deletingSong?.title}" from your library. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deletingSong && handleDeleteSong(deletingSong.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <CreateSongModal
          bandId={bandId || ""}
          isOpen={isAddSongModalOpen || !!editingSong}
          onClose={() => {
            setIsAddSongModalOpen(false);
            setEditingSong(null);
          }}
          onSongCreated={fetchSongs}
          editingSong={editingSong}
        />

        {currentEvent && (
          <SetlistModal
            event={currentEvent}
            bandId={bandId || ""}
            isOpen={isSetlistModalOpen}
            onClose={() => {
              setIsSetlistModalOpen(false);
              setCurrentEvent(null);
            }}
            songs={songs}
            onSetlistUpdated={() => fetchEventsWithSetlists()}
          />
        )}

        <ImportSpotifyPlaylistModal
          isOpen={isImportPlaylistModalOpen}
          onClose={() => setIsImportPlaylistModalOpen(false)}
          bandId={bandId || ""}
          onPlaylistImported={fetchSongs}
        />

        {/* TEMPORARY: Delete all songs confirmation dialog - Remove this before production */}
        <AlertDialog open={showDeleteAllConfirm} onOpenChange={setShowDeleteAllConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete ALL songs from your band's library. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteAllSongs}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Yes, delete all songs
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default BandDetail;
