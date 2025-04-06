import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface CreateBandDialogProps {
  onBandCreated: () => void;
}

const CreateBandDialog = ({ onBandCreated }: CreateBandDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);

      const bandId = uuidv4();

      // Create the band
      const { data: band, error: bandError } = await supabase
        .from("bands")
        .insert([
          {
            id: bandId,
            name,
            created_by: user.id,
          },
        ])
        .select()
        .single();

      if (bandError) throw bandError;

      // Add the creator as a leader
      const { error: memberError } = await supabase
        .from("band_members")
        .insert([
          {
            band_id: band.id,
            user_id: user.id,
            role: "leader",
            joined_at: new Date().toISOString(),
          },
        ]);

      if (memberError) throw memberError;

      toast.success("Band created successfully!");
      setOpen(false);
      setName("");
      onBandCreated();
    } catch (error) {
      console.error("Error creating band:", error);
      toast.error("Failed to create band. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create New Band
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Band</DialogTitle>
          <DialogDescription>
            Create a new band and start managing your rehearsals and performances.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Band Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter band name"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Band"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBandDialog; 