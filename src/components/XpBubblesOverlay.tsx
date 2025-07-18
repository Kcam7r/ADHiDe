import React, { useEffect, useRef, useLayoutEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { XpParticle } from './XpParticle';

export const XpBubblesOverlay: React.FC = () => {
  const { xpParticles, removeXpParticle } = useApp();
  const [crystalCenter, setCrystalCenter] = useState({ x: 0, y: 0 });
  const crystalRef = useRef<HTMLDivElement>(null); // Użyjemy tego refa do znalezienia pozycji kryształu

  // Użyj useLayoutEffect do pobrania pozycji kryształu po renderowaniu
  useLayoutEffect(() => {
    const updateCrystalCenter = () => {
      // Znajdź element kryształu w DOM
      const crystalElement = document.getElementById('power-crystal');
      if (crystalElement) {
        const rect = crystalElement.getBoundingClientRect();
        setCrystalCenter({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }
    };

    // Ustaw początkową pozycję
    updateCrystalCenter();

    // Dodaj listener na resize, aby aktualizować pozycję
    window.addEventListener('resize', updateCrystalCenter);
    return () => window.removeEventListener('resize', updateCrystalCenter);
  }, []);

  // Efekt do generowania bąbelków (teraz jako osobny komponent)
  useEffect(() => {
    let bubbleInterval: number | null = null;
    // Generuj bąbelki zawsze dla celów testowych
    if (true) { 
      if (!bubbleInterval) {
        bubbleInterval = setInterval(() => {
          // Sprawdź, czy crystalCenter jest już ustawione
          if (crystalCenter.x !== 0 && crystalCenter.y !== 0) {
            const bubble = document.createElement('div');
            bubble.className = 'babel';

            const size = Math.random() * 20 + 10; // Zwiększono rozmiar
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            
            // Pozycja startowa bąbelka wewnątrz kryształu, ale względem całego okna
            // Używamy crystalCenter jako punktu odniesienia
            const startX = crystalCenter.x + (Math.random() - 0.5) * 40; // Losowe przesunięcie wokół centrum X
            const startY = crystalCenter.y + 50; // Start nieco poniżej centrum Y kryształu

            bubble.style.left = `${startX}px`;
            bubble.style.top = `${startY}px`;

            const duration = Math.random() * 3 + 2;
            bubble.style.animationDuration = `${duration}s`;

            const driftX = Math.random() * 20 - 10;
            const driftXEnd = Math.random() * 20 - 10;
            
            bubble.style.setProperty('--bubble-drift-x', `${driftX}px`);
            bubble.style.setProperty('--bubble-drift-x-end', `${driftXEnd}px`);
            bubble.style.setProperty('--bubble-rise-height', `150px`); // Wysokość wznoszenia

            document.body.appendChild(bubble); // Dodajemy do body, aby nie były obcinane

            setTimeout(() => {
              bubble.remove();
            }, duration * 1000 + 50);
          }
        }, 300); // Zwiększono częstotliwość dla testów
      }
    } else {
      if (bubbleInterval) {
        clearInterval(bubbleInterval);
        bubbleInterval = null;
      }
      document.querySelectorAll('.babel').forEach(b => b.remove());
    }

    return () => {
      if (bubbleInterval) {
        clearInterval(bubbleInterval);
      }
    };
  }, [crystalCenter]); // Zależność od crystalCenter

  return (
    <>
      {/* Ten div jest tylko po to, aby PowerCrystal mógł znaleźć swój element w DOM */}
      <div id="power-crystal" ref={crystalRef} style={{ display: 'none' }}></div>

      {xpParticles.map(particle => (
        <XpParticle
          key={particle.id}
          startX={particle.startX}
          startY={particle.startY}
          targetX={crystalCenter.x} // Cząsteczki XP nadal lecą do centrum kryształu
          targetY={crystalCenter.y}
          onComplete={() => removeXpParticle(particle.id)}
        />
      ))}
    </>
  );
};