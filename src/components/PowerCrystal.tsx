import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { XpParticle } from './XpParticle';
import { useWindowSize } from '../hooks/useWindowSize';

interface PowerCrystalProps {
  onCrystalClick: () => void;
}

export const PowerCrystal: React.FC<PowerCrystalProps> = ({ onCrystalClick }) => {
  const { user, lastXpGainTimestamp, xpParticles, removeXpParticle } = useApp();
  const [isHovered, setIsHovered] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [prevXp, setPrevXp] = useState(user.xp);
  const crystalRef = useRef<HTMLDivElement>(null);
  const { width, height } = useWindowSize();

  // Initialize crystalCenter with approximate screen center, or 0,0 if window not available
  const [crystalCenter, setCrystalCenter] = useState(() => {
    if (typeof window !== 'undefined') {
      return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    }
    return { x: 0, y: 0 };
  });

  // Use useLayoutEffect to ensure crystalCenter is calculated immediately after DOM updates
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

    updateCrystalCenter(); // Calculate initial position
    window.addEventListener('resize', updateCrystalCenter); // Update on window resize

    return () => {
      window.removeEventListener('resize', updateCrystalCenter);
    };
  }, [width, height, user.level]); // Depend on width/height and user.level for recalculation

  // Efekt dla animacji zdobywania XP (błysk)
  useEffect(() => {
    if (lastXpGainTimestamp > 0 && user.xp > prevXp) {
      setIsFlashing(true);
      const flashTimer = setTimeout(() => setIsFlashing(false), 500);
      return () => clearTimeout(flashTimer);
    }
    setPrevXp(user.xp);
  }, [lastXpGainTimestamp, user.xp]);

  // Obliczenia dla wyświetlania XP i poziomu
  const xpForNextLevel = 1000; // Każdy poziom wymaga 1000 XP
  const xpInCurrentLevel = user.xp % xpForNextLevel;
  const xpProgress = xpInCurrentLevel / xpForNextLevel;

  // Kolor kryształu (można dostosować w zależności od poziomu, ale na razie stały)
  const currentCrystalColor = 'from-cyan-500 to-blue-600';

  return (
    <div
      className="relative flex flex-col items-center justify-center w-full cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onCrystalClick}
    >
      {/* Główny kontener kuli */}
      <div className="relative w-32 h-32 rounded-full flex items-center justify-center">
        {/* Metalowa obudowa (dolna połowa) */}
        <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-b from-stone-700 to-stone-900 rounded-b-full border-t-2 border-stone-600 shadow-inner-dark z-10">
        </div>

        {/* Kula Kryształu */}
        <div
          ref={crystalRef} // Dołącz ref tutaj
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
          {/* Wypełnienie energią (liquid) */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-500 to-yellow-400 transition-all duration-300 ease-out animate-liquid-wave"
            style={{
              height: `${xpProgress * 100}%`,
              boxShadow: '0 0 15px rgba(255,165,0,0.7)', // Pomarańczowy blask
            }}
          >
            {/* Bubbles inside the liquid */}
            <div className="bubble bubble-small" style={{ bottom: '0%', left: '20%', animationDelay: '0s' }}></div>
            <div className="bubble bubble-medium" style={{ bottom: '0%', left: '50%', animationDelay: '1s' }}></div>
            <div className="bubble bubble-large" style={{ bottom: '0%', left: '80%', animationDelay: '2s' }}></div>
            <div className="bubble bubble-small" style={{ bottom: '0%', left: '35%', animationDelay: '0.5s' }}></div>
            <div className="bubble bubble-medium" style={{ bottom: '0%', left: '65%', animationDelay: '1.5s' }}></div>
          </div>
          {/* Numer poziomu */}
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <span className="text-white text-4xl font-bold drop-shadow-lg">
              {user.level}
            </span>
          </div>
        </div>
      </div>

      {/* Informacje o XP po najechaniu myszą */}
      <div
        className={`absolute -top-10 bg-gray-700 text-white text-sm px-3 py-1 rounded-md shadow-md transition-opacity duration-200 whitespace-nowrap ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        {xpInCurrentLevel}/{xpForNextLevel} XP
      </div>

      {/* Animacja kulek XP */}
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
};