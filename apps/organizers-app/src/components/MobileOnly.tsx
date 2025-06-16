import React from 'react';
import { Link } from 'react-router-dom';
import { Monitor, Smartphone, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import logoLight from '../assets/logo_light.png';

export function MobileOnly() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-8 text-center space-y-6">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img 
              src={logoLight} 
              alt="RhythmSync" 
              className="h-12 w-auto object-contain"
            />
          </div>
          
          {/* Icon */}
          <div className="flex justify-center space-x-4 mb-6">
            <div className="p-3 bg-muted rounded-full">
              <Smartphone className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center">
              <div className="w-8 h-px bg-muted-foreground/30"></div>
            </div>
            <div className="p-3 bg-primary/10 rounded-full">
              <Monitor className="h-8 w-8 text-primary" />
            </div>
          </div>

          {/* Main Message */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-foreground">
              Desktop Experience Required
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              RhythmSync Organizers features a comprehensive scheduling interface designed for desktop use.
            </p>
          </div>

          {/* Call to Action */}
          <div className="space-y-4 pt-2">
            <p className="text-sm font-medium text-foreground">
              For the full experience, please access this application on a desktop or laptop computer.
            </p>
            
            {/* Mobile Alternative */}
            <div className="space-y-3">
              <Link to="/daily">
                <Button className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Daily Schedule
                </Button>
              </Link>
              
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                className="w-full"
              >
                Refresh Page
              </Button>
            </div>
          </div>

          {/* Footer Info */}
          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Need help? Contact your system administrator or visit our support page.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 