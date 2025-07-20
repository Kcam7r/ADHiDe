import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useApp } from '../contexts/AppContext';

interface PowerCrystalProps {
  onCrystalClick: () => void;
}

export const PowerCrystal: React.FC<PowerCrystalProps> = React.memo(({ onCrystalClick }) => {
  const { user, lastXpGainTimestamp, setCrystalPosition, dailyXpGain } = useApp();
  const [isHovered, setIsHovered] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [prevXp, setPrevXp] = useState(user.xp);
  const [prevLevel, setPrevLevel] = useState(user.level);
  const [activeBubbles, setActiveBubbles] = useState<Array<{ id: string; size: number; left: number; driftX: number; delay: number }>>([]);
  
  const crystalRef = useRef<HTMLDivElement>(null);
  const levelNumberRef = useRef<HTMLDivElement>(null);
  const liquidRef = useRef<HTMLDivElement>(null);

  const containerWidth = 300; 
  const crystalSize = 114; 
  const xpForNextLevel = 1000;
  const xpInCurrentLevel = user.xp % xpForNextLevel;
  const xpProgress = xpInCurrentLevel / xpForNextLevel;
  const xpPercentage = Math.round(xpProgress * 100);

  // Stała liczba bąbelków tła
  const CONTINUOUS_BUBBLE_COUNT = 5; 

  useLayoutEffect(() => {
    if (levelNumberRef.current) {
      const rect = levelNumberRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      setCrystalPosition({ x: centerX, y: centerY });
    }
  }, [setCrystalPosition, user.level]);

  useEffect(() => {
    let flashTimer: number | undefined;
    let reflectionTimer: number | undefined;

    if (lastXpGainTimestamp > 0 && user.xp > prevXp) {
      setIsFlashing(true);
      setShowReflection(true);

      flashTimer = setTimeout(() => {
        setIsFlashing(false);
      }, 500);

      reflectionTimer = setTimeout(() => {
        setShowReflection(false);
      }, 2000);

      // Generowanie bąbelków XP
      const xpGained = user.xp - prevXp;
      const numberOfNewBubbles = Math.max(1, Math.floor(xpGained / 10)); // 1 bąbelek na każde 10 XP

      const newBubbles = Array.from({ length: numberOfNewBubbles }).map((_, i) => {
        const bubbleId = `${Date.now()}-${i}-${Math.random()}`;
        const bubbleSize = Math.random() * (10 - 4) + 4; // Rozmiar między 4px a 10px
        const bubbleLeft = Math.random() * 90 + 5; // Pozycja między 5% a 95%
        const bubbleDriftX = (Math.random() - 0.5) * 20; // Dryf między -10px a 10px
        const bubbleDelay = Math.random() * 0.5; // Niewielkie losowe opóźnienie dla efektu rozłożenia

        return {
          id: bubbleId,
          size: bubbleSize,
          left: bubbleLeft,
          driftX: bubbleDriftX,
          delay: bubbleDelay,
        };
      });

      setActiveBubbles(prev => [...prev, ...newBubbles]);

      // Usuwanie bąbelków po zakończeniu ich animacji (2 sekundy + opóźnienie)
      newBubbles.forEach(bubble => {
        setTimeout(() => {
          setActiveBubbles(prev => prev.filter(b => b.id !== bubble.id));
        }, 2000 + bubble.delay * 1000); 
      });
    }
    setPrevXp(user.xp);
    setPrevLevel(user.level);

    return () => {
      if (flashTimer) clearTimeout(flashTimer);
      if (reflectionTimer) clearTimeout(reflectionTimer);
    };
  }, [lastXpGainTimestamp, user.xp, prevXp, user.level, prevLevel]);

  const holderImageBottom = 0; 
  const crystalBottom = 91; // Zmieniono z 92 na 91

  const horizontalOffset = 1.5; 

  const auraIntensity = Math.min(1, dailyXpGain / 500);
  const auraColor = `rgba(255, 165, 0, ${auraIntensity * 0.8})`;
  const auraShadow = `0 0 ${5 + auraIntensity * 15}px ${auraColor}, inset 0 0 ${2 + auraIntensity * 5}px rgba(255,255,255,${auraIntensity * 0.5})`;

  return (
    <div
      className="relative flex flex-col items-center justify-end w-full select-none group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Główny kontener dla kryształu i holdera */}
      <div 
        className="relative flex items-center justify-center group-hover:scale-105 transition-transform duration-300 ease-out"
        style={{ width: `${containerWidth}px`, height: 'auto', minHeight: '250px' }}
      >
        {/* Informacje o XP na najechanie myszką */}
        <div
          className={`absolute -top-10 bg-gray-700 text-white text-sm px-3 py-1 rounded-md shadow-md transition-opacity duration-200 whitespace-nowrap ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          {xpPercentage}%
        </div>

        {/* Holder Image (holder4.png) */}
        <img
          src="/holder4.png" 
          alt="Crystal Holder" 
          className={`absolute z-[30] transition-all duration-300 ease-out
            filter-dark-green-base
            ${isHovered ? 'filter-dark-green-hover' : ''}
          `}
          style={{ 
            bottom: holderImageBottom, 
            left: '2.5%', 
            width: '95%', 
            height: 'auto', 
            pointerEvents: 'none', 
          }}
        />

        {/* Kula Kryształu */}
        <div
          ref={crystalRef}
          onClick={onCrystalClick}
          className={`absolute rounded-full shadow-lg transition-all duration-300 cursor-pointer
            ${isFlashing ? 'animate-crystal-flash' : ''}
            z-[35] flex items-center justify-center
            bg-white bg-opacity-15
            group-hover:shadow-xl group-hover:border-cyan-400 group-hover:bg-opacity-20
            ${dailyXpGain > 0 ? 'animate-crystal-aura-pulse' : ''}
            `}
          style={{
            bottom: crystalBottom,
            left: (containerWidth - crystalSize) / 2 + horizontalOffset,
            width: crystalSize,
            height: crystalSize,
            boxShadow: auraShadow,
            border: '2px solid rgba(255,255,255,0.2)',
            overflow: 'hidden', 
            borderRadius: '50%'
          }}
        >
          {/* Simulated Holder Reflection/Shadow on Crystal */}
          <div
            className="absolute bottom-0 left-0 right-0 h-1/2 rounded-b-full"
            style={{
              background: 'radial-gradient(ellipse at bottom, rgba(0,0,0,0.3) 0%, transparent 70%)',
              zIndex: 25,
            }}
          ></div>

          {/* Light Reflection Effect */}
          {(isHovered || showReflection) && (
            <div 
              className={`absolute inset-0 rounded-full ${isHovered ? 'animate-crystal-reflection-hover' : ''} ${showReflection ? 'animate-crystal-reflection-xp' : ''}`}
              style={{
                background: 'radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
                maskImage: 'radial-gradient(circle, white 50%, transparent 70%)',
                WebkitMaskImage: 'radial-gradient(circle, white 50%, transparent 70%)',
                opacity: isHovered ? 0.7 : 1,
              }}
            ></div>
          )}

          <div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-500 to-yellow-400 transition-all duration-300 ease-out animate-liquid-wave z-20"
            style={{
              height: `${Math.max(5, xpProgress * 100)}%`,
              boxShadow: '0 0 15px rgba(255,165,0,0.7), inset 0 2px 5px rgba(255,255,255,0.3)',
            }}
            ref={liquidRef}
          >
            {/* Stałe bąbelki tła */}
            {Array.from({ length: CONTINUOUS_BUBBLE_COUNT }).map((_, i) => (
              <div
                key={`continuous-bubble-${i}`}
                className="xp-bubble xp-bubble-continuous"
                style={{
                  width: `${Math.random() * (8 - 3) + 3}px`, // Mniejszy zakres rozmiarów
                  height: `${Math.random() * (8 - 3) + 3}px`,
                  left: `${Math.random() * 90 + 5}%`,
                  animationDelay: `${Math.random() * 5}s`, // Dłuższe losowe opóźnienie
                  '--bubble-duration': `${Math.random() * (8 - 5) + 5}s`, // Wolniejsza animacja
                  '--bubble-drift-x': `${(Math.random() - 0.5) * 10}px`, // Mniejszy dryf
                } as React.CSSProperties}
              />
            ))}

            {/* Bąbelki XP (wybuchowe) */}
            {activeBubbles.map(bubble => (
              <div
                key={bubble.id}
                className="xp-bubble" // Ta klasa będzie używać animacji 'bubble-rise'
                style={{
                  width: `${bubble.size}px`,
                  height: `${bubble.size}px`,
                  left: `${bubble.left}%`,
                  animationDelay: `${bubble.delay}s`,
                  '--bubble-duration': `2s`, // Jawnie ustawiony czas trwania dla bąbelków wybuchowych
                  '--bubble-drift-x': `${bubble.driftX}px`, 
                } as React.CSSProperties}
              />
            ))}
          </div>
          <div ref={levelNumberRef} className="absolute inset-0 flex items-center justify-center text-white text-3xl font-bold z-30 font-indie-flower">
            {user.level}
          </div>
        </div>
      </div>
    </div>
  );
});