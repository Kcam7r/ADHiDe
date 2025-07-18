import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { XpParticle } from './XpParticle';
import { useWindowSize } from '../hooks/useWindowSize';

interface PowerCrystalProps {
  onCrystalClick: () => void;
}

interface Bubble {
  id: string;
  left: number; // percentage
  sizeClass: 'bubble-small' | 'bubble-medium' | 'bubble-large';
  delay: number; // seconds
  duration: number; // seconds
}

export const PowerCrystal: React.FC<PowerCrystalProps> = React.memo(({ onCrystalClick }) => {
  const { user, lastXpGainTimestamp, xpParticles, removeXpParticle } = useApp();
  const [isHovered, setIsHovered] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [prevXp, setPrevXp] = useState(user.xp);
  const crystalRef = useRef<HTMLDivElement>(null);
  const { width, height } = useWindowSize();
  const [bubbles, setBubbles] = useState<Bubble[]>([]); // Stan dla bąbelków

  const [crystalCenter, setCrystalCenter] = useState(() => {
    if (typeof window !== 'undefined') {
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

    updateCrystalCenter();
    window.addEventListener('resize', updateCrystalCenter);

    return () => {
      window.removeEventListener('resize', updateCrystalCenter);
    };
  }, [width, height, user.level]);

  // Efekt dla animacji zdobywania XP (błysk)
  useEffect(() => {
    if (lastXpGainTimestamp > 0 && user.xp > prevXp) {
      setIsFlashing(true);
      const flashTimer = setTimeout(() => setIsFlashing(false), 500);
      return () => clearTimeout(flashTimer);
    }
    setPrevXp(user.xp);
  }, [lastXpGainTimestamp, user.xp, prevXp]);

  // Obliczenia dla wyświetlania XP i poziomu
  const xpForNextLevel = 1000; // Każdy poziom wymaga 1000 XP
  const xpInCurrentLevel = user.xp % xpForNextLevel;
  const xpProgress = xpInCurrentLevel / xpForNextLevel;

  // Efekt generowania bąbelków
  useEffect(() => {
    const addRandomBubble = () => {
      const sizeClasses: Bubble['sizeClass'][] = ['bubble-small', 'bubble-medium', 'bubble-large'];
      const randomSizeClass = sizeClasses[Math.floor(Math.random() * sizeClasses.length)];
      const randomLeft = Math.random() * 90 + 5; // 5% do 95% szerokości, aby uniknąć krawędzi
      const randomDelay = Math.random() * 2; // 0 do 2 sekund opóźnienia startu
      const randomDuration = Math.random() * 2 + 2; // 2 do 4 sekund czasu trwania animacji

      const newBubble: Bubble = {
        id: `${Date.now()}-${Math.random()}`, // Unikalne ID
        left: randomLeft,
        sizeClass: randomSizeClass,
        delay: randomDelay,
        duration: randomDuration,
      };

      setBubbles(prev => [...prev, newBubble]);

      // Usuń bąbelek po zakończeniu jego animacji
      setTimeout(() => {
        setBubbles(prev => prev.filter(b => b.id !== newBubble.id));
      }, (newBubble.duration + newBubble.delay) * 1000 + 100); // Konwertuj na ms, dodaj bufor
    };

    // Rozpocznij dodawanie bąbelków tylko, jeśli postęp XP jest większy niż 5%
    if (xpProgress > 0.05) { 
      // Zmniejszona częstotliwość: dodawaj bąbelek co 1 do 3 sekundy
      const interval = setInterval(addRandomBubble, 1000 + Math.random() * 2000);
      return () => clearInterval(interval);
    } else {
      setBubbles([]); // Wyczyść bąbelki, jeśli XP jest zbyt niskie
    }
  }, [xpProgress]); // Uruchom ponownie efekt, jeśli xpProgress się zmieni

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
            {/* Dynamically rendered bubbles */}
            {bubbles.map(bubble => (
              <div
                key={bubble.id}
                className={`bubble ${bubble.sizeClass}`}
                style={{
                  left: `${bubble.left}%`,
                  animationDelay: `${bubble.delay}s`,
                  animationDuration: `${bubble.duration}s`,
                }}
              ></div>
            ))}
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
});