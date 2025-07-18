import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useApp } from '../contexts/AppContext';
// Usunięto import XpParticle, ponieważ nie będzie już renderowany bezpośrednio tutaj
// Usunięto import useLocalStorage

interface PowerCrystalProps {
  onCrystalClick: () => void;
}

export const PowerCrystal: React.FC<PowerCrystalProps> = React.memo(({ onCrystalClick }) => {
  const { user, lastXpGainTimestamp, addXP, resetXP } = useApp(); // Usunięto xpParticles, removeXpParticle
  const [isHovered, setIsHovered] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [prevXp, setPrevXp] = useState(user.xp);
  const [prevLevel, setPrevLevel] = useState(user.level); // Nowy stan do śledzenia poprzedniego poziomu
  const crystalRef = useRef<HTMLDivElement>(null);
  const liquidRef = useRef<HTMLDivElement>(null);
  // Usunięto bubbleIntervalRef, ponieważ bąbelki będą zarządzane przez inny komponent
  // Usunięto powerCrystalContainerRef, ponieważ bąbelki będą zarządzane przez inny komponent

  // Stałe właściwości stylu dla kryształu, teraz kontrolowane przez rodzica
  const crystalSize = 105; // Rozmiar kryształu - Zmieniono ze 100 na 105
  const crystalTop = 96.5; // Pozycja Y wewnątrz holdera - Dostosowano dla wyśrodkowania
  const crystalLeft = 59.5; // Pozycja X wewnątrz holdera - Dostosowano dla wyśrodkowania

  // Usunięto crystalCenter i useLayoutEffect, ponieważ cząsteczki XP będą renderowane globalnie
  // i nie potrzebują dokładnego centrum kryształu jako celu.
  // Zamiast tego, PowerCrystal będzie przekazywać swoje centrum do addXP,
  // a XpBubblesOverlay będzie używać tych danych do animacji.

  // Efekt dla animacji zysku XP (błysk) i awansu na poziom
  useEffect(() => {
    let flashTimer: number | undefined;
    // Błysk przy zysku XP
    if (lastXpGainTimestamp > 0 && user.xp > prevXp) {
      setIsFlashing(true);
      flashTimer = setTimeout(() => setIsFlashing(false), 500);
    }
    setPrevXp(user.xp);

    setPrevLevel(user.level); // Aktualizujemy poprzedni poziom

    return () => {
      if (flashTimer) clearTimeout(flashTimer);
    };
  }, [lastXpGainTimestamp, user.xp, prevXp, user.level, prevLevel]); // Dodano user.level i prevLevel do zależności

  // Obliczenia dla wyświetlania XP i poziomu
  const xpForNextLevel = 1000; // Każdy poziom wymaga 1000 XP
  const xpInCurrentLevel = user.xp % xpForNextLevel;
  const xpProgress = xpInCurrentLevel / xpForNextLevel;

  // Usunięto useEffect do generowania bąbelków

  // Obliczenia dla okrągłej podstawy
  const baseSize = crystalSize + 10; // 10px większa niż kryształ
  const baseTop = crystalTop - 5; // Przesunięcie w górę o 5px
  const baseLeft = crystalLeft - 5; // Przesunięcie w lewo o 5px

  const handleCrystalClick = (e: React.MouseEvent) => {
    // Przekazujemy pozycję kliknięcia do funkcji addXP, aby cząsteczki mogły stamtąd wylecieć
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = rect.x + rect.width / 2; // Używamy centrum kryształu jako punktu startowego
    const clickY = rect.y + rect.height / 2;
    
    // Zamiast resetXP, wywołujemy onCrystalClick, który jest propsem
    // onCrystalClick może wywołać resetXP lub inną logikę w Sidebar
    onCrystalClick();
  };

  return (
    <div
      className="relative flex flex-col items-center justify-end w-full cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCrystalClick} // Zmieniono na handleCrystalClick
    >
      {/* Główny kontener dla kryształu i holdera */}
      <div 
        className="relative w-56 h-[300px] flex items-center justify-center"
      >
        {/* Holder Image (holder2.png) - teraz zaczyna się w tym samym miejscu co holder3.png */}
        <img
          src="/holder2.png" 
          alt="Crystal Holder Duplicate"
          className="absolute w-[200px] h-[250px] z-[6] filter-white-invert"
          style={{ top: 35, left: 12 }}
        />

        {/* Nowy element holder3.png */}
        <img
          src="/holder3.png" 
          alt="Crystal Holder Top"
          className="absolute w-[200px] h-[100px] z-[25] filter-white-invert" // Zmieniono z-index na z-[25]
          style={{ top: 22, left: 12 }}
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
          className={`absolute rounded-full shadow-lg transition-all duration-300
            ${isFlashing ? 'animate-crystal-flash' : ''}
            z-20 flex items-center justify-center
            bg-white bg-opacity-15
            `}
          style={{
            top: crystalTop,
            left: crystalLeft,
            width: crystalSize,
            height: crystalSize,
            boxShadow: 'inset 0 0 15px rgba(255,255,255,0.5), 0 0 20px rgba(0,0,0,0.5)',
            border: '2px solid rgba(255,255,255,0.2)',
            overflow: 'hidden', // PRZYWRÓCONE: Zapewnia, że zawartość wewnątrz kryształu jest obcinana do okręgu
            borderRadius: '50%' // Dodatkowe zabezpieczenie dla okrągłego kształtu
          }}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-500 to-yellow-400 transition-all duration-300 ease-out animate-liquid-wave z-20"
            style={{
              height: `${Math.max(5, xpProgress * 100)}%`, // Minimalna wysokość 5%
              boxShadow: '0 0 15px rgba(255,165,0,0.7)', // Pomarańczowy blask
            }}
            ref={liquidRef} // Dołącz ref do elementu płynu
          >
          </div>
          {/* Poziom XP - zmieniono pozycjonowanie na absolutne i wyśrodkowane */}
          <div className="absolute inset-0 flex items-center justify-center text-white text-3xl font-bold z-30 font-indie-flower">
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

        {/* Usunięto Animację cząsteczek XP stąd */}
      </div>
    </div>
  );
});