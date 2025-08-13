import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = '', showTagline = true, size = 'md' }) => {
  const sizeClasses = {
    sm: { icon: 'w-8 h-8', text: 'text-lg', tagline: 'text-xs', location: 'text-xs' },
    md: { icon: 'w-12 h-12', text: 'text-2xl', tagline: 'text-xs', location: 'text-xs' },
    lg: { icon: 'w-16 h-16', text: 'text-3xl', tagline: 'text-sm', location: 'text-sm' }
  };

  const currentSize = sizeClasses[size];

  return (
    <Link to="/" className={`flex items-center space-x-3 ${className}`}>
      {/* Building Icon - Dark Grey */}
      <div className={`flex-shrink-0 ${currentSize.icon}`}>
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 48 48" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="text-gray-700"
        >
          {/* Main building structure - Dark grey */}
          <rect x="8" y="20" width="32" height="20" fill="currentColor" rx="2"/>
          
          {/* Roof - Dark grey outline */}
          <path d="M8 20L24 8L40 20" stroke="currentColor" strokeWidth="2" fill="none"/>
          
          {/* Garage door with windows - White with dark grey details */}
          <rect x="12" y="22" width="16" height="16" fill="white" rx="1"/>
          <rect x="14" y="24" width="3" height="3" fill="currentColor"/>
          <rect x="19" y="24" width="3" height="3" fill="currentColor"/>
          <rect x="24" y="24" width="3" height="3" fill="currentColor"/>
          <rect x="29" y="24" width="3" height="3" fill="currentColor"/>
          
          {/* Entry door - White with dark grey details */}
          <rect x="32" y="26" width="6" height="12" fill="white" rx="1"/>
          <rect x="34" y="28" width="2" height="2" fill="currentColor"/>
        </svg>
      </div>
      
      {/* Text Content - Matching the image layout */}
      <div className="flex flex-col">
        <div className="flex items-baseline">
          <span className={`font-bold text-gray-700 tracking-wide ${currentSize.text}`}>
            C. SCHMITT
          </span>
        </div>
        {showTagline && (
          <div className={`text-gray-600 font-medium leading-tight tracking-wider uppercase ${currentSize.tagline}`}>
            CUSTOM BUILD & RENOVATION
          </div>
        )}
        <div className={`text-gray-500 leading-tight tracking-wider uppercase ${currentSize.location}`}>
          AYLMER, ON
        </div>
      </div>
    </Link>
  );
};

export default Logo; 