import React, { useEffect, useState, useRef } from 'react';

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
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const duration = 800; // milisekundy
    const delay = Math.random() * 200; // Losowe opóźnienie do 200ms dla rozłożonego startu
    const startTimeRef = useRef<DOMHighResTimeStamp | null>(null);

    // Oblicz punkt kontrolny dla kwadratowej krzywej Beziera
    // To sprawi, że kulki będą lekko zakrzywiać swoją trajektorię
    const midX = (startX + targetX) / 2;
    const midY = (startY + targetY) / 2;

    // Dodaj losowe przesunięcie do punktu kontrolnego, aby stworzyć unikalne krzywe
    const curveOffsetX = (Math.random() - 0.5) * 150; // Odchylenie poziome
    const curveOffsetY = (Math.random() - 0.5) * 150 - 50; // Odchylenie pionowe, z lekkim biasem w górę

    const controlX = midX + curveOffsetX;
    const controlY = midY + curveOffsetY;

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

      // Obliczenia pozycji za pomocą kwadratowej krzywej Beziera
      const currentX = (1 - animationProgress) * (1 - animationProgress) * startX + 
                       2 * (1 - animationProgress) * animationProgress * controlX + 
                       animationProgress * animationProgress * targetX;
      const currentY = (1 - animationProgress) * (1 - animationProgress) * startY + 
                       2 * (1 - animationProgress) * animationProgress * controlY + 
                       animationProgress * animationProgress * targetY;
      
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
};