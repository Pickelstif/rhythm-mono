import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { MoreHorizontal, Search, Music, Grip, X, FileText, Save, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Song, Setlist, SetlistSong, Event } from "@/types";
import { downloadSetlistPDF } from "@/lib/pdf-generator";
import { Database } from "@/integrations/supabase/types";

// Type definitions for Supabase query results
type SetlistRow = Database['public']['Tables']['setlists']['Row'];
type SetlistSongRow = Database['public']['Tables']['setlist_songs']['Row'];

interface SetlistModalProps {
  event: Event;
  bandId: string;
  isOpen: boolean;
  onClose: () => void;
  songs: Song[];
  onSetlistUpdated: () => void;
}

export function SetlistModal({
  event,
  bandId,
  isOpen,
  onClose,
  songs,
  onSetlistUpdated
}: SetlistModalProps) {
  const [selectedSongs, setSelectedSongs] = useState<SetlistSong[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [setlistId, setSetlistId] = useState<string | null>(null);
  const [notesByPosition, setNotesByPosition] = useState<Record<number, string>>({});

  // Filter songs based on search query
  const filteredSongs = songs.filter(
    song => 
      !selectedSongs.some(selected => selected.songId === song.id) && 
      (song.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
       song.artist.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Load existing setlist if available
  useEffect(() => {
    const fetchSetlist = async () => {
      if (!event.id) return;
      
      setLoading(true);
      try {
        // First check if a setlist exists for this event
        const { data: setlistData, error: setlistError } = await supabase
          .from("setlists")
          .select("*")
          .eq("event_id", event.id)
          .single();

        if (setlistError && setlistError.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" error
          throw setlistError;
        }

        if (setlistData) {
          // If setlist exists, get the songs in the setlist
          setSetlistId(setlistData.id);
          
          const { data: setlistSongs, error: songsError } = await supabase
            .from("setlist_songs")
            .select(`
              id,
              setlist_id,
              song_id,
              position,
              notes,
              created_at
            `)
            .eq("setlist_id", setlistData.id)
            .order("position");

          if (songsError) throw songsError;

          // Map the data to our SetlistSong type
          const formattedSongs: SetlistSong[] = (setlistSongs || []).map(item => {
            // Find the full song data
            const songData = songs.find(s => s.id === item.song_id);
            
            if (item.notes) {
              setNotesByPosition(prev => ({
                ...prev,
                [item.position]: item.notes || ""
              }));
            }
            
            return {
              id: item.id,
              setlistId: item.setlist_id,
              songId: item.song_id,
              position: item.position,
              notes: item.notes || undefined,
              song: songData,
              createdAt: new Date(item.created_at),
            };
          });

          setSelectedSongs(formattedSongs);
        }
      } catch (error) {
        console.error("Error fetching setlist:", error);
        toast.error("Failed to load setlist");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && event.id) {
      fetchSetlist();
    }
  }, [isOpen, event.id, songs]);

  const handleSongAdd = (song: Song) => {
    const newPosition = selectedSongs.length;
    
    setSelectedSongs([
      ...selectedSongs,
      {
        id: `temp-${Date.now()}`, // Will be replaced with actual ID after DB insert
        setlistId: setlistId || "",
        songId: song.id,
        position: newPosition,
        song,
        createdAt: new Date(),
      },
    ]);
  };

  const handleSongRemove = (index: number) => {
    const updatedSongs = [...selectedSongs];
    updatedSongs.splice(index, 1);
    
    // Update positions after removal
    const reorderedSongs = updatedSongs.map((song, idx) => ({
      ...song,
      position: idx,
    }));
    
    setSelectedSongs(reorderedSongs);
    
    // Clear notes for the removed position
    const updatedNotes = { ...notesByPosition };
    delete updatedNotes[index];
    
    // Shift notes for positions after the removed song
    const newNotes: Record<number, string> = {};
    Object.entries(updatedNotes).forEach(([pos, note]) => {
      const position = parseInt(pos);
      if (position > index) {
        newNotes[position - 1] = note;
      } else {
        newNotes[position] = note;
      }
    });
    
    setNotesByPosition(newNotes);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    
    // Reorder the songs based on drag and drop
    const reorderedSongs = [...selectedSongs];
    const [removed] = reorderedSongs.splice(source.index, 1);
    reorderedSongs.splice(destination.index, 0, removed);
    
    // Update positions after reordering
    const updatedSongs = reorderedSongs.map((song, idx) => ({
      ...song,
      position: idx,
    }));
    
    setSelectedSongs(updatedSongs);
    
    // Reorder notes as well
    const newNotes: Record<number, string> = {};
    Object.entries(notesByPosition).forEach(([pos, note]) => {
      const oldPosition = parseInt(pos);
      if (oldPosition === source.index) {
        newNotes[destination.index] = note;
      } else if (
        oldPosition > source.index && 
        oldPosition <= destination.index
      ) {
        newNotes[oldPosition - 1] = note;
      } else if (
        oldPosition < source.index && 
        oldPosition >= destination.index
      ) {
        newNotes[oldPosition + 1] = note;
      } else {
        newNotes[oldPosition] = note;
      }
    });
    
    setNotesByPosition(newNotes);
  };

  const handleNoteChange = (position: number, note: string) => {
    setNotesByPosition({
      ...notesByPosition,
      [position]: note,
    });
  };

  const saveSetlist = async () => {
    if (!event.id) return;
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      
      let currentSetlistId = setlistId;
      
      // Create setlist if it doesn't exist
      if (!currentSetlistId) {
        const { data: newSetlist, error: setlistError } = await supabase
          .from("setlists")
          .insert({
            event_id: event.id,
            created_by: user.id,
          })
          .select()
          .single();
          
        if (setlistError) throw setlistError;
        currentSetlistId = newSetlist.id;
        setSetlistId(currentSetlistId);
      }
      
      // Delete existing setlist songs
      if (currentSetlistId) {
        const { error: deleteError } = await supabase
          .from("setlist_songs")
          .delete()
          .eq("setlist_id", currentSetlistId);
          
        if (deleteError) throw deleteError;
      }
      
      // Insert updated setlist songs
      if (selectedSongs.length > 0 && currentSetlistId) {
        const songsToInsert = selectedSongs.map((song, index) => ({
          setlist_id: currentSetlistId,
          song_id: song.songId,
          position: index,
          notes: notesByPosition[index] || null,
        }));
        
        const { error: insertError } = await supabase
          .from("setlist_songs")
          .insert(songsToInsert);
          
        if (insertError) throw insertError;
      }
      
      toast.success("Setlist saved successfully");
      onSetlistUpdated();
      onClose();
    } catch (error) {
      console.error("Error saving setlist:", error);
      toast.error("Failed to save setlist");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (selectedSongs.length === 0) {
      toast.error("Add songs to the setlist first");
      return;
    }
    
    setIsGeneratingPdf(true);
    
    try {
      // Format the event data to match what the pdf-generator expects
      const formattedEvent = {
        name: event.title,
        date: event.startTime,
        venue: event.location || 'No location specified',
        band_id: bandId,
        id: event.id
      };
      
      // Format the songs data to match what the pdf-generator expects
      const formattedSongs = selectedSongs.map((item, index) => {
        return {
          id: item.songId,
          title: item.song?.title || '',
          artist: item.song?.artist || '',
          key: null,
          tempo: null,
          notes: notesByPosition[index] || null,
          song_order: index,
          has_sheet: !!item.song?.songSheetPath,
          songSheetPath: item.song?.songSheetPath
        };
      });
      
      await downloadSetlistPDF(formattedEvent, formattedSongs);
      toast.success("Setlist PDF generated successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Setlist for {event.title}</DialogTitle>
          <DialogDescription>
            Create and arrange your setlist for this event. Add songs from your library and order them by dragging.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden">
          {/* Left side - Available songs */}
          <div className="flex flex-col h-[600px]">
            <div className="flex items-center space-x-2 mb-2 p-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search songs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
            <h3 className="text-sm font-medium mb-2">Available Songs</h3>
            <div className="overflow-y-auto pr-2 flex-1 border rounded-md p-2 min-h-0">
              {filteredSongs.length === 0 ? (
                <p className="text-sm text-muted-foreground p-2">No songs available</p>
              ) : (
                filteredSongs.map((song) => (
                  <Card key={song.id} className="mb-2 hover:bg-accent transition-colors">
                    <CardContent className="p-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{song.title}</p>
                        <p className="text-sm text-muted-foreground">{song.artist}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleSongAdd(song)}>
                        Add
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
          
          {/* Right side - Selected songs (setlist) */}
          <div className="flex flex-col h-[600px]">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Setlist Order</h3>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={generatePDF}
                  disabled={isGeneratingPdf || selectedSongs.length === 0}
                >
                  {isGeneratingPdf ? (
                    <>Generating...</>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-1" />
                      PDF
                    </>
                  )}
                </Button>
                <Button 
                  size="sm" 
                  onClick={saveSetlist}
                  disabled={loading}
                >
                  {loading ? "Saving..." : (
                    <>
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="setlist">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="overflow-y-auto pr-2 flex-1 border rounded-md p-2 min-h-0"
                  >
                    {selectedSongs.length === 0 ? (
                      <p className="text-sm text-muted-foreground p-4 text-center">
                        Add songs to your setlist
                      </p>
                    ) : (
                      selectedSongs.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="mb-2"
                            >
                              <Card>
                                <CardContent className="p-3">
                                  <div className="flex items-center mb-2">
                                    <div 
                                      {...provided.dragHandleProps}
                                      className="p-1 mr-2 rounded-md hover:bg-muted cursor-grab"
                                    >
                                      <Grip className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center">
                                        <span className="font-semibold mr-2">{index + 1}.</span>
                                        <Music className="w-4 h-4 mr-2 text-muted-foreground" />
                                        <p className="font-medium">{item.song?.title}</p>
                                      </div>
                                      <p className="text-sm text-muted-foreground">
                                        {item.song?.artist}
                                      </p>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleSongRemove(index)}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  <div>
                                    <Input
                                      placeholder="Add notes (optional)"
                                      value={notesByPosition[index] || ""}
                                      onChange={(e) => handleNoteChange(index, e.target.value)}
                                      className="text-sm"
                                    />
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 