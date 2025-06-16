import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import Header from '../components/Header';
import { useIsMobile } from '../hooks/useIsMobile';
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
  const isMobile = useIsMobile();

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

  // Use different links based on device type
  const scheduleLink = isMobile ? '/daily' : '/scheduler';
  const scheduleTitle = isMobile ? 'Daily Schedule' : 'Schedule Viewer';
  const scheduleDescription = isMobile 
    ? 'View and manage today\'s events and schedules'
    : 'View and manage your event schedules with an interactive weekly calendar';

  return (
    <div className="min-h-screen bg-background">
      <Header 
        rightContent={
          <>
            <Button variant="ghost" size="icon" aria-label="Notifications" className="h-9 w-9 sm:h-10 sm:w-10">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              disabled={signOutLoading}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 h-9 sm:h-10 text-sm"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{signOutLoading ? 'Signing Out...' : 'Sign Out'}</span>
            </Button>
          </>
        }
      />

      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-8 sm:mb-12 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">Event Organizer Dashboard</h1>
          <p className="text-muted-foreground text-base sm:text-lg px-2">
            Manage your events and schedules with ease
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
          <Link to={scheduleLink} className="block">
            <div className="bg-card p-6 sm:p-8 rounded-xl shadow-sm border hover:shadow-md transition-all duration-200 hover:bg-accent/50 active:scale-[0.98] min-h-[160px] sm:min-h-[200px]">
              <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4 h-full justify-center">
                <div className="p-3 sm:p-4 bg-rhythm-100 dark:bg-rhythm-900 rounded-full">
                  <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-rhythm-600 dark:text-rhythm-400" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">{scheduleTitle}</h3>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                    {scheduleDescription}
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <div className="bg-card p-6 sm:p-8 rounded-xl shadow-sm border opacity-60 cursor-not-allowed min-h-[160px] sm:min-h-[200px]">
            <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4 h-full justify-center">
              <div className="p-3 sm:p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Event Management</h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  Create and manage your events, venues, and schedules
                </p>
                <p className="text-xs text-muted-foreground mt-1 sm:mt-2 italic">Coming Soon</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 sm:p-8 rounded-xl shadow-sm border opacity-60 cursor-not-allowed min-h-[160px] sm:min-h-[200px]">
            <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4 h-full justify-center">
              <div className="p-3 sm:p-4 bg-green-100 dark:bg-green-900 rounded-full">
                <Users className="h-8 w-8 sm:h-10 sm:w-10 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Band Management</h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  Organize band information, availability, and bookings
                </p>
                <p className="text-xs text-muted-foreground mt-1 sm:mt-2 italic">Coming Soon</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 sm:p-8 rounded-xl shadow-sm border opacity-60 cursor-not-allowed min-h-[160px] sm:min-h-[200px]">
            <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4 h-full justify-center">
              <div className="p-3 sm:p-4 bg-orange-100 dark:bg-orange-900 rounded-full">
                <BarChart3 className="h-8 w-8 sm:h-10 sm:w-10 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Analytics</h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  Track event performance and gain insights into your organizing
                </p>
                <p className="text-xs text-muted-foreground mt-1 sm:mt-2 italic">Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 