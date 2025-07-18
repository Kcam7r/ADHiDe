import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { XpParticle } from './XpParticle';
import { useWindowSize } from '../hooks/useWindowSize';
// Usunięto importy Edit i Check, ponieważ tryb edycji jest usuwany
import { useLocalStorage } from '../hooks/useLocalStorage';

interface PowerCrystalProps {
  onCrystalClick: () => void;
}

export const PowerCrystal: React.FC<PowerCrystalProps> = React.memo(({ onCrystalClick }) => {
  const { user, lastXpGainTimestamp, xpParticles, removeXpParticle } = useApp();
  const [isHovered, setIsHovered] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [prevXp, setPrevXp] = useState(user.xp);
  const crystalRef = useRef<HTMLDivElement>(null);
  const liquidRef = useRef<HTMLDivElement>(null);
  const bubbleIntervalRef = useRef<number | null>(null);
  const { width, height } = useWindowSize(); // Nadal używane do obliczania celu cząsteczek XP

  // Persystowane właściwości stylu dla kryształu (top, left, size w px)
  // Wartości początkowe będą nadpisane przez te z localStorage, jeśli istnieją
  const [crystalProps, setCrystalProps] = useLocalStorage('adhd-crystal-props', {
    top: 40, // Początkowa pozycja Y (w px, dostosowana do okręgu w holderze)
    left: 88, // Początkowa pozycja X (w px, dostosowana do okręgu w holderze)
    size: 144, // Początkowy rozmiar (w px, w-36 to 144px)
  });

  // Usunięto stany i logikę dla isDraggingCrystal, isResizingCrystal, crystalOffset, initialCrystalSize, initialMousePos
  // Usunięto stan editMode

  const [crystalCenter, setCrystalCenter] = useState(() => {
    if (typeof window !== 'undefined') {
      // Początkowe oszacowanie, zostanie zaktualizowane przez useLayoutEffect
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
  }, [crystalProps]);

  // Efekt dla animacji zysku XP (błysk)
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

  // Efekt do generowania bąbelków
  useEffect(() => {
    // Generuj bąbelki tylko jeśli xpProgress jest większy od 0 (lub minimalnej wartości)
    // Zapewniamy, że bąbelki pojawiają się, jeśli jest jakikolwiek płyn (min. 5%)
    if (Math.max(5, xpProgress * 100) > 0) {
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

  // Kolor kryształu (teraz zawsze żółty)
  const currentCrystalColor = 'from-yellow-400 to-amber-500';

  return (
    <div
      className="relative flex flex-col items-center justify-center w-full cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onCrystalClick}
    >
      {/* Usunięto przycisk trybu edycji */}

      {/* Główny kontener dla holdera i kryształu */}
      <div className="relative w-80 h-80 flex items-center justify-center">
        {/* Obraz holdera */}
        <img
          src="/holder.png"
          alt="Crystal Holder"
          className="absolute inset-0 w-full h-full object-contain z-30 filter-white-image"
        />

        {/* Kula Kryształu */}
        <div
          ref={crystalRef}
          className={`absolute rounded-full overflow-hidden shadow-lg transition-all duration-300
            bg-gradient-to-br ${currentCrystalColor}
            ${isFlashing ? 'animate-crystal-flash' : ''}
            z-20
            `}
          style={{
            top: crystalProps.top,
            left: crystalProps.left,
            width: crystalProps.size,
            height: crystalProps.size,
            boxShadow: 'inset 0 0 15px rgba(255,255,255,0.5), 0 0 20px rgba(0,0,0,0.5)',
            border: '2px solid rgba(255,255,255,0.2)'
          }}
          // Usunięto onMouseDown={handleMouseDownCrystal}
        >
          {/* Usunięto metalową obudowę */}
          {/* Wypełnienie płynem */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-500 to-yellow-400 transition-all duration-300 ease-out animate-liquid-wave z-20"
            style={{
              height: `${Math.max(5, xpProgress * 100)}%`, // Minimalna wysokość 5%
              boxShadow: '0 0 15px rgba(255,165,0,0.7)', // Pomarańczowy blask
            }}
            ref={liquidRef} // Dołącz ref do elementu płynu
          >
            {/* Bąbelki będą dodawane dynamicznie przez JavaScript */}
          </div>
          {/* Numer poziomu */}
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <span className="text-white text-4xl font-bold drop-shadow-lg">
              {user.level}
            </span>
          </div>

          {/* Usunięto uchwyt do zmiany rozmiaru */}
        </div>
      </div>

      {/* Informacje o XP na najechanie myszką */}
      <div
        className={`absolute -top-10 bg-gray-700 text-white text-sm px-3 py-1 rounded-md shadow-md transition-opacity duration-200 whitespace-nowrap ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        {xpInCurrentLevel}/{xpForNextLevel} XP
      </div>

      {/* Animacja cząsteczek XP */}
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