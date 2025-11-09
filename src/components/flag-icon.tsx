import React from 'react';
import { cn } from '@/lib/utils';

interface FlagIconProps {
  countryCode: 'us' | 'al';
  className?: string;
}

const FlagIcon: React.FC<FlagIconProps> = ({ countryCode, className }) => {
  // Increased size slightly for better visibility of text
  const baseClasses = "h-6 w-6 rounded-full border border-border shadow-sm text-xs font-bold flex items-center justify-center";

  // Using colors to represent the flags, and white text for contrast
  const flagStyles = {
    us: 'bg-blue-600 text-white', // US colors (Blue/White)
    al: 'bg-red-600 text-white', // Albanian colors (Red/White text for visibility)
  };
  
  const text = countryCode === 'us' ? 'EN' : 'SQ';

  return (
    <div className={cn(baseClasses, flagStyles[countryCode], className)}>
      {text}
    </div>
  );
};

export default FlagIcon;