import { useState, useEffect } from 'react';
import { UserProfile, Instrument } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { ScrollArea } from '../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { profileService } from '../services/profileService';
import { toast } from '../components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import Header from '../components/Header';
import Footer from '@/components/Footer';

const availableInstruments: Instrument[] = [
  { id: 'piano', name: 'Piano', type: 'Keys' },
  { id: 'guitar', name: 'Guitar', type: 'String' },
  { id: 'drums', name: 'Drums', type: 'Percussion' },
  { id: 'bass', name: 'Bass', type: 'String' },
  { id: 'vocals', name: 'Vocals', type: 'Voice' },
  { id: 'saxophone', name: 'Saxophone', type: 'Wind' },
];

const defaultProfile: UserProfile = {
  id: '',
  email: '',
  fullName: '',
  instruments: [],
  notificationPreferences: {
    emailNotifications: true,
    practiceReminders: true,
    newCollaborationRequests: true,
    messageNotifications: true,
  },
  createdAt: new Date().toISOString(),
};

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await profileService.getUserProfile();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to load profile');
      toast({
        title: 'Error',
        description: 'Failed to load profile. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setIsLoading(true);
      const updatedProfile = await profileService.updateUserProfile(profile);
      setProfile(updatedProfile);
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleInstrument = (instrument: Instrument) => {
    const isSelected = profile.instruments.includes(instrument.id);
    setProfile({
      ...profile,
      instruments: isSelected
        ? profile.instruments.filter(id => id !== instrument.id)
        : [...profile.instruments, instrument.id],
    });
  };

  const toggleNotificationPreference = (key: keyof typeof profile.notificationPreferences) => {
    setProfile({
      ...profile,
      notificationPreferences: {
        ...profile.notificationPreferences,
        [key]: !profile.notificationPreferences[key],
      },
    });
  };

  const renderActionButtons = () => (
    <div className="space-x-4">
      {isEditing ? (
        <>
          <Button
            variant="outline"
            onClick={() => setIsEditing(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleProfileUpdate}
            disabled={isLoading}
          >
            Save Changes
          </Button>
        </>
      ) : (
        <Button
          onClick={() => setIsEditing(true)}
          disabled={isLoading}
        >
          Edit Profile
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container mx-auto py-8 space-y-6 flex-1">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          {renderActionButtons()}
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="instruments">Instruments</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>
                  Your basic profile information visible to other band members
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled={true}
                      placeholder="Your email address"
                    />
                    <p className="text-sm text-muted-foreground">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instruments">
            <Card>
              <CardHeader>
                <CardTitle>Musical Instruments</CardTitle>
                <CardDescription>
                  Select the instruments you play to help bands find you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {availableInstruments.map((instrument) => (
                      <div
                        key={instrument.id}
                        className="flex items-center justify-between p-2 hover:bg-accent rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">{instrument.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {instrument.type}
                          </p>
                        </div>
                        <Switch
                          checked={profile.instruments.includes(instrument.id)}
                          onCheckedChange={() => toggleInstrument(instrument)}
                          disabled={!isEditing}
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Customize how you want to receive updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(profile.notificationPreferences).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Label>
                        <p className="text-sm text-muted-foreground">
                          {key === 'emailNotifications' && 'Receive updates via email'}
                          {key === 'practiceReminders' && 'Get reminded about upcoming practices'}
                          {key === 'newCollaborationRequests' && 'Notifications for new band invites'}
                          {key === 'messageNotifications' && 'Get notified about new messages'}
                        </p>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={() => toggleNotificationPreference(key as keyof typeof profile.notificationPreferences)}
                        disabled={!isEditing}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage; 