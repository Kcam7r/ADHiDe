import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';

export const PowerCrystal: React.FC = () => {
  const { user, lastXpGainTimestamp } = useApp();
  const [isHovered, setIsHovered] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [showParticle, setShowParticle] = useState(false);

  const xpProgress = (user.xp % 1000) / 1000; // Progress within current level (0 to 1)

  // Define crystal colors based on level
  const getCrystalColor = (level: number) => {
    if (level >= 15) return 'bg-gradient-to-br from-yellow-400 to-amber-600'; // Gold
    if (level >= 10) return 'bg-gradient-to-br from-purple-500 to-indigo-600'; // Purple
    if (level >= 5) return 'bg-gradient-to-br from-green-400 to-emerald-600'; // Green
    return 'bg-gradient-to-br from-cyan-500 to-blue-600'; // Default Blue
  };

  const currentCrystalColor = getCrystalColor(user.level);

  useEffect(() => {
    if (lastXpGainTimestamp > 0) {
      setIsFlashing(true);
      setShowParticle(true); // Show particle animation
      const flashTimer = setTimeout(() => setIsFlashing(false), 500); // Flash duration
      const particleTimer = setTimeout(() => setShowParticle(false), 800); // Particle animation duration
      return () => {
        clearTimeout(flashTimer);
        clearTimeout(particleTimer);
      };
    }
  }, [lastXpGainTimestamp]);

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`relative w-24 h-24 transform rotate-45 overflow-hidden rounded-lg shadow-lg transition-all duration-300 ${currentCrystalColor} ${isFlashing ? 'animate-crystal-flash' : ''}`}
        style={{
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', // Diamond shape
        }}
      >
        {/* Liquid energy fill */}
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-300 ease-out"
          style={{
            height: `${xpProgress * 100}%`,
            background: 'rgba(255,255,255,0.3)', // Semi-transparent white for liquid effect
            backdropFilter: 'blur(2px)', // Subtle blur for liquid
          }}
        />
        {/* Level number */}
        <div className="absolute inset-0 flex items-center justify-center transform -rotate-45">
          <span className="text-white text-3xl font-bold drop-shadow-lg">
            {user.level}
          </span>
        </div>
      </div>

      {/* XP Info on hover */}
      <div
        className={`absolute -top-10 bg-gray-700 text-white text-sm px-3 py-1 rounded-md shadow-md transition-opacity duration-200 whitespace-nowrap ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        {user.xp % 1000}/{1000} XP
      </div>

      {/* Particle animation (simplified burst from crystal) */}
      {showParticle && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 bg-white rounded-full opacity-0 animate-xp-particle" />
        </div>
      )}
    </div>
  );
};