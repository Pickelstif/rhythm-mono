import React from 'react';
import logo from '@/assets/logo_dark.png';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <img src={logo} alt="RhythmSync Logo" className="h-10 w-auto mr-3" />
            <span className="text-2xl font-bold">RhythmSync</span>
          </div>
          <div className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} RhythmSync. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 