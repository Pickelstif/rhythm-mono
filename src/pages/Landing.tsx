import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Upload, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import logo from '@/assets/logo_dark.png';
import Footer from '@/components/Footer';

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string 
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="h-12 w-12 bg-rhythm-100 rounded-full flex items-center justify-center mb-4 text-rhythm-600">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const Landing = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-rhythm-600 to-rhythm-800 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <nav className="flex justify-between items-center mb-16">
            <div className="flex items-center">
              <img src={logo} alt="RhythmSync Logo" className="h-16 w-auto mr-4" />
              <span className="text-4xl font-bold">RhythmSync</span>
            </div>
            <div>
              {user ? (
                <Link to="/dashboard">
                  <Button variant="secondary">Go to Dashboard</Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button variant="secondary">Sign In</Button>
                </Link>
              )}
            </div>
          </nav>

          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Simplify Band Scheduling 
              </h1>
              <p className="text-xl mb-8">
                Keep your band in sync with smart scheduling tools that compare everyone's availability and find the perfect rehearsal times.
              </p>
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" variant="secondary">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button size="lg" variant="secondary">
                    Get Started
                  </Button>
                </Link>
              )}
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="w-full max-w-md bg-white/10 backdrop-blur-sm p-4 rounded-lg shadow-lg">
                <div className="bg-white/90 rounded-md p-3">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Jazz Ensemble</h3>
                    <span className="text-sm text-rhythm-800">Next: Thu 8pm</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-3">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day) => (
                      <div key={day} className="text-center text-xs font-medium text-gray-500">
                        {day}
                      </div>
                    ))}
                    {Array.from({ length: 28 }).map((_, i) => {
                      const date = i + 1;
                      // Mock availability data - showing some dates as fully available, some partially
                      const isFullyAvailable = [4, 11, 18, 25].includes(date);
                      const isPartiallyAvailable = [3, 10, 17, 24].includes(date);
                      
                      return (
                        <div 
                          key={date} 
                          className={`h-8 rounded-sm flex items-center justify-center text-xs
                            ${isFullyAvailable ? 'bg-rhythm-500 text-white' : 
                              isPartiallyAvailable ? 'bg-rhythm-200' : 'bg-gray-100'}`}
                        >
                          {date}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="h-2 w-2 rounded-full bg-rhythm-500"></div>
                      <span>Full band available</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="h-2 w-2 rounded-full bg-rhythm-200"></div>
                      <span>Partial availability</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard 
            icon={<Calendar className="h-6 w-6" />}
            title="Smart Scheduling"
            description="Automatically find dates and times when all band members are available."
          />
          <FeatureCard 
            icon={<Upload className="h-6 w-6" />}
            title="Import Calendars"
            description="Upload ICS files or PDF work rosters to sync your existing schedules."
          />
          <FeatureCard 
            icon={<Users className="h-6 w-6" />}
            title="Multiple Bands"
            description="Manage different bands with separate schedules and members all in one place."
          />
          <FeatureCard 
            icon={<Zap className="h-6 w-6" />}
            title="Instant Notifications"
            description="Get notified instantly about new events, schedule changes, and reminders."
          />
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="max-w-3xl mx-auto">
            <ol className="relative border-l border-gray-200 ml-3">
              <li className="mb-10 ml-6">
                <span className="absolute flex items-center justify-center w-8 h-8 bg-rhythm-600 rounded-full -left-4 ring-4 ring-white text-white">1</span>
                <h3 className="font-semibold text-lg mb-1">Create your band profile</h3>
                <p className="text-gray-600">Set up your band information and invite members to join.</p>
              </li>
              <li className="mb-10 ml-6">
                <span className="absolute flex items-center justify-center w-8 h-8 bg-rhythm-600 rounded-full -left-4 ring-4 ring-white text-white">2</span>
                <h3 className="font-semibold text-lg mb-1">Input availability</h3>
                <p className="text-gray-600">Members can upload their schedules or manually select available dates.</p>
              </li>
              <li className="mb-10 ml-6">
                <span className="absolute flex items-center justify-center w-8 h-8 bg-rhythm-600 rounded-full -left-4 ring-4 ring-white text-white">3</span>
                <h3 className="font-semibold text-lg mb-1">Find optimal rehearsal times</h3>
                <p className="text-gray-600">RhythmSync automatically calculates the best times when everyone is available.</p>
              </li>
              <li className="ml-6">
                <span className="absolute flex items-center justify-center w-8 h-8 bg-rhythm-600 rounded-full -left-4 ring-4 ring-white text-white">4</span>
                <h3 className="font-semibold text-lg mb-1">Schedule and notify</h3>
                <p className="text-gray-600">Set events and send automatic notifications to all band members.</p>
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Your Band in Sync?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Join thousands of musicians who are simplifying their band scheduling with RhythmSync.
        </p>
        {user ? (
          <Link to="/dashboard">
            <Button size="lg">Go to Dashboard</Button>
          </Link>
        ) : (
          <Link to="/auth">
            <Button size="lg">Create Free Account</Button>
          </Link>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Landing;
