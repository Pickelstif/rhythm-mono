import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import Header from '../components/Header';
import {
  Calendar,
  Users,
  Clock,
  BarChart3,
  MapPin,
  Settings,
  Zap,
  ArrowRight,
  CheckCircle2,
  Music2,
  Star
} from 'lucide-react';

const FeatureHighlight = ({
  icon,
  title,
  description,
  isReversed = false
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  isReversed?: boolean;
}) => {
  return (
    <div className={`flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 items-center py-16`}>
      <div className="flex-1">
        <div className="mb-4 inline-block p-3 bg-rhythm-100 dark:bg-rhythm-900 rounded-xl text-rhythm-600 dark:text-rhythm-400">
          {icon}
        </div>
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <p className="text-lg text-muted-foreground mb-6">{description}</p>
        <Link to="/auth">
          <Button>
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
      
      <div className="flex-1">
        {title.includes('Schedule') ? (
          <div className="bg-card rounded-xl shadow-lg p-6 border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-xl">Daily Schedule</h3>
              <span className="text-sm text-muted-foreground">December 15, 2024</span>
            </div>
            <div className="space-y-4">
              {[
                { time: '2:00 PM', band: 'The Electric Dreams', stage: 'Main Stage', status: 'confirmed' },
                { time: '3:30 PM', band: 'Jazz Fusion Collective', stage: 'Side Stage', status: 'confirmed' },
                { time: '5:00 PM', band: 'Rock Revival', stage: 'Main Stage', status: 'pending' },
                { time: '6:30 PM', band: 'Acoustic Souls', stage: 'Side Stage', status: 'confirmed' },
              ].map((slot, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-rhythm-600 dark:text-rhythm-400 font-semibold text-sm">{slot.time}</div>
                    <div>
                      <div className="font-medium">{slot.band}</div>
                      <div className="text-sm text-muted-foreground">{slot.stage}</div>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    slot.status === 'confirmed' 
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                      : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                  }`}>
                    {slot.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : title.includes('Analytics') ? (
          <div className="bg-card rounded-xl shadow-lg p-6 border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-xl">Event Analytics</h3>
              <span className="text-sm text-muted-foreground">This Month</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">24</div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Events Scheduled</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">89</div>
                <div className="text-sm text-green-700 dark:text-green-300">Bands Booked</div>
              </div>
              <div className="text-center p-4 bg-rhythm-50 dark:bg-rhythm-950 rounded-lg">
                <div className="text-2xl font-bold text-rhythm-600 dark:text-rhythm-400">96%</div>
                <div className="text-sm text-rhythm-700 dark:text-rhythm-300">Attendance Rate</div>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">4.8</div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Avg Rating</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Main Stage Utilization</span>
                <span>85%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-rhythm-600 dark:bg-rhythm-400 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-xl shadow-lg p-6 border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-xl">Band Availability</h3>
              <span className="text-sm text-muted-foreground">December 2024</span>
            </div>
            <div className="space-y-3">
              {[
                { name: 'The Electric Dreams', availability: '15 Dec', status: 'available' },
                { name: 'Jazz Fusion Collective', availability: '15-16 Dec', status: 'available' },
                { name: 'Rock Revival', availability: 'Checking...', status: 'pending' },
                { name: 'Acoustic Souls', availability: '16 Dec only', status: 'partial' },
              ].map((band, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Music2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{band.name}</div>
                      <div className="text-sm text-muted-foreground">{band.availability}</div>
                    </div>
                  </div>
                  <CheckCircle2 className={`h-4 w-4 ${
                    band.status === 'available' ? 'text-green-500' : 
                    band.status === 'partial' ? 'text-yellow-500' : 'text-muted-foreground'
                  }`} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Feature = ({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="mb-4 inline-block p-2 bg-rhythm-100 dark:bg-rhythm-900 rounded-lg text-rhythm-600 dark:text-rhythm-400">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const Landing = () => {
  const { user, isOrganizer } = useAuth();

  if (user && isOrganizer) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        rightContent={
          <Link to="/auth">
            <Button>
              Sign In
            </Button>
          </Link>
        }
      />

      {/* Hero Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Orchestrate Perfect
              <span className="text-rhythm-600 dark:text-rhythm-400"> Musical Events</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              The comprehensive platform for event organizers to schedule bands, manage venues, 
              and create unforgettable musical experiences. Streamline your event management 
              with powerful tools designed for music professionals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg">
                  Start Organizing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="#features">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Highlights */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <FeatureHighlight
            icon={<Calendar className="h-8 w-8" />}
            title="Smart Schedule Management"
            description="Effortlessly coordinate band schedules, venue availability, and event logistics in one unified platform. Real-time updates keep everyone synchronized and conflicts minimized."
          />
          <FeatureHighlight
            icon={<BarChart3 className="h-8 w-8" />}
            title="Comprehensive Analytics"
            description="Track event performance, band popularity, and audience engagement with detailed analytics. Make data-driven decisions to optimize your events and maximize success."
            isReversed
          />
          <FeatureHighlight
            icon={<Users className="h-8 w-8" />}
            title="Band Availability Tracking"
            description="See which bands are available when you need them. Our integrated system shows real-time availability from the RhythmSync band platform, making booking seamless."
          />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Everything You Need to Organize
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed specifically for music event organizers
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Feature
              icon={<Clock className="h-6 w-6" />}
              title="Time Slot Management"
              description="Create flexible time slots, manage stage schedules, and handle last-minute changes with ease."
            />
            <Feature
              icon={<MapPin className="h-6 w-6" />}
              title="Multi-Venue Support"
              description="Manage multiple venues and stages simultaneously with our comprehensive venue management system."
            />
            <Feature
              icon={<Zap className="h-6 w-6" />}
              title="Real-Time Sync"
              description="Stay connected with bands and venues through real-time updates and instant notifications."
            />
            <Feature
              icon={<Settings className="h-6 w-6" />}
              title="Custom Workflows"
              description="Configure booking workflows, approval processes, and automated communications to match your needs."
            />
            <Feature
              icon={<Star className="h-6 w-6" />}
              title="Quality Assurance"
              description="Track band performance, collect feedback, and maintain high-quality event standards."
            />
            <Feature
              icon={<BarChart3 className="h-6 w-6" />}
              title="Financial Tracking"
              description="Monitor budgets, track payments, and manage financial aspects of your events seamlessly."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-rhythm-600 dark:bg-rhythm-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Event Management?
          </h2>
          <p className="text-xl text-rhythm-100 mb-8 max-w-2xl mx-auto">
            Join the platform that's revolutionizing how music events are organized. 
            Start creating memorable experiences today.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <span className="text-xl font-bold">RhythmSync Organizers</span>
            </div>
            <div className="text-muted-foreground">
              © 2024 RhythmSync. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing; 