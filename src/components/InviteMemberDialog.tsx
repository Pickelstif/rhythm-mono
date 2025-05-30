
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mail, Copy } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface InviteMemberDialogProps {
  bandId: string;
  onMemberInvited?: () => void;
}

// Input validation helper
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

const InviteMemberDialog = ({ bandId, onMemberInvited }: InviteMemberDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");

  const generateInviteLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/join-band/${bandId}`;
  };

  const checkUserPermissions = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data: memberData, error } = await supabase
        .from("band_members")
        .select("role")
        .eq("band_id", bandId)
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error checking permissions:", error);
        return false;
      }

      return memberData?.role === "leader";
    } catch (error) {
      console.error("Error checking permissions:", error);
      return false;
    }
  };

  const handleEmailInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Validate email format
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      // Check if user has permission to invite members
      const hasPermission = await checkUserPermissions();
      if (!hasPermission) {
        toast.error("You don't have permission to invite members to this band");
        return;
      }

      // Check if user exists
      const { data: existingUser, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email.toLowerCase().trim())
        .single();

      if (userError && userError.code !== "PGRST116") {
        throw userError;
      }

      if (existingUser) {
        // Check if user is already a member
        const { data: existingMember, error: memberCheckError } = await supabase
          .from("band_members")
          .select("id")
          .eq("band_id", bandId)
          .eq("user_id", existingUser.id)
          .single();

        if (memberCheckError && memberCheckError.code !== "PGRST116") {
          throw memberCheckError;
        }

        if (existingMember) {
          toast.error("This user is already a member of the band");
          return;
        }

        // Add user to the band
        const { error: memberError } = await supabase
          .from("band_members")
          .insert([
            {
              band_id: bandId,
              user_id: existingUser.id,
              role: "member",
              joined_at: new Date().toISOString(),
            },
          ]);

        if (memberError) throw memberError;
        
        toast.success("Member added to the band successfully!");
      } else {
        // User doesn't exist, show message about invitation
        toast.info("User not found. Please share the invite link with them to join.");
      }

      setOpen(false);
      setEmail("");
      onMemberInvited?.();
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error("Failed to send invitation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const link = generateInviteLink();
    navigator.clipboard.writeText(link);
    toast.success("Invite link copied to clipboard!");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Mail className="mr-2 h-4 w-4" /> Invite Members
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Members</DialogTitle>
          <DialogDescription>
            Invite members to join your band via email or share the invite link.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <form onSubmit={handleEmailInvite} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                maxLength={254}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Invitation"}
            </Button>
          </form>

          <div className="space-y-2">
            <Label>Invite Link</Label>
            <div className="flex gap-2">
              <Input
                value={inviteLink || generateInviteLink()}
                readOnly
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteMemberDialog;
