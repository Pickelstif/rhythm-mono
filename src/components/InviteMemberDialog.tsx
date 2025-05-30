import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mail, Copy } from "lucide-react";
import { toast } from "sonner";

interface InviteMemberDialogProps {
  bandId: string;
  onMemberInvited?: () => void;
}

const InviteMemberDialog = ({ bandId, onMemberInvited }: InviteMemberDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");

  const generateInviteLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/join-band/${bandId}`;
  };

  const handleEmailInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);

      // Check if user exists
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (userError && userError.code !== "PGRST116") {
        throw userError;
      }

      if (user) {
        // User exists, add them to the band
        const { error: memberError } = await supabase
          .from("band_members")
          .insert([
            {
              band_id: bandId,
              user_id: user.id,
              role: "member",
              joined_at: new Date().toISOString(),
            },
          ]);

        if (memberError) throw memberError;
      } else {
        // User doesn't exist, send invite email
        // TODO: Implement email sending service
        console.log("Sending invite email to:", email);
      }

      toast.success("Invitation sent successfully!");
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
    navigator.clipboard.writeText(inviteLink);
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