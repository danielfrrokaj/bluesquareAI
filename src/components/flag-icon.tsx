import React from 'react';
import { cn } from '@/lib/utils';
import { Globe } from 'lucide-react';

interface FlagIconProps {
  countryCode: 'us' | 'al';
  className?: string;
}

const FlagIcon: React.FC<FlagIconProps> = ({ countryCode, className }) => {
  const baseClasses = "h-5 w-5 rounded-full border border-border shadow-sm";

  // Note: Since Lucide-React does not provide flag icons, we use a combination of
  // Tailwind background colors and a generic icon (Globe) for a placeholder/visual cue.
  // For a real application, you would use a dedicated flag icon library or SVG assets.
  
  const flagStyles = {
    us: 'bg-blue-600 text-white flex items-center justify-center', // Represents US flag colors
    al: 'bg-red-600 text-black flex items-center justify-center', // Represents Albanian flag colors
  };

  return (
    <div className={cn(baseClasses, flagStyles[countryCode], className)}>
      <Globe className="h-3 w-3" />
    </div>
  );
};

export default FlagIcon;