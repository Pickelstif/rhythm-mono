import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar,
  Bell,
  LogOut,
  Settings,
  Users,
  Music,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import Header from '../components/Header';

export function MobileDashboard() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  const quickLinks = [
    {
      title: 'Daily Schedule',
      description: 'View and edit today\'s events',
      icon: Calendar,
      href: '/daily',
      color: 'bg-blue-500'
    },
    {
      title: 'Notifications',
      description: 'View recent updates',
      icon: Bell,
      href: '/notifications',
      color: 'bg-green-500'
    }
  ];

  const statsCards = [
    {
      title: 'Today\'s Events',
      value: '3',
      description: 'Scheduled performances',
      icon: Music,
      color: 'text-blue-600'
    },
    {
      title: 'This Week',
      value: '12',
      description: 'Total events',
      icon: BarChart3,
      color: 'text-green-600'
    },
    {
      title: 'Active Bands',
      value: '8',
      description: 'Available bands',
      icon: Users,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header 
        rightContent={
          <>
            <Button variant="ghost" size="icon" aria-label="Settings">
              <Settings className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </>
        }
      />

      <div className="px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">
            Welcome back!
          </h1>
          <p className="text-muted-foreground">
            Manage your events and schedules on the go
          </p>
        </div>

        {/* Quick Links Section */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div className="grid gap-3">
            {quickLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                <Card className="transition-all duration-200 hover:shadow-md active:scale-95">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${link.color} text-white`}>
                          <link.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">{link.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {link.description}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Overview</h2>
          <div className="grid gap-3">
            {statsCards.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.description}</p>
                    </div>
                    <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">Jazz Collective scheduled for tonight</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">Rock Legends confirmed for Friday</p>
                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">New band registration pending</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Spacing for Mobile Gestures */}
        <div className="h-8"></div>
      </div>
    </div>
  );
} 