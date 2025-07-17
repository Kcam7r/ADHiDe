import React, { useEffect, useState, useRef } from 'react';
import Confetti from 'react-confetti';
import { useApp } from '../contexts/AppContext';
import { useWindowSize } from '../hooks/useWindowSize';

export const ConfettiOverlay: React.FC = () => {
  const { user } = useApp();
  const [showConfetti, setShowConfetti] = useState(false);
  const prevLevelRef = useRef(user.level);
  const { width, height } = useWindowSize();

  useEffect(() => {
    // Trigger confetti only if the level has increased
    if (user.level > prevLevelRef.current) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 4000); // Show confetti for 4 seconds
      return () => clearTimeout(timer);
    }
    // Update previous level for the next comparison
    prevLevelRef.current = user.level;
  }, [user.level]);

  if (!showConfetti) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <Confetti
        width={width}
        height={height}
        recycle={false} // Only fire once per trigger
        numberOfPieces={700} // Zwiększona liczba kawałków konfetti
        gravity={0.05} // Zmniejszona grawitacja, aby spadały wolniej
        initialVelocityX={{ min: -10, max: 10 }} // Większy rozrzut poziomy
        initialVelocityY={{ min: -15, max: -8 }} // Większy początkowy impuls w górę
        confettiSource={{
          x: width / 2,
          y: height / 2,
          w: 0, // Źródło z centrum
          h: 0, // Źródło z centrum
        }}
      />
    </div>
  );
};