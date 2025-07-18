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
  const crystalRef = useRef<HTMLDivElement>(null);
  const liquidRef = useRef<HTMLDivElement>(null); // Ref dla elementu płynu XP
  const bubbleIntervalRef = useRef<number | null>(null); // Ref dla ID interwału bąbelków
  const { width, height } = useWindowSize();

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
    if (xpProgress > 0) { // Generuj bąbelki tylko, jeśli jest jakiś postęp XP
      if (liquidRef.current && !bubbleIntervalRef.current) { // Uruchom interwał tylko, jeśli jeszcze nie działa
        bubbleIntervalRef.current = setInterval(() => {
          if (liquidRef.current) {
            const bubble = document.createElement('div');
            bubble.className = 'babel';

            const size = Math.random() * 6 + 2; // Rozmiar od 2px do 8px
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            bubble.style.left = `${Math.random() * 90 + 5}%`; // Pozycja pozioma od 5% do 95%

            const duration = Math.random() * 3 + 2; // Czas trwania animacji od 2s do 5s
            bubble.style.animationDuration = `${duration}s`;

            const driftX = Math.random() * 20 - 10; // Dryf poziomy od -10px do 10px
            const driftXEnd = Math.random() * 20 - 10; // Końcowy dryf poziomy od -10px do 10px
            
            // Wysokość, na jaką bąbelek ma się wznieść, równa aktualnej wysokości płynu
            const currentLiquidHeight = liquidRef.current.clientHeight;
            bubble.style.setProperty('--bubble-target-y', `-${currentLiquidHeight}px`);
            bubble.style.setProperty('--bubble-drift-x', `${driftX}px`);
            bubble.style.setProperty('--bubble-drift-x-end', `${driftXEnd}px`);

            liquidRef.current.appendChild(bubble);

            // Usuń bąbelek po zakończeniu animacji, aby uniknąć zaśmiecania DOM
            setTimeout(() => {
              bubble.remove();
            }, duration * 1000 + 50); // Dodatkowy bufor czasu
          }
        }, 500); // Generuj nowy bąbelek co 500ms
      }
    } else {
      // Jeśli brak postępu XP, wyczyść interwał i usuń wszystkie istniejące bąbelki
      if (bubbleIntervalRef.current) {
        clearInterval(bubbleIntervalRef.current);
        bubbleIntervalRef.current = null;
      }
      if (liquidRef.current) {
        liquidRef.current.querySelectorAll('.babel').forEach(b => b.remove());
      }
    }

    // Funkcja czyszcząca, aby zatrzymać interwał przy odmontowaniu komponentu
    return () => {
      if (bubbleIntervalRef.current) {
        clearInterval(bubbleIntervalRef.current);
        bubbleIntervalRef.current = null;
      }
    };
  }, [xpProgress]); // Efekt uruchamia się ponownie, gdy zmienia się xpProgress

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
            ref={liquidRef} // Dołącz ref do elementu płynu
          >
            {/* Bąbelki będą dynamicznie dodawane tutaj przez JavaScript */}
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