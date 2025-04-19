import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateSongForm } from "./CreateSongForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Song } from "@/types";

interface CreateSongModalProps {
  bandId: string;
  isOpen: boolean;
  onClose: () => void;
  onSongCreated: () => void;
  editingSong?: Song | null;
}

export interface SongFormValues {
  title: string;
  artist: string;
  spotifyLink?: string;
  songSheet?: File | null;
}

export function CreateSongModal({ 
  bandId, 
  isOpen, 
  onClose, 
  onSongCreated,
  editingSong
}: CreateSongModalProps) {
  const handleSubmit = async (values: SongFormValues) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      let songSheetPath = editingSong?.songSheetPath || null;
      
      // Upload song sheet if provided
      if (values.songSheet) {
        // Create a unique file name to avoid collisions
        const fileName = `${bandId}/${Date.now()}-${values.songSheet.name.replace(/\s+/g, '-')}`;
        
        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('song_sheets')
          .upload(fileName, values.songSheet, {
            contentType: 'application/pdf',
            upsert: true,
            cacheControl: '3600',
            duplex: 'half',
            metadata: {
              originalFilename: values.songSheet.name,
              title: values.title,
              artist: values.artist
            }
          });
          
        if (uploadError) {
          throw new Error(`Failed to upload song sheet: ${uploadError.message}`);
        }
        
        songSheetPath = uploadData?.path || null;
      }
      
      if (editingSong) {
        // Update existing song
        const { error } = await supabase
          .from("songs")
          .update({
            title: values.title,
            artist: values.artist,
            spotify_link: values.spotifyLink || null,
            song_sheet_path: songSheetPath,
          })
          .eq("id", editingSong.id);

        if (error) {
          console.error("Database error:", error);
          throw new Error(error.message);
        }

        toast.success("Song updated successfully");
      } else {
        // Create new song
        const { error } = await supabase
          .from("songs")
          .insert({
            band_id: bandId,
            created_by: user.id,
            title: values.title,
            artist: values.artist,
            spotify_link: values.spotifyLink || null,
            song_sheet_path: songSheetPath,
          })
          .select()
          .single();

        if (error) {
          console.error("Database error:", error);
          throw new Error(error.message);
        }

        toast.success("Song added successfully");
      }
      
      onSongCreated();
      onClose();
    } catch (error) {
      console.error(editingSong ? "Error updating song:" : "Error creating song:", error);
      toast.error(error instanceof Error ? error.message : editingSong ? "Failed to update song" : "Failed to add song");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingSong ? "Edit Song" : "Add New Song"}</DialogTitle>
        </DialogHeader>
        <CreateSongForm 
          onSubmit={handleSubmit} 
          editingSong={editingSong}
        />
      </DialogContent>
    </Dialog>
  );
} 