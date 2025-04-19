import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Song } from "@/types";
import { useState } from "react";
import { SongFormValues } from "./CreateSongModal";
import { FileText } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  artist: z.string().min(1, "Artist is required"),
  spotifyLink: z.string().url("Invalid URL").optional().or(z.literal("")),
});

interface CreateSongFormProps {
  onSubmit: (values: SongFormValues) => void;
  editingSong?: Song | null;
}

export function CreateSongForm({ onSubmit, editingSong }: CreateSongFormProps) {
  const [songSheet, setSongSheet] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: editingSong?.title || "",
      artist: editingSong?.artist || "",
      spotifyLink: editingSong?.spotifyLink || "",
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = event.target.files?.[0] || null;
    
    if (file) {
      // Verify it's a PDF
      if (!file.type.includes("pdf")) {
        setFileError("Only PDF files are allowed");
        return;
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setFileError("File size should be less than 10MB");
        return;
      }
    }
    
    setSongSheet(file);
  };

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      title: values.title,
      artist: values.artist,
      songSheet,
      spotifyLink: values.spotifyLink || undefined,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter song title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="artist"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Artist</FormLabel>
              <FormControl>
                <Input placeholder="Enter artist name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="spotifyLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Spotify Link (optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://open.spotify.com/track/..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-2">
          <FormLabel>Song Sheet (PDF only, max 10MB)</FormLabel>
          <div className="border rounded-md p-2">
            <Input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileChange}
              className="cursor-pointer"
            />
          </div>
          {fileError && <p className="text-sm text-destructive">{fileError}</p>}
          {editingSong?.songSheetPath && !songSheet && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Current file: {editingSong.songSheetPath.split('/').pop()}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit">{editingSong ? "Update Song" : "Add Song"}</Button>
        </div>
      </form>
    </Form>
  );
} 