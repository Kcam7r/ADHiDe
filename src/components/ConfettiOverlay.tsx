import React, { useEffect, useState, useRef } from 'react';
import Confetti from 'react-confetti';
import { useApp } from '../contexts/AppContext';
import { useWindowSize } from '../hooks/useWindowSize';

export const ConfettiOverlay: React.FC = () => {
  const { confettiKey } = useApp(); // Zmieniono na confettiKey
  const [showConfetti, setShowConfetti] = useState(false);
  const prevConfettiKeyRef = useRef(confettiKey); // Nowa referencja do śledzenia poprzedniego klucza
  const { width, height } = useWindowSize();

  // Usunięto useEffect zależny od user.level, aby konfetti było wyzwalane tylko przez triggerConfetti

  useEffect(() => {
    // Wyzwalaj konfetti tylko jeśli confettiKey się zmienił i nie jest to początkowe 0
    if (confettiKey > 0 && confettiKey !== prevConfettiKeyRef.current) {
      setShowConfetti(true);
      // Resetuj stan konfetti po krótkim czasie, aby umożliwić ponowne wywołanie
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 2000); // Czas trwania konfetti
      return () => clearTimeout(timer);
    }
    prevConfettiKeyRef.current = confettiKey; // Zaktualizuj poprzedni klucz
  }, [confettiKey]); // Zależność od confettiKey

  const handleConfettiComplete = () => {
    setShowConfetti(false); // Ukryj komponent tylko, gdy wszystkie kawałki znikną
  };

  if (!showConfetti) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <Confetti
        width={width}
        height={height}
        recycle={false} // Generate a fixed number of pieces once
        numberOfPieces={1500} // Significantly more pieces for a bigger burst
        gravity={0.08} // Slightly increased gravity for a more natural fall
        initialVelocityX={{ min: -15, max: 15 }} // Wider horizontal spread
        initialVelocityY={{ min: -30, max: -15 }} // Stronger initial upward velocity
        confettiSource={{
          x: 0, // Start from left edge
          y: height, // Start from the very bottom
          w: width, // Spread across the entire width
          h: 0, // A thin line at the bottom for the source
        }}
        onConfettiComplete={handleConfettiComplete} // Callback when all pieces are off screen
      />
    </div>
  );
};