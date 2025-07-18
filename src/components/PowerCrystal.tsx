import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { XpParticle } from './XpParticle';
import { useWindowSize } from '../hooks/useWindowSize';
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
  const { width, height } = useWindowSize();

  // Persystowane właściwości stylu dla kryształu (top, left, size w px)
  // Wartości początkowe będą nadpisane przez te z localStorage, jeśli istnieją
  const [crystalProps, setCrystalProps] = useLocalStorage('adhd-crystal-props', {
    top: 147, // Zaktualizowano dla nowego rozmiaru kontenera (384px - 90px) / 2 = 147
    left: 147, // Zaktualizowano dla nowego rozmiaru kontenera
    size: 90, // Zwiększono rozmiar kryształu
  });

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

  // Obliczenia dla okrągłej podstawy
  const baseSize = crystalProps.size + 10; // 10px większa niż kryształ
  const baseTop = crystalProps.top - 5; // Przesunięcie w górę o 5px
  const baseLeft = crystalProps.left - 5; // Przesunięcie w lewo o 5px

  return (
    <div
      className="relative flex flex-col items-center justify-center w-full cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onCrystalClick}
    >
      {/* Główny kontener dla kryształu i holdera - zmieniono na w-96 h-96 */}
      <div className="relative w-96 h-96 flex items-center justify-center">
        {/* Holder Image - teraz w pełni w kontenerze */}
        <img
          src="/holder.png"
          alt="Crystal Holder"
          className="absolute w-full h-auto bottom-0 left-1/2 -translate-x-1/2 z-5 filter-tree-color"
        />

        {/* Nowy element pod kryształem mocy (okrągła podstawa) */}
        <div
          className="absolute rounded-full bg-gray-800 z-10"
          style={{
            top: baseTop,
            left: baseLeft,
            width: baseSize,
            height: baseSize,
          }}
        ></div>

        {/* Kula Kryształu (teraz przezroczysta z efektem szkła) */}
        <div
          ref={crystalRef}
          className={`absolute rounded-full overflow-hidden shadow-lg transition-all duration-300
            ${isFlashing ? 'animate-crystal-flash' : ''}
            z-20 flex items-center justify-center
            bg-white bg-opacity-15
            `}
          style={{
            top: crystalProps.top,
            left: crystalProps.left,
            width: crystalProps.size,
            height: crystalProps.size,
            boxShadow: 'inset 0 0 15px rgba(255,255,255,0.5), 0 0 20px rgba(0,0,0,0.5)',
            border: '2px solid rgba(255,255,255,0.2)'
          }}
        >
          {/* Wypełnienie płynem (żółte) */}
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
          {/* Wyświetlanie poziomu W ŚRODKU kryształu */}
          <div className="relative text-white text-3xl font-bold z-30 font-indie-flower">
            {user.level}
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
    </div>
  );
});