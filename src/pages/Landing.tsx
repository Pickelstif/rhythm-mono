import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import {
  Calendar,
  Music2,
  Users,
  CheckCircle2,
  ArrowRight,
  CalendarCheck,
  ListMusic,
  Bell,
  Zap
} from 'lucide-react';
import logoLight from '@/assets/logo_light.png';
import logoDark from '@/assets/logo_dark.png';

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
        <div className="mb-4 inline-block p-2 bg-rhythm-100 dark:bg-rhythm-900 rounded-lg text-rhythm-600 dark:text-rhythm-400">
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
      <div className="flex-1 w-full max-w-xl">
        {/* Demo UI will be different based on the feature */}
        {title.includes('Availability') ? (
          <div className="bg-card rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-xl">Band Availability</h3>
              <span className="text-sm text-muted-foreground">November 2024</span>
            </div>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              {Array.from({ length: 35 }).map((_, i) => {
                const date = i + 1;
                const isAvailable = [4, 11, 18, 25].includes(date);
                const isPartial = [8, 15, 22, 29].includes(date);
                return (
                  <div
                    key={i}
                    className={`h-12 rounded-lg flex items-center justify-center text-sm font-medium transition-colors
                      ${isAvailable ? 'bg-rhythm-500 text-white' : 
                        isPartial ? 'bg-rhythm-200 dark:bg-rhythm-800' : 
                        'bg-muted'}`}
                  >
                    {date <= 30 ? date : ''}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rhythm-500" />
                <span>Everyone Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rhythm-200 dark:bg-rhythm-800" />
                <span>Partial Availability</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-xl">Setlist Manager</h3>
              <span className="text-sm text-muted-foreground">Next Gig: Dec 15</span>
            </div>
            <div className="space-y-3">
              {[
                { name: "Sweet Home Alabama", duration: "4:41", status: "ready" },
                { name: "Hotel California", duration: "6:30", status: "learning" },
                { name: "Stairway to Heaven", duration: "8:02", status: "ready" },
                { name: "Sweet Child O' Mine", duration: "5:56", status: "ready" },
              ].map((song, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Music2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{song.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{song.duration}</span>
                    <CheckCircle2 className={`h-4 w-4 ${song.status === 'ready' ? 'text-green-500' : 'text-yellow-500'}`} />
                  </div>
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
  <div className="rounded-xl border bg-card p-6">
    <div className="mb-4 inline-block p-2 bg-rhythm-100 dark:bg-rhythm-900 rounded-lg text-rhythm-600 dark:text-rhythm-400">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const Landing = () => {
  const { user } = useAuth();
  const { theme } = useTheme();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={theme === 'dark' ? logoDark : logoLight}
              alt="RhythmSync Logo"
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold">RhythmSync</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-rhythm-600 to-rhythm-800 dark:from-rhythm-400 dark:to-rhythm-600">
            Keep Your Band in Perfect Harmony
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Streamline your band's scheduling and setlist management with RhythmSync. 
            The all-in-one platform for modern musicians.
          </p>
          <div className="flex justify-center">
            <Link to="/auth">
              <Button size="lg" className="rhythm-gradient text-white">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Main Features */}
        <section className="container mx-auto px-4">
          <FeatureHighlight
            icon={<CalendarCheck className="h-6 w-6" />}
            title="Smart Availability Management"
            description="Automatically find the perfect rehearsal times by comparing everyone's schedules. No more back-and-forth messages trying to coordinate."
          />
          <FeatureHighlight
            icon={<ListMusic className="h-6 w-6" />}
            title="Intelligent Setlist Organization"
            description="Manage your band's repertoire, track song progress, and create perfect setlists for every gig. Keep everyone on the same page."
            isReversed
          />
        </section>

        {/* Additional Features Grid */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Feature
              icon={<Bell className="h-5 w-5" />}
              title="Smart Notifications"
              description="Get instant updates about schedule changes, new events, and important reminders."
            />
            <Feature
              icon={<Users className="h-5 w-5" />}
              title="Multi-Band Support"
              description="Manage multiple bands with separate schedules and setlists all in one place."
            />
            <Feature
              icon={<Zap className="h-5 w-5" />}
              title="Quick Setup"
              description="Import your existing calendars and get started in minutes."
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-3xl mx-auto bg-card rounded-xl p-8 border shadow-lg">
            <h2 className="text-3xl font-bold mb-4">Ready to Sync Your Band?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of musicians who are already using RhythmSync to streamline their band management.
            </p>
            <Link to="/auth">
              <Button size="lg" className="rhythm-gradient text-white">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
