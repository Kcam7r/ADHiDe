import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';

interface PowerCrystalProps {
  onCrystalClick: () => void;
}

export const PowerCrystal: React.FC<PowerCrystalProps> = ({ onCrystalClick }) => {
  const { user, lastXpGainTimestamp } = useApp();
  const [isHovered, setIsHovered] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [showXpParticle, setShowXpParticle] = useState(false);
  const [prevXp, setPrevXp] = useState(user.xp); // State to track previous XP for threshold detection

  const xpForNextLevel = 1000; // XP needed for next level
  const xpInCurrentLevel = user.xp % xpForNextLevel;
  const xpProgress = xpInCurrentLevel / xpForNextLevel; // Progress within current level (0 to 1)

  // Determine which small orbs should be lit
  const litOrbs = Math.floor(xpProgress * 4); // 0, 1, 2, 3 or 4

  // Define crystal colors based on level
  const getCrystalColor = (level: number) => {
    if (level >= 15) return 'from-yellow-400 to-amber-600'; // Gold
    if (level >= 10) return 'from-purple-500 to-indigo-600'; // Purple
    if (level >= 5) return 'from-green-400 to-emerald-600'; // Green
    return 'from-cyan-500 to-blue-600'; // Default Blue
  };

  const currentCrystalColor = getCrystalColor(user.level);

  // Effect for XP gain animation (flash and particle)
  useEffect(() => {
    if (lastXpGainTimestamp > 0 && user.xp > prevXp) { // Only animate if XP actually increased
      setIsFlashing(true);
      setShowXpParticle(true);

      const flashTimer = setTimeout(() => setIsFlashing(false), 500);
      const particleTimer = setTimeout(() => setShowXpParticle(false), 800);

      return () => {
        clearTimeout(flashTimer);
        clearTimeout(particleTimer);
      };
    }
    setPrevXp(user.xp); // Update previous XP for next comparison
  }, [lastXpGainTimestamp, user.xp]); // Depend on user.xp to catch level ups and XP changes

  return (
    <div
      className="relative flex flex-col items-center justify-center w-full cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onCrystalClick}
    >
      {/* Main Orb Container */}
      <div className="relative w-32 h-32 rounded-full flex items-center justify-center">
        {/* Metallic Casing (bottom half) */}
        <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-b from-gray-700 to-gray-900 rounded-b-full border-t border-gray-600 shadow-inner-dark z-10">
          {/* Decorative elements on casing */}
          <div className="absolute top-0 left-0 right-0 h-1 border-t border-gray-500 opacity-50"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1 border-b border-gray-500 opacity-50"></div>
        </div>

        {/* Crystal Orb */}
        <div
          className={`relative w-full h-full rounded-full overflow-hidden shadow-lg transition-all duration-300
            bg-gradient-to-br ${currentCrystalColor}
            ${isFlashing ? 'animate-crystal-flash' : ''}
            z-20
          `}
          style={{
            boxShadow: 'inset 0 0 15px rgba(255,255,255,0.5), 0 0 20px rgba(0,0,0,0.5)',
            border: '2px solid rgba(255,255,255,0.2)'
          }}
        >
          {/* Liquid energy fill */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-500 to-yellow-400 transition-all duration-300 ease-out animate-liquid-wave"
            style={{
              height: `${xpProgress * 100}%`,
              boxShadow: '0 0 15px rgba(255,165,0,0.7)', // Orange glow
            }}
          />
          {/* Level number */}
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <span className="text-white text-4xl font-bold drop-shadow-lg">
              {user.level}
            </span>
          </div>
        </div>
      </div>

      {/* Four Stage Progress Orbs */}
      <div className="flex mt-4 space-x-2 z-30">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={`w-4 h-4 rounded-full border border-gray-600 transition-all duration-300 ${
              index < litOrbs ? 'bg-amber-500 shadow-amber animate-small-orb-light-up' : 'bg-gray-700'
            }`}
          />
        ))}
      </div>

      {/* XP Info on hover */}
      <div
        className={`absolute -top-10 bg-gray-700 text-white text-sm px-3 py-1 rounded-md shadow-md transition-opacity duration-200 whitespace-nowrap ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        {xpInCurrentLevel}/{xpForNextLevel} XP
      </div>

      {/* XP Particle animation (simplified streak from bottom to crystal) */}
      {showXpParticle && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-yellow-400 rounded-full opacity-0 animate-xp-streak z-50" />
      )}
    </div>
  );
};