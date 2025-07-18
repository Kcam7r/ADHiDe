import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { XpParticle } from './XpParticle';
import { useWindowSize } from '../hooks/useWindowSize';

interface PowerCrystalProps {
  onCrystalClick: () => void;
}

export const PowerCrystal: React.FC<PowerCrystalProps> = React.memo(({ onCrystalClick }) => {
  const { user, lastXpGainTimestamp, xpParticles, removeXpParticle } = useApp();
  const [isHovered, setIsHovered] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [prevXp, setPrevXp] = useState(user.xp);
  const crystalRef = useRef<HTMLDivElement>(null); // Ref for the actual crystal sphere
  const liquidRef = useRef<HTMLDivElement>(null); // Ref for the XP liquid element
  const bubbleIntervalRef = useRef<number | null>(null); // Ref for bubble interval ID
  const { width, height } = useWindowSize();

  const [crystalCenter, setCrystalCenter] = useState(() => {
    if (typeof window !== 'undefined') {
      // Initial estimate, will be updated by useLayoutEffect
      return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    }
    return { x: 0, y: 0 };
  });

  useLayoutEffect(() => {
    const updateCrystalCenter = () => {
      if (crystalRef.current) {
        const rect = crystalRef.current.getBoundingClientRect();
        setCrystalCenter({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }
    };

    // Update on mount and resize
    updateCrystalCenter();
    window.addEventListener('resize', updateCrystalCenter);

    return () => {
      window.removeEventListener('resize', updateCrystalCenter);
    };
  }, [width, height, user.level]); // Depend on width/height to re-calculate on resize

  // Effect for XP gain animation (flash)
  useEffect(() => {
    if (lastXpGainTimestamp > 0 && user.xp > prevXp) {
      setIsFlashing(true);
      const flashTimer = setTimeout(() => setIsFlashing(false), 500);
      return () => clearTimeout(flashTimer);
    }
    setPrevXp(user.xp);
  }, [lastXpGainTimestamp, user.xp, prevXp]);

  // Calculations for XP display and level
  const xpForNextLevel = 1000; // Each level requires 1000 XP
  const xpInCurrentLevel = user.xp % xpForNextLevel;
  const xpProgress = xpInCurrentLevel / xpForNextLevel;

  // Effect for generating bubbles
  useEffect(() => {
    if (xpProgress > 0) {
      if (liquidRef.current && !bubbleIntervalRef.current) {
        bubbleIntervalRef.current = setInterval(() => {
          if (liquidRef.current) {
            const bubble = document.createElement('div');
            bubble.className = 'babel';

            const size = Math.random() * 6 + 2;
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            bubble.style.left = `${Math.random() * 90 + 5}%`;

            const duration = Math.random() * 3 + 2;
            bubble.style.animationDuration = `${duration}s`;

            const driftX = Math.random() * 20 - 10;
            const driftXEnd = Math.random() * 20 - 10;
            
            const currentLiquidHeight = liquidRef.current.clientHeight;
            bubble.style.setProperty('--bubble-target-y', `-${currentLiquidHeight}px`);
            bubble.style.setProperty('--bubble-drift-x', `${driftX}px`);
            bubble.style.setProperty('--bubble-drift-x-end', `${driftXEnd}px`);

            liquidRef.current.appendChild(bubble);

            setTimeout(() => {
              bubble.remove();
            }, duration * 1000 + 50);
          }
        }, 500);
      }
    } else {
      if (bubbleIntervalRef.current) {
        clearInterval(bubbleIntervalRef.current);
        bubbleIntervalRef.current = null;
      }
      if (liquidRef.current) {
        liquidRef.current.querySelectorAll('.babel').forEach(b => b.remove());
      }
    }

    return () => {
      if (bubbleIntervalRef.current) {
        clearInterval(bubbleIntervalRef.current);
        bubbleIntervalRef.current = null;
      }
    };
  }, [xpProgress]);

  // Crystal color (can be customized based on level, but currently static)
  const currentCrystalColor = 'from-cyan-500 to-blue-600';

  return (
    <div
      className="relative flex flex-col items-center justify-center w-full cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onCrystalClick}
    >
      {/* Main container for the holder and the crystal */}
      {/* This div defines the overall size of the interactive element including the holder */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Holder image - positioned absolutely to cover this container */}
        <img src="/holder.png" alt="Crystal Holder" className="absolute inset-0 w-full h-full object-contain z-30" />

        {/* Crystal Sphere - scaled down and positioned within the holder's "hole" */}
        {/* The crystalRef is on this element to correctly calculate XP particle target */}
        <div
          ref={crystalRef}
          className={`relative w-24 h-24 rounded-full overflow-hidden shadow-lg transition-all duration-300
            bg-gradient-to-br ${currentCrystalColor}
            ${isFlashing ? 'animate-crystal-flash' : ''}
            z-20 /* Lower z-index than holder image */
            /* Adjust position to fit the holder's hole */
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 /* Center it */
          `}
          style={{
            boxShadow: 'inset 0 0 15px rgba(255,255,255,0.5), 0 0 20px rgba(0,0,0,0.5)',
            border: '2px solid rgba(255,255,255,0.2)'
          }}
        >
          {/* Metal casing (bottom half of the smaller sphere) */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-b from-stone-700 to-stone-900 rounded-b-full border-t-2 border-stone-600 shadow-inner-dark z-10">
          </div>
          {/* Liquid fill */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-500 to-yellow-400 transition-all duration-300 ease-out animate-liquid-wave"
            style={{
              height: `${xpProgress * 100}%`,
              boxShadow: '0 0 15px rgba(255,165,0,0.7)', // Orange glow
            }}
            ref={liquidRef} // Attach ref to liquid element
          >
            {/* Bubbles will be dynamically added here by JavaScript */}
          </div>
          {/* Level number */}
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <span className="text-white text-4xl font-bold drop-shadow-lg">
              {user.level}
            </span>
          </div>
        </div>
      </div>

      {/* XP info on hover */}
      <div
        className={`absolute -top-10 bg-gray-700 text-white text-sm px-3 py-1 rounded-md shadow-md transition-opacity duration-200 whitespace-nowrap ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        {xpInCurrentLevel}/{xpForNextLevel} XP
      </div>

      {/* XP particles animation */}
      {xpParticles.map(particle => (
        <XpParticle
          key={particle.id}
          startX={particle.startX}
          startY={particle.startY}
          targetX={crystalCenter.x}
          targetY={crystalCenter.y}
          onComplete={() => removeXpParticle(particle.id)}
        />
      ))}
    </div>
  );
});