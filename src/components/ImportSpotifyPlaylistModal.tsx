import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getPlaylistTracks } from "@/lib/spotify";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ImportSpotifyPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  bandId: string;
  onPlaylistImported: () => void;
}

export function ImportSpotifyPlaylistModal({
  isOpen,
  onClose,
  bandId,
  onPlaylistImported
}: ImportSpotifyPlaylistModalProps) {
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleImport = async () => {
    if (!playlistUrl.trim()) {
      toast.error("Please enter a playlist URL");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to import songs");
      return;
    }

    setIsLoading(true);
    try {
      const tracks = await getPlaylistTracks(playlistUrl);
      let added = 0;
      let skipped = 0;

      // Process each track
      for (const track of tracks) {
        // Check for duplicates
        const { data: existingSongs } = await supabase
          .from("songs")
          .select("id")
          .eq("band_id", bandId)
          .eq("title", track.name)
          .eq("artist", track.artists[0].name);

        if (existingSongs && existingSongs.length > 0) {
          skipped++;
          continue;
        }

        // Add new song
        const { error } = await supabase
          .from("songs")
          .insert({
            band_id: bandId,
            title: track.name,
            artist: track.artists[0].name,
            spotify_link: track.external_urls.spotify,
            created_by: user.id,
            created_at: new Date().toISOString()
          });

        if (error) {
          console.error("Error adding song:", error);
          continue;
        }

        added++;
      }

      toast.success(
        `Successfully imported ${added} songs${
          skipped > 0 ? ` (${skipped} duplicates skipped)` : ""
        }`
      );
      onPlaylistImported();
      onClose();
    } catch (error) {
      console.error("Error importing playlist:", error);
      toast.error("Failed to import playlist");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Spotify Playlist</DialogTitle>
          <DialogDescription>
            Paste a Spotify playlist URL to import all songs to your band's library
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="playlist-url">Playlist URL</Label>
            <Input
              id="playlist-url"
              placeholder="https://open.spotify.com/playlist/..."
              value={playlistUrl}
              onChange={(e) => setPlaylistUrl(e.target.value)}
            />
          </div>
          <Button
            onClick={handleImport}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              "Import Playlist"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 