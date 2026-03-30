'use client';

import React from 'react';
import Flag from 'react-flagpack';
import { cn } from '@/lib/utils';
import 'react-flagpack/dist/style.css';

interface FlagIconProps {
  countryCode: 'us' | 'al';
  className?: string;
  size?: 's' | 'm' | 'l';
}

const FlagIcon: React.FC<FlagIconProps> = ({ countryCode, className, size = 's' }) => {
  // Convert 2-letter codes to 3-letter codes as flagpack often prefers them
  const codeMap = {
    'al': 'ALB',
    'us': 'USA'
  };
  
  const code = codeMap[countryCode] || countryCode.toUpperCase();

  return (
    <div className={cn("inline-flex items-center", className)}>
      <Flag 
        code={code} 
        size={size}
        hasBorderRadius={true}
        className="rounded-sm shadow-sm"
      />
    </div>
  );
};

export default FlagIcon;