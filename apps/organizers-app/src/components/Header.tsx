import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import logoLight from '../assets/logo_light.png';
import logoDark from '../assets/logo_dark.png';

interface HeaderProps {
  rightContent?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ rightContent }) => {
  const { theme } = useTheme();
  const currentLogo = theme === 'dark' ? logoDark : logoLight;

  return (
    <nav className="border-b bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={currentLogo} alt="RhythmSync Logo" className="w-8 h-8 object-contain" />
          <span className="text-xl font-bold">RhythmSync</span>
          <span className="text-rhythm-600 dark:text-rhythm-400 font-semibold">Organizers</span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {rightContent}
        </div>
      </div>
    </nav>
  );
};

export default Header; 