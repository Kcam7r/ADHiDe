import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useApp } from '../contexts/AppContext';

interface PowerCrystalProps {
  onCrystalClick: () => void;
}

export const PowerCrystal: React.FC<PowerCrystalProps> = React.memo(({ onCrystalClick }) => {
  const { user, lastXpGainTimestamp, setCrystalPosition, dailyXpGain } = useApp(); // Dodano dailyXpGain
  const [isHovered, setIsHovered] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [showReflection, setShowReflection] = useState(false); // State for reflection animation
  const [prevXp, setPrevXp] = useState(user.xp);
  const [prevLevel, setPrevLevel] = useState(user.level);
  const crystalRef = useRef<HTMLDivElement>(null);
  const levelNumberRef = useRef<HTMLDivElement>(null);
  const liquidRef = useRef<HTMLDivElement>(null);

  // Stałe właściwości stylu dla kryształu, teraz kontrolowane przez rodzica
  const crystalSize = 95; 
  const crystalTop = 107.5; 
  const crystalLeft = 64.5; 

  const xpForNextLevel = 1000;
  const xpInCurrentLevel = user.xp % xpForNextLevel;
  const xpProgress = xpInCurrentLevel / xpForNextLevel;

  // Liczba bąbelków do animacji - dynamiczna, zależna od postępu XP
  // Minimum 5 bąbelków, maksimum 25 (5 + 20 * 1.0)
  const dynamicNumberOfBubbles = Math.max(5, Math.floor(xpProgress * 20) + 5); 

  // Generowanie właściwości bąbelków raz przy renderowaniu komponentu
  const bubbles = React.useMemo(() => {
    return Array.from({ length: dynamicNumberOfBubbles }).map((_, i) => ({
      id: `bubble-${i}-${Date.now()}`, // Dodano Date.now() dla unikalności klucza
      size: Math.random() * (10 - 4) + 4, // Rozmiar od 4px do 10px
      left: Math.random() * 90 + 5, // Pozycja pozioma od 5% do 95%
      delay: Math.random() * 3, // Opóźnienie animacji do 3 sekund
      duration: Math.random() * (5 - 2) + 2, // Czas trwania animacji od 2 do 5 sekund
      startBottomPercentage: Math.random() * 100, // Losowa pozycja startowa w pionie (0-100% wysokości płynu)
    }));
  }, [dynamicNumberOfBubbles]); // Zależność od dynamicznej liczby bąbelków

  // useLayoutEffect do pobierania pozycji cyfry poziomu
  useLayoutEffect(() => {
    if (levelNumberRef.current) {
      const rect = levelNumberRef.current.getBoundingClientRect();
      // Oblicz środek cyfry poziomu
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      setCrystalPosition({ x: centerX, y: centerY });
    }
  }, [setCrystalPosition, user.level]);

  // Efekt dla animacji zysku XP (błysk) i awansu na poziom
  useEffect(() => {
    let flashTimer: number | undefined;
    let reflectionTimer: number | undefined; // New timer for reflection

    // Błysk przy zysku XP
    if (lastXpGainTimestamp > 0 && user.xp > prevXp) {
      setIsFlashing(true);
      setShowReflection(true); // Trigger reflection on XP gain

      flashTimer = setTimeout(() => {
        setIsFlashing(false);
      }, 500); // Duration of crystal-flash

      reflectionTimer = setTimeout(() => {
        setShowReflection(false); // Hide reflection after its animation duration
      }, 2000); // Duration of crystal-reflection-xp animation

    }
    setPrevXp(user.xp);
    setPrevLevel(user.level);

    return () => {
      if (flashTimer) clearTimeout(flashTimer);
      if (reflectionTimer) clearTimeout(reflectionTimer);
    };
  }, [lastXpGainTimestamp, user.xp, prevXp, user.level, prevLevel]);

  // Obliczenia dla okrągłej podstawy
  const baseSize = crystalSize + 10; 
  const baseTop = crystalTop - 5; 
  const baseLeft = crystalLeft - 5; 

  const handleCrystalClick = (e: React.MouseEvent) => {
    onCrystalClick();
  };

  // Obliczanie intensywności aury na podstawie dailyXpGain
  const auraIntensity = Math.min(1, dailyXpGain / 500); // Max intensywność przy 500 XP
  const auraColor = `rgba(255, 165, 0, ${auraIntensity * 0.8})`; // Bursztynowy kolor
  const auraShadow = `0 0 ${5 + auraIntensity * 15}px ${auraColor}, inset 0 0 ${2 + auraIntensity * 5}px rgba(255,255,255,${auraIntensity * 0.5})`;

  return (
    <div
      className="relative flex flex-col items-center justify-end w-full cursor-pointer select-none group" // Added 'group' class
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCrystalClick}
    >
      {/* Główny kontener dla kryształu i holdera */}
      <div 
        className="relative w-56 h-[300px] flex items-center justify-center"
      >
        {/* Holder Image (holder4.png) */}
        <img
          src="/holder4.png" 
          alt="Crystal Holder"
          className="absolute z-[6]" 
          style={{ 
            top: 15, 
            left: -43, // Dostosowana pozycja left
            width: 390, // Delikatnie powiększona szerokość
          }}
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

        {/* Kula Kryształu (teraz przez przezroczysta z efektem szkła) */}
        <div
          ref={crystalRef}
          className={`absolute rounded-full shadow-lg transition-all duration-300
            ${isFlashing ? 'animate-crystal-flash' : ''}
            z-20 flex items-center justify-center
            bg-white bg-opacity-15
            group-hover:shadow-xl group-hover:border-cyan-400 group-hover:bg-opacity-20
            ${dailyXpGain > 0 ? 'animate-crystal-aura-pulse' : ''}
            `} // Dodano klasę animacji aury
          style={{
            top: crystalTop,
            left: crystalLeft,
            width: crystalSize,
            height: crystalSize,
            boxShadow: auraShadow, // Dynamiczny box-shadow dla aury
            border: '2px solid rgba(255,255,255,0.2)',
            overflow: 'hidden', // Kluczowe dla ukrycia bąbelków poza płynem
            borderRadius: '50%'
          }}
        >
          {/* Simulated Holder Reflection/Shadow on Crystal */}
          <div
            className="absolute bottom-0 left-0 right-0 h-1/2 rounded-b-full"
            style={{
              background: 'radial-gradient(ellipse at bottom, rgba(0,0,0,0.3) 0%, transparent 70%)',
              zIndex: 25, // Above liquid, below level number
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
              boxShadow: '0 0 15px rgba(255,165,0,0.7), inset 0 2px 5px rgba(255,255,255,0.3)', // Added inner shadow for meniscus
            }}
            ref={liquidRef}
          >
            {/* Bąbelki XP */}
            {bubbles.map(bubble => (
              <div
                key={bubble.id}
                className="xp-bubble"
                style={{
                  width: `${bubble.size}px`,
                  height: `${bubble.size}px`,
                  left: `${bubble.left}%`,
                  animationDelay: `${bubble.delay}s`,
                  animationDuration: `${bubble.duration}s`,
                  bottom: `${bubble.startBottomPercentage}%`, // Ustawienie losowej pozycji startowej
                  '--bubble-start-bottom': `${bubble.startBottomPercentage}%`, // Przekazanie zmiennej CSS
                  '--bubble-end-opacity': `${Math.random() * 0.8 + 0.2}`, // Random end opacity for varied glow
                } as React.CSSProperties}
              />
            ))}
          </div>
          {/* Poziom XP - zmieniono pozycjonowanie na absolutne i wyśrodkowane */}
          <div ref={levelNumberRef} className="absolute inset-0 flex items-center justify-center text-white text-3xl font-bold z-30 font-indie-flower">
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
      </div>
    </div>
  );
});