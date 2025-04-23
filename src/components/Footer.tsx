import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import logoLight from '@/assets/logo_light.png';
import logoDark from '@/assets/logo_dark.png';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-rhythm-200/20 bg-red-50/80 dark:bg-red-950/20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img 
              src={theme === 'dark' ? logoDark : logoLight} 
              alt="RhythmSync Logo" 
              className="h-8 w-auto" 
            />
            <span className="text-xl font-bold">RhythmSync</span>
          </div>
          
          <nav className="flex gap-8 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>

          <div className="text-sm text-muted-foreground">
            &copy; {currentYear} RhythmSync. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 