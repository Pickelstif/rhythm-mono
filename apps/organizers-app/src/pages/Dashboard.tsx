import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import Header from '../components/Header';
import { 
  Calendar, 
  Users, 
  BarChart3, 
  Clock,
  Bell,
  LogOut
} from 'lucide-react';

const Dashboard = () => {
  const { signOut, user, syncAuthState } = useAuth();
  const [signOutLoading, setSignOutLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setSignOutLoading(true);
      
      // First try to sync auth state to check if we're actually logged in
      await syncAuthState();
      
      // Then proceed with sign out
      await signOut();
    } catch (error) {
      console.error('Error during sign out:', error);
      // Don't show error toast since the sign out function already handles it
    } finally {
      setSignOutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        rightContent={
          <>
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              disabled={signOutLoading}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              {signOutLoading ? 'Signing Out...' : 'Sign Out'}
            </Button>
          </>
        }
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Event Organizer Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Manage your events and schedules with ease
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Link to="/scheduler" className="block">
            <div className="bg-card p-8 rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-200 hover:bg-accent/50">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-rhythm-100 dark:bg-rhythm-900 rounded-full">
                  <Clock className="h-10 w-10 text-rhythm-600 dark:text-rhythm-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Schedule Viewer</h3>
                  <p className="text-muted-foreground">
                    View and manage your event schedules with an interactive weekly calendar
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <div className="bg-card p-8 rounded-xl shadow-sm border opacity-60 cursor-not-allowed">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Calendar className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Event Management</h3>
                <p className="text-muted-foreground">
                  Create and manage your events, venues, and schedules
                </p>
                <p className="text-xs text-muted-foreground mt-2 italic">Coming Soon</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-8 rounded-xl shadow-sm border opacity-60 cursor-not-allowed">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-green-100 dark:bg-green-900 rounded-full">
                <Users className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Band Management</h3>
                <p className="text-muted-foreground">
                  Organize band information, availability, and bookings
                </p>
                <p className="text-xs text-muted-foreground mt-2 italic">Coming Soon</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-8 rounded-xl shadow-sm border opacity-60 cursor-not-allowed">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-orange-100 dark:bg-orange-900 rounded-full">
                <BarChart3 className="h-10 w-10 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Analytics</h3>
                <p className="text-muted-foreground">
                  Track event performance and gain insights into your organizing
                </p>
                <p className="text-xs text-muted-foreground mt-2 italic">Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 