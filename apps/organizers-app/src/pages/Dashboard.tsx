import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import Header from '../components/Header';
import { 
  Music2, 
  Calendar, 
  Users, 
  BarChart3, 
  Clock,
  Bell,
  Settings,
  CheckCircle2,
  AlertCircle,
  MapPin,
  LogOut
} from 'lucide-react';
import { toast } from 'sonner';

interface Stats {
  totalEvents: number;
  totalBands: number;
  totalUsers: number;
  upcomingEvents: number;
}

const Dashboard = () => {
  const { signOut, user, syncAuthState } = useAuth();
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0,
    totalBands: 0,
    totalUsers: 0,
    upcomingEvents: 0,
  });

  useEffect(() => {
    // Simulate loading stats
    const loadStats = async () => {
      // This would be an actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStats({
        totalEvents: 156,
        totalBands: 89,
        totalUsers: 342,
        upcomingEvents: 12,
      });
    };

    loadStats();
  }, []);

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

  const mockRecentActivity = [
    { id: 1, action: "Band 'Electric Dreams' confirmed for Summer Festival", time: "2 hours ago", type: "confirmation" },
    { id: 2, action: "New availability update from 'Jazz Collective'", time: "5 hours ago", type: "update" },
    { id: 3, action: "Venue 'Music Hall' updated capacity", time: "1 day ago", type: "venue" },
    { id: 4, action: "Schedule conflict resolved for Rock Night", time: "2 days ago", type: "conflict" },
  ];

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here's what's happening with your events.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <div className="text-sm text-muted-foreground">Events Organized</div>
          </div>

          <div className="bg-card p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm text-muted-foreground">Platform</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalBands}</div>
            <div className="text-sm text-muted-foreground">Available Bands</div>
          </div>

          <div className="bg-card p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-rhythm-100 dark:bg-rhythm-900 rounded-lg">
                <Clock className="h-6 w-6 text-rhythm-600 dark:text-rhythm-400" />
              </div>
              <span className="text-sm text-muted-foreground">This Month</span>
            </div>
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-muted-foreground">Upcoming Events</div>
          </div>

          <div className="bg-card p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-sm text-muted-foreground">Platform</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Upcoming Events */}
          <div className="bg-card rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Upcoming Events</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { name: "Summer Music Festival", date: "Dec 15, 2024", bands: 12, status: "confirmed" },
                  { name: "Jazz Night", date: "Dec 18, 2024", bands: 5, status: "planning" },
                  { name: "Rock Concert", date: "Dec 22, 2024", bands: 8, status: "confirmed" },
                ].map((event, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium">{event.name}</div>
                      <div className="text-sm text-muted-foreground">{event.date} • {event.bands} bands</div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event.status === 'confirmed' 
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                        : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                    }`}>
                      {event.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Recent Activity</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockRecentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`p-1 rounded-full mt-1 ${
                      activity.type === 'confirmation' ? 'bg-green-100 dark:bg-green-900' :
                      activity.type === 'update' ? 'bg-blue-100 dark:bg-blue-900' :
                      activity.type === 'venue' ? 'bg-rhythm-100 dark:bg-rhythm-900' :
                      'bg-orange-100 dark:bg-orange-900'
                    }`}>
                      {activity.type === 'confirmation' ? <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" /> :
                       activity.type === 'update' ? <Bell className="h-3 w-3 text-blue-600 dark:text-blue-400" /> :
                       activity.type === 'venue' ? <MapPin className="h-3 w-3 text-rhythm-600 dark:text-rhythm-400" /> :
                       <AlertCircle className="h-3 w-3 text-orange-600 dark:text-orange-400" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm">{activity.action}</div>
                      <div className="text-xs text-muted-foreground mt-1">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/scheduler">
              <Button 
                variant="outline" 
                className="w-full p-6 h-auto flex-col items-start space-y-3 bg-card hover:bg-accent"
              >
                <Clock className="h-8 w-8 text-rhythm-600 dark:text-rhythm-400" />
                <div className="text-left">
                  <div className="font-medium">Week Scheduler</div>
                  <div className="text-sm text-muted-foreground">Drag and drop bands across the week</div>
                </div>
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="p-6 h-auto flex-col items-start space-y-3 bg-card hover:bg-accent"
            >
              <Calendar className="h-8 w-8 text-rhythm-600 dark:text-rhythm-400" />
              <div className="text-left">
                <div className="font-medium">Schedule Event</div>
                <div className="text-sm text-muted-foreground">Create a new event and manage schedules</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="p-6 h-auto flex-col items-start space-y-3 bg-card hover:bg-accent"
            >
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div className="text-left">
                <div className="font-medium">Manage Bands</div>
                <div className="text-sm text-muted-foreground">View and organize band information</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="p-6 h-auto flex-col items-start space-y-3 bg-card hover:bg-accent"
            >
              <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div className="text-left">
                <div className="font-medium">View Analytics</div>
                <div className="text-sm text-muted-foreground">Track performance and insights</div>
              </div>
            </Button>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-card rounded-xl p-6 border">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-rhythm-100 dark:bg-rhythm-900 rounded-lg">
              <Settings className="h-6 w-6 text-rhythm-600 dark:text-rhythm-400" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">More Features Coming Soon!</h3>
              <p className="text-muted-foreground mb-4">
                We're actively developing advanced scheduling tools, band management features, 
                and comprehensive analytics. Stay tuned for updates as we build out the full 
                organizer experience.
              </p>
              <div className="text-sm text-rhythm-600 dark:text-rhythm-400 font-medium">
                Expected features: Band scheduling, Venue management, Financial tracking, Advanced analytics
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 