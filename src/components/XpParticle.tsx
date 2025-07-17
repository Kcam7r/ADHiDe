import React, { useEffect, useState, useRef } from 'react';

interface XpParticleProps {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  onComplete: () => void;
}

export const XpParticle: React.FC<XpParticleProps> = React.memo(({ startX, startY, targetX, targetY, onComplete }) => {
  const [position, setPosition] = useState({ x: startX, y: startY });
  const [opacity, setOpacity] = useState(1);
  const [scale, setScale] = useState(1);
  const animationFrameId = useRef<number | null>(null);
  const startTimeRef = useRef<DOMHighResTimeStamp | null>(null);

  useEffect(() => {
    const duration = 800; // milisekundy
    const delay = Math.random() * 200; // Losowe opóźnienie do 200ms dla rozłożonego startu
    
    const animate = (currentTime: DOMHighResTimeStamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsedTime = currentTime - startTimeRef.current;

      // Poczekaj na zakończenie opóźnienia
      if (elapsedTime < delay) {
        animationFrameId.current = requestAnimationFrame(animate);
        return;
      }

      const animationProgress = Math.min((elapsedTime - delay) / duration, 1);

      // Definiowanie punktu kontrolnego dla kwadratowej krzywej Beziera
      // P0 = (startX, startY)
      // P2 = (targetX, targetY)
      // P1 = (controlX, controlY)
      const controlX = startX + (targetX - startX) / 2 + (Math.random() - 0.5) * 150; // Środek X + losowe przesunięcie poziome
      const controlY = Math.min(startY, targetY) - 150 - (Math.random() * 100); // Powyżej najwyższego punktu + losowe przesunięcie pionowe

      // Obliczenia pozycji za pomocą kwadratowej krzywej Beziera
      const t = animationProgress;
      const oneMinusT = (1 - t);

      const currentX = oneMinusT * oneMinusT * startX + 
                       2 * oneMinusT * t * controlX + 
                       t * t * targetX;
      const currentY = oneMinusT * oneMinusT * startY + 
                       2 * oneMinusT * t * controlY + 
                       t * t * targetY;
      
      setPosition({ x: currentX, y: currentY });

      // Zanikanie i zmniejszanie skali w trakcie lotu
      setOpacity(1 - animationProgress);
      setScale(1 - 0.5 * animationProgress);

      if (animationProgress < 1) {
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
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
});