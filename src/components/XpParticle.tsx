import React, { useEffect, useState } from 'react';

interface XpParticleProps {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  onComplete: () => void;
}

export const XpParticle: React.FC<XpParticleProps> = ({ startX, startY, targetX, targetY, onComplete }) => {
  const [position, setPosition] = useState({ x: startX, y: startY });
  const [opacity, setOpacity] = useState(1);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const duration = 800; // milisekundy
    const startTime = performance.now();

    const animate = (currentTime: DOMHighResTimeStamp) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1); // Ogranicz postęp między 0 a 1

      // Liniowa interpolacja dla pozycji
      const currentX = startX + (targetX - startX) * progress;
      const currentY = startY + (targetY - startY) * progress;
      setPosition({ x: currentX, y: currentY });

      // Zanikanie i zmniejszanie skali
      setOpacity(1 - progress);
      setScale(1 - 0.5 * progress); // Zmniejsz do 0.5 oryginalnego rozmiaru

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    requestAnimationFrame(animate);

    return () => {
      // Czyszczenie, jeśli komponent zostanie odmontowany przed zakończeniem animacji
    };
  }, [startX, startY, targetX, targetY, onComplete]);

  return (
    <div
      className="fixed w-4 h-4 bg-yellow-400 rounded-full z-50 pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        opacity: opacity,
        transform: `translate(-50%, -50%) scale(${scale})`, // Wyśrodkuj kulkę i zastosuj skalę
        transition: 'none', // Upewnij się, że nie ma domyślnych przejść CSS
      }}
    />
  );
};