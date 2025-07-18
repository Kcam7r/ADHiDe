import React, { useState } from 'react';

interface MagnifierWrapperProps {
  children: React.ReactNode;
  zoomLevel?: number;
  className?: string;
}

export const MagnifierWrapper: React.FC<MagnifierWrapperProps> = ({ children, zoomLevel = 1.2, className }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="transition-transform duration-200 ease-out origin-top-left"
        style={{
          transform: isHovered ? `scale(${zoomLevel})` : 'scale(1)',
        }}
      >
        {children}
      </div>
    </div>
  );
};