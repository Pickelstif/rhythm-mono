import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const JoinBand = () => {
  const { bandId } = useParams<{ bandId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [band, setBand] = useState<{ id: string; name: string } | null>(null);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    const checkBandAndMembership = async () => {
      if (!bandId || !user) return;

      try {
        // Get band details
        const { data: bandData, error: bandError } = await supabase
          .from("bands")
          .select("id, name")
          .eq("id", bandId)
          .single();

        if (bandError) throw bandError;
        setBand(bandData);

        // Check if user is already a member
        const { data: memberData, error: memberError } = await supabase
          .from("band_members")
          .select("id")
          .eq("band_id", bandId)
          .eq("user_id", user.id)
          .single();

        if (memberError && memberError.code !== "PGRST116") {
          throw memberError;
        }

        setIsMember(!!memberData);
      } catch (error) {
        console.error("Error checking band:", error);
        toast.error("Failed to load band information");
      } finally {
        setLoading(false);
      }
    };

    checkBandAndMembership();
  }, [bandId, user]);

  const handleJoinBand = async () => {
    if (!bandId || !user) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from("band_members")
        .insert([
          {
            band_id: bandId,
            user_id: user.id,
            role: "member",
            joined_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;

      toast.success("Successfully joined the band!");
      navigate(`/band/${bandId}`);
    } catch (error) {
      console.error("Error joining band:", error);
      toast.error("Failed to join band. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!band) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Band Not Found</CardTitle>
            <CardDescription>
              The band you are trying to join does not exist or the invite link is invalid.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate("/")} className="w-full">
              Back to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isMember) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Already a Member</CardTitle>
            <CardDescription>
              You are already a member of {band.name}.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate(`/band/${band.id}`)} className="w-full">
              Go to Band
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join {band.name}</CardTitle>
          <CardDescription>
            You have been invited to join this band. Click the button below to accept the invitation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            By joining this band, you will be able to:
          </p>
          <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside">
            <li>View and manage band events</li>
            <li>Share your availability</li>
            <li>Communicate with other band members</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button onClick={handleJoinBand} className="w-full" disabled={loading}>
            {loading ? "Joining..." : "Join Band"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default JoinBand; 