import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, AlertCircle } from "lucide-react";
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
  const [nameError, setNameError] = useState("");
  const [checkingName, setCheckingName] = useState(false);

  // Function to check if band name already exists and has members
  const checkBandNameAndMembers = async (bandName: string): Promise<{ exists: boolean; hasMembers: boolean; bandId?: string }> => {
    if (!bandName.trim()) return { exists: false, hasMembers: false };
    
    try {
      const { data: bands, error } = await supabase
        .from("bands")
        .select("id")
        .ilike("name", bandName.trim())
        .limit(1);
        
      if (error) throw error;
      
      if (!bands || bands.length === 0) {
        return { exists: false, hasMembers: false };
      }

      const bandId = bands[0].id;

      // Check if band has any members
      const { data: members, error: membersError } = await supabase
        .from("band_members")
        .select("id")
        .eq("band_id", bandId)
        .limit(1);

      if (membersError) throw membersError;

      return {
        exists: true,
        hasMembers: members && members.length > 0,
        bandId
      };
    } catch (error) {
      console.error("Error checking band name and members:", error);
      return { exists: false, hasMembers: false };
    }
  };

  // Handle name input change with validation
  const handleNameChange = async (value: string) => {
    setName(value);
    setNameError("");
    
    if (!value.trim()) return;
    
    // Debounce the check
    setCheckingName(true);
    setTimeout(async () => {
      const { exists, hasMembers } = await checkBandNameAndMembers(value);
      if (exists && value === name) { // Only update if the name hasn't changed
        if (hasMembers) {
          setNameError(`A band named "${value}" already exists with members. Ask the band leader for an invite link if you're a member.`);
        } else {
          setNameError("");
          // We could show a message that they can join the empty band, but we'll handle that in submission
        }
      }
      setCheckingName(false);
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);

      // Check for existing band and its membership status
      const { exists, hasMembers, bandId } = await checkBandNameAndMembers(name);
      
      if (exists) {
        if (hasMembers) {
          setNameError(`A band named "${name}" already exists with members. Ask the band leader for an invite link if you're a member.`);
          return;
        } else {
          // Band exists but has no members - join as leader
          const { error: memberError } = await supabase
            .from("band_members")
            .insert([
              {
                band_id: bandId,
                user_id: user.id,
                role: "leader",
                joined_at: new Date().toISOString(),
              },
            ]);

          if (memberError) throw memberError;

          toast.success("Successfully joined the band as leader!");
          setOpen(false);
          setName("");
          setNameError("");
          onBandCreated();
          return;
        }
      }

      // Band doesn't exist - create new band
      const newBandId = uuidv4();

      const { data: band, error: bandError } = await supabase
        .from("bands")
        .insert([
          {
            id: newBandId,
            name: name.trim(),
            created_by: user.id,
          },
        ])
        .select()
        .single();

      if (bandError) {
        // Check if this is a unique constraint violation (duplicate band name)
        if (bandError.code === '23505' && bandError.message.includes('bands_name_unique')) {
          // This could happen if another user created the band between our check and insertion
          // Re-check if we can join the band
          const { exists: recheckExists, hasMembers: recheckHasMembers, bandId: recheckBandId } = await checkBandNameAndMembers(name);
          
          if (recheckExists && !recheckHasMembers) {
            // Band was created but has no members - join as leader
            const { error: memberError } = await supabase
              .from("band_members")
              .insert([
                {
                  band_id: recheckBandId,
                  user_id: user.id,
                  role: "leader",
                  joined_at: new Date().toISOString(),
                },
              ]);

            if (memberError) throw memberError;

            toast.success("Successfully joined the band as leader!");
            setOpen(false);
            setName("");
            setNameError("");
            onBandCreated();
            return;
          } else {
            toast.error(
              `A band named "${name}" already exists with members. If you're a member of this band, please ask the band leader for an invite link instead of creating a new band.`,
              {
                duration: 6000,
              }
            );
            return;
          }
        }
        throw bandError;
      }

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
      setNameError("");
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
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter band name"
                required
                className={nameError ? "border-red-500" : ""}
              />
              {checkingName && (
                <p className="text-sm text-gray-500">
                  Checking availability...
                </p>
              )}
              {nameError && (
                <div className="flex items-start space-x-2 text-red-600">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{nameError}</p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {
              setOpen(false);
              setName("");
              setNameError("");
            }}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || checkingName || !!nameError || !name.trim()}
            >
              {loading ? "Creating..." : "Create Band"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBandDialog; 