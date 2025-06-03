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

  // Function to check if band name already exists
  const checkBandNameExists = async (bandName: string): Promise<boolean> => {
    if (!bandName.trim()) return false;
    
    try {
      const { data, error } = await supabase
        .from("bands")
        .select("id")
        .ilike("name", bandName.trim())
        .limit(1);
        
      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      console.error("Error checking band name:", error);
      return false;
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
      const exists = await checkBandNameExists(value);
      if (exists && value === name) { // Only update if the name hasn't changed
        setNameError(`A band named "${value}" already exists. Ask the band leader for an invite link if you're a member.`);
      }
      setCheckingName(false);
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Final check before submission
    if (nameError) {
      toast.error("Please fix the band name error before proceeding.");
      return;
    }
    
    // Check for duplicate name one more time before submission
    const nameExists = await checkBandNameExists(name);
    if (nameExists) {
      setNameError(`A band named "${name}" already exists. Ask the band leader for an invite link if you're a member.`);
      return;
    }

    try {
      setLoading(true);

      const bandId = uuidv4();

      // Create the band
      const { data: band, error: bandError } = await supabase
        .from("bands")
        .insert([
          {
            id: bandId,
            name: name.trim(),
            created_by: user.id,
          },
        ])
        .select()
        .single();

      if (bandError) {
        // Check if this is a unique constraint violation (duplicate band name)
        if (bandError.code === '23505' && bandError.message.includes('bands_name_unique')) {
          toast.error(
            `A band named "${name}" already exists. If you're a member of this band, please ask the band leader for an invite link instead of creating a new band.`,
            {
              duration: 6000,
            }
          );
          return;
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